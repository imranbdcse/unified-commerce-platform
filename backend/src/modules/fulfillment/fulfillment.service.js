const { query, getClient } = require('../../config/database');
const { ApiError } = require('../../utils/ApiError');

const generateTransferNumber = () => `TRF-${Date.now().toString(36).toUpperCase()}`;

// Zone detection from address
const detectZoneFromAddress = async (address) => {
  const division = address.division || address.city || '';
  const result = await query(
    'SELECT * FROM zones WHERE division ILIKE $1 OR name ILIKE $1',
    [`%${division}%`]
  );
  return result.rows[0] || null;
};

// Store stock check
const checkStoreStock = async (storeId, items) => {
  const results = [];
  for (const item of items) {
    const stock = await query(
      'SELECT quantity FROM inventory WHERE store_id = $1 AND product_id = $2',
      [storeId, item.productId]
    );
    results.push({
      productId: item.productId,
      required: item.quantity,
      available: stock.rows[0]?.quantity || 0,
      sufficient: (stock.rows[0]?.quantity || 0) >= item.quantity,
    });
  }
  return results;
};

// Warehouse stock check
const checkWarehouseStock = async (warehouseId, items) => {
  const results = [];
  for (const item of items) {
    const stock = await query(
      'SELECT quantity FROM warehouse_inventory WHERE warehouse_id = $1 AND product_id = $2',
      [warehouseId, item.productId]
    );
    results.push({
      productId: item.productId,
      required: item.quantity,
      available: stock.rows[0]?.quantity || 0,
      sufficient: (stock.rows[0]?.quantity || 0) >= item.quantity,
    });
  }
  return results;
};

// Best fulfillment source
const findBestFulfillmentSource = async (orderId, deliveryAddress) => {
  const order = await query('SELECT * FROM orders WHERE id = $1', [orderId]);
  if (order.rows.length === 0) throw new ApiError(404, 'Order not found');

  const items = await query('SELECT * FROM order_items WHERE order_id = $1', [orderId]);
  const zone = await detectZoneFromAddress(deliveryAddress || {});

  if (!zone) {
    const warehouse = await query('SELECT * FROM warehouses WHERE is_active = true LIMIT 1');
    return { type: 'warehouse', source: warehouse.rows[0], items: items.rows };
  }

  // Check nearby stores first
  const nearbyStores = await query(
    `SELECT s.* FROM stores s WHERE s.zone_id = $1 AND s.is_active = true`,
    [zone.id]
  );

  for (const store of nearbyStores.rows) {
    const stockCheck = await checkStoreStock(store.id, items.rows.map(i => ({ productId: i.product_id, quantity: i.quantity })));
    if (stockCheck.every(s => s.sufficient)) {
      return { type: 'store', source: store, items: items.rows, stockCheck };
    }
  }

  // Fall back to warehouse
  const warehouse = await query('SELECT * FROM warehouses WHERE zone_id = $1', [zone.id]);
  const wh = warehouse.rows[0] || (await query('SELECT * FROM warehouses LIMIT 1')).rows[0];

  return { type: 'warehouse', source: wh, items: items.rows };
};

// Process online order fulfillment
const processOnlineOrder = async (orderId) => {
  const order = await query('SELECT * FROM orders WHERE id = $1', [orderId]);
  if (order.rows.length === 0) throw new ApiError(404, 'Order not found');

  const deliveryAddress = order.rows[0].delivery_address;
  const source = await findBestFulfillmentSource(orderId, deliveryAddress);

  const result = await query(
    `INSERT INTO order_fulfillments (order_id, fulfillment_source_type, fulfillment_source_id, status)
     VALUES ($1, $2, $3, 'processing') RETURNING *`,
    [orderId, source.type, source.source.id]
  );

  return { ...result.rows[0], source };
};

