const { query, getClient } = require('../../config/database');
const { ApiError } = require('../../utils/ApiError');

const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

// POS অর্ডার তৈরি করুন
const createPOSOrder = async (data, userId) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const { items, customerId, storeId, sellerId, payments, notes, discount } = data;

    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await client.query('SELECT * FROM products WHERE id = $1', [item.productId]);
      if (product.rows.length === 0) throw new ApiError(404, `Product ${item.productId} not found`);

      const price = product.rows[0].price;
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;
      processedItems.push({
        ...item,
        price,
        productName: product.rows[0].name,
        sku: product.rows[0].sku,
        total: itemTotal,
      });
    }

    const total = subtotal - (discount || 0);

    const orderResult = await client.query(
      `INSERT INTO orders (order_number, type, status, customer_id, store_id, seller_id, subtotal, discount, total, notes, is_synced)
       VALUES ($1, 'pos', 'completed', $2, $3, $4, $5, $6, $7, $8, true) RETURNING *`,
      [generateOrderNumber(), customerId || null, storeId || null, sellerId || null, subtotal, discount || 0, total, notes || null]
    );

    const order = orderResult.rows[0];

    for (const item of processedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, sku, price, quantity, total)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [order.id, item.productId, item.productName, item.sku, item.price, item.quantity, item.total]
      );

      // স্টক কমান
      if (storeId) {
        await client.query(
          `UPDATE inventory SET quantity = quantity - $1 WHERE store_id = $2 AND product_id = $3 AND quantity >= $1`,
          [item.quantity, storeId, item.productId]
        );
      }

      // কমিশন তৈরি করুন
      if (sellerId) {
        const commissionRate = 2.5;
        const commissionAmount = (item.total * commissionRate) / 100;
        const orderItemResult = await client.query(
          'SELECT id FROM order_items WHERE order_id = $1 AND product_id = $2 ORDER BY created_at DESC LIMIT 1',
          [order.id, item.productId]
        );
        if (orderItemResult.rows.length > 0) {
          await client.query(
            `INSERT INTO seller_commissions (seller_id, order_id, order_item_id, sale_amount, commission_rate, commission_amount)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [sellerId, order.id, orderItemResult.rows[0].id, item.total, commissionRate, commissionAmount]
          );
        }
      }
    }

    // পেমেন্ট রেকর্ড করুন
    if (payments && payments.length > 0) {
      for (const payment of payments) {
        await client.query(
          `INSERT INTO order_payments (order_id, method, amount, reference)
           VALUES ($1, $2, $3, $4)`,
          [order.id, payment.method, payment.amount, payment.reference || null]
        );
      }
    }

    // Customer stats আপডেট করুন
    if (customerId) {
      await client.query(
        `UPDATE customers SET total_orders = total_orders + 1, total_spent = total_spent + $1 WHERE id = $2`,
        [total, customerId]
      );
    }

    await client.query('COMMIT');
    return { ...order, items: processedItems };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// Online অর্ডার তৈরি করুন
const createOnlineOrder = async (data, customerId) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const { items, deliveryAddress, notes } = data;
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await client.query('SELECT * FROM products WHERE id = $1 AND is_active = true', [item.productId]);
      if (product.rows.length === 0) throw new ApiError(404, `Product not found`);
      
      const price = product.rows[0].price;
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;
      processedItems.push({ ...item, price, productName: product.rows[0].name, sku: product.rows[0].sku, total: itemTotal });
    }

    const deliveryCharge = subtotal > 1000 ? 0 : 60;
    const total = subtotal + deliveryCharge;

    const orderResult = await client.query(
      `INSERT INTO orders (order_number, type, status, customer_id, subtotal, delivery_charge, total, notes, delivery_address, delivery_status)
       VALUES ($1, 'online', 'pending', $2, $3, $4, $5, $6, $7, 'processing') RETURNING *`,
      [generateOrderNumber(), customerId, subtotal, deliveryCharge, total, notes || null, JSON.stringify(deliveryAddress)]
    );

    const order = orderResult.rows[0];

    for (const item of processedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, sku, price, quantity, total)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [order.id, item.productId, item.productName, item.sku, item.price, item.quantity, item.total]
      );
    }

    await client.query('COMMIT');
    return { ...order, items: processedItems };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// Offline অর্ডার sync করুন
const syncOfflineOrder = async (offlineData, userId) => {
  const existingOrder = await query(
    'SELECT id FROM orders WHERE offline_id = $1',
    [offlineData.offlineId]
  );

  if (existingOrder.rows.length > 0) {
    return { ...existingOrder.rows[0], alreadySynced: true };
  }

  const order = await createPOSOrder({ ...offlineData, is_synced: false }, userId);
  await query('UPDATE orders SET is_synced = true, offline_id = $1 WHERE id = $2', [offlineData.offlineId, order.id]);
  
  return order;
};

// অর্ডার তালিকা
const getOrders = async ({ page = 1, per_page = 20, status, type, store_id, customer_id, from_date, to_date }) => {
  const limit = Math.min(parseInt(per_page), 100);
  const offset = (parseInt(page) - 1) * limit;

  let conditions = [];
  let params = [];
  let idx = 1;

  if (status) { conditions.push(`o.status = $${idx++}`); params.push(status); }
  if (type) { conditions.push(`o.type = $${idx++}`); params.push(type); }
  if (store_id) { conditions.push(`o.store_id = $${idx++}`); params.push(store_id); }
  if (customer_id) { conditions.push(`o.customer_id = $${idx++}`); params.push(customer_id); }
  if (from_date) { conditions.push(`o.created_at >= $${idx++}`); params.push(from_date); }
  if (to_date) { conditions.push(`o.created_at <= $${idx++}`); params.push(to_date); }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [data, count] = await Promise.all([
    query(
      `SELECT o.*, c.name as customer_name, c.phone as customer_phone,
       u.name as seller_name, u.seller_code
       FROM orders o
       LEFT JOIN customers c ON c.id = o.customer_id
       LEFT JOIN users u ON u.id = o.seller_id
       ${where}
       ORDER BY o.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    ),
    query(`SELECT COUNT(*) FROM orders o ${where}`, params),
  ]);

  return {
    orders: data.rows,
    pagination: { total: parseInt(count.rows[0].count), page: parseInt(page), per_page: limit },
  };
};

// অর্ডার বিবরণ
const getOrderById = async (id) => {
  const [order, items, payments] = await Promise.all([
    query(
      `SELECT o.*, c.name as customer_name, c.phone as customer_phone
       FROM orders o LEFT JOIN customers c ON c.id = o.customer_id
       WHERE o.id = $1`,
      [id]
    ),
    query('SELECT * FROM order_items WHERE order_id = $1', [id]),
    query('SELECT * FROM order_payments WHERE order_id = $1', [id]),
  ]);

  if (order.rows.length === 0) throw new ApiError(404, 'Order not found');

  return { ...order.rows[0], items: items.rows, payments: payments.rows };
};

// অর্ডার স্ট্যাটাস আপডেট করুন
const updateOrderStatus = async (id, status, deliveryStatus) => {
  const result = await query(
    `UPDATE orders SET status = COALESCE($1, status), delivery_status = COALESCE($2, delivery_status), updated_at = NOW()
     WHERE id = $3 RETURNING *`,
    [status, deliveryStatus || null, id]
  );

  if (result.rows.length === 0) throw new ApiError(404, 'Order not found');
  return result.rows[0];
};

module.exports = {
  createPOSOrder,
  createOnlineOrder,
  syncOfflineOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
};
