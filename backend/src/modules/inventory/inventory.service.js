const { query } = require('../../config/database');
const { ApiError } = require('../../utils/ApiError');

const getStoreInventory = async (storeId, { page = 1, per_page = 50, search, low_stock }) => {
  const limit = Math.min(parseInt(per_page), 200);
  const offset = (parseInt(page) - 1) * limit;
  let conditions = ['i.store_id = $1'];
  let params = [storeId];
  let idx = 2;

  if (search) {
    conditions.push(`(p.name ILIKE $${idx} OR p.sku ILIKE $${idx})`);
    params.push(`%${search}%`);
    idx++;
  }

  if (low_stock === 'true') {
    conditions.push(`i.quantity <= i.min_stock_level`);
  }

  const where = `WHERE ${conditions.join(' AND ')}`;

  const [data, count] = await Promise.all([
    query(
      `SELECT i.*, p.name as product_name, p.sku, p.barcode, p.price, c.name as category
       FROM inventory i
       JOIN products p ON p.id = i.product_id
       LEFT JOIN categories c ON c.id = p.category_id
       ${where}
       ORDER BY p.name
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    ),
    query(`SELECT COUNT(*) FROM inventory i JOIN products p ON p.id = i.product_id ${where}`, params),
  ]);

  return { inventory: data.rows, pagination: { total: parseInt(count.rows[0].count), page: parseInt(page), per_page: limit } };
};

const updateStock = async (storeId, productId, quantity, type = 'set') => {
  let updateQuery;
  if (type === 'add') {
    updateQuery = 'UPDATE inventory SET quantity = quantity + $1, updated_at = NOW() WHERE store_id = $2 AND product_id = $3 RETURNING *';
  } else if (type === 'subtract') {
    updateQuery = 'UPDATE inventory SET quantity = GREATEST(0, quantity - $1), updated_at = NOW() WHERE store_id = $2 AND product_id = $3 RETURNING *';
  } else {
    updateQuery = 'UPDATE inventory SET quantity = $1, updated_at = NOW() WHERE store_id = $2 AND product_id = $3 RETURNING *';
  }

  const result = await query(updateQuery, [quantity, storeId, productId]);

  if (result.rows.length === 0) {
    const inserted = await query(
      'INSERT INTO inventory (store_id, product_id, quantity) VALUES ($1, $2, $3) ON CONFLICT (store_id, product_id, variant_id) DO UPDATE SET quantity = $3 RETURNING *',
      [storeId, productId, quantity]
    );
    return inserted.rows[0];
  }

  return result.rows[0];
};

const getLowStockAlerts = async (storeId) => {
  const result = await query(
    `SELECT i.*, p.name as product_name, p.sku
     FROM inventory i
     JOIN products p ON p.id = i.product_id
     WHERE i.store_id = $1 AND i.quantity <= i.min_stock_level
     ORDER BY (i.quantity::float / NULLIF(i.min_stock_level, 0)) ASC`,
    [storeId]
  );
  return result.rows;
};

module.exports = { getStoreInventory, updateStock, getLowStockAlerts };