// Create transfer request
const createTransferRequest = async ({ sourceType, sourceId, destinationType, destinationId, items, requestedBy, notes }) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const transferResult = await client.query(
      `INSERT INTO stock_transfer_requests (transfer_number, source_type, source_id, destination_type, destination_id, requested_by, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [generateTransferNumber(), sourceType, sourceId, destinationType, destinationId, requestedBy, notes || null]
    );

    const transfer = transferResult.rows[0];

    for (const item of items) {
      await client.query(
        `INSERT INTO stock_transfer_items (transfer_id, product_id, requested_quantity)
         VALUES ($1, $2, $3)`,
        [transfer.id, item.productId, item.quantity]
      );
    }

    await client.query('COMMIT');
    return transfer;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// Approve transfer
const approveTransfer = async (transferId, approvedBy) => {
  const result = await query(
    `UPDATE stock_transfer_requests SET status = 'approved', approved_by = $1, updated_at = NOW()
     WHERE id = $2 AND status = 'pending' RETURNING *`,
    [approvedBy, transferId]
  );
  if (result.rows.length === 0) throw new ApiError(404, 'Transfer not found or already processed');
  return result.rows[0];
};

// Ship transfer
const shipTransfer = async (transferId) => {
  const result = await query(
    `UPDATE stock_transfer_requests SET status = 'in_transit', updated_at = NOW()
     WHERE id = $1 AND status = 'approved' RETURNING *`,
    [transferId]
  );
  if (result.rows.length === 0) throw new ApiError(400, 'Transfer must be approved before shipping');
  return result.rows[0];
};

// Receive transfer
const receiveTransfer = async (transferId, receivedItems) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const transfer = await client.query('SELECT * FROM stock_transfer_requests WHERE id = $1', [transferId]);
    if (transfer.rows.length === 0) throw new ApiError(404, 'Transfer not found');

    const t = transfer.rows[0];

    for (const item of receivedItems) {
      await client.query(
        'UPDATE stock_transfer_items SET received_quantity = $1 WHERE transfer_id = $2 AND product_id = $3',
        [item.receivedQuantity, transferId, item.productId]
      );

      // Add stock to destination
      if (t.destination_type === 'store') {
        await client.query(
          `INSERT INTO inventory (store_id, product_id, quantity) VALUES ($1, $2, $3)
           ON CONFLICT (store_id, product_id, variant_id) DO UPDATE SET quantity = inventory.quantity + EXCLUDED.quantity, updated_at = NOW()`,
          [t.destination_id, item.productId, item.receivedQuantity]
        );
      } else if (t.destination_type === 'warehouse') {
        await client.query(
          `INSERT INTO warehouse_inventory (warehouse_id, product_id, quantity) VALUES ($1, $2, $3)
           ON CONFLICT (warehouse_id, product_id, variant_id) DO UPDATE SET quantity = warehouse_inventory.quantity + EXCLUDED.quantity, updated_at = NOW()`,
          [t.destination_id, item.productId, item.receivedQuantity]
        );
      }

      // Deduct from source
      if (t.source_type === 'store') {
        await client.query(
          'UPDATE inventory SET quantity = GREATEST(0, quantity - $1) WHERE store_id = $2 AND product_id = $3',
          [item.receivedQuantity, t.source_id, item.productId]
        );
      } else if (t.source_type === 'warehouse') {
        await client.query(
          'UPDATE warehouse_inventory SET quantity = GREATEST(0, quantity - $1) WHERE warehouse_id = $2 AND product_id = $3',
          [item.receivedQuantity, t.source_id, item.productId]
        );
      }
    }

    await client.query(
      `UPDATE stock_transfer_requests SET status = 'received', updated_at = NOW() WHERE id = $1`,
      [transferId]
    );

    await client.query('COMMIT');
    return { message: 'Transfer received successfully' };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// Manual transfer
const manualTransfer = async (data) => {
  return createTransferRequest(data);
};

module.exports = {
  processOnlineOrder, findBestFulfillmentSource, checkStoreStock, checkWarehouseStock,
  detectZoneFromAddress, createTransferRequest, approveTransfer, shipTransfer, receiveTransfer, manualTransfer
};
