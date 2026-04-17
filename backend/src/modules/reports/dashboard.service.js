const { query } = require('../../config/database');

const getMasterDashboard = async () => {
  const [
    todaySales, totalOrders, totalCustomers, totalProducts,
    onlineOrders, pendingDeliveries, lowStockCount, topProducts
  ] = await Promise.all([
    query(`SELECT COALESCE(SUM(total), 0) as value FROM orders WHERE DATE(created_at) = CURRENT_DATE AND status != 'cancelled'`),
    query(`SELECT COUNT(*) as value FROM orders WHERE DATE(created_at) = CURRENT_DATE`),
    query(`SELECT COUNT(*) as value FROM customers WHERE is_active = true`),
    query(`SELECT COUNT(*) as value FROM products WHERE is_active = true`),
    query(`SELECT COUNT(*) as value FROM orders WHERE type = 'online' AND status IN ('pending', 'processing')`),
    query(`SELECT COUNT(*) as value FROM orders WHERE delivery_status IN ('processing', 'picked', 'in_transit')`),
    query(`SELECT COUNT(*) as value FROM inventory WHERE quantity <= min_stock_level`),
    query(`SELECT p.name, SUM(oi.quantity) as units_sold, SUM(oi.total) as revenue
           FROM order_items oi JOIN products p ON p.id = oi.product_id
           JOIN orders o ON o.id = oi.order_id WHERE DATE(o.created_at) = CURRENT_DATE
           GROUP BY p.id, p.name ORDER BY revenue DESC LIMIT 5`),
  ]);

  return {
    kpis: {
      todaySales: parseFloat(todaySales.rows[0].value),
      totalOrders: parseInt(totalOrders.rows[0].value),
      totalCustomers: parseInt(totalCustomers.rows[0].value),
      totalProducts: parseInt(totalProducts.rows[0].value),
      onlineOrders: parseInt(onlineOrders.rows[0].value),
      pendingDeliveries: parseInt(pendingDeliveries.rows[0].value),
      lowStockCount: parseInt(lowStockCount.rows[0].value),
    },
    topProducts: topProducts.rows,
  };
};

const getSalesSummary = async ({ from_date, to_date, store_id }) => {
  let conditions = ['o.status != $1'];
  let params = ['cancelled'];
  let idx = 2;

  if (from_date) { conditions.push(`DATE(o.created_at) >= $${idx++}`); params.push(from_date); }
  if (to_date) { conditions.push(`DATE(o.created_at) <= $${idx++}`); params.push(to_date); }
  if (store_id) { conditions.push(`o.store_id = $${idx++}`); params.push(store_id); }

  const where = `WHERE ${conditions.join(' AND ')}`;

  const result = await query(
    `SELECT DATE(o.created_at) as date,
     COUNT(*) as order_count,
     COALESCE(SUM(o.total), 0) as total_sales,
     COALESCE(SUM(o.discount), 0) as total_discount,
     COALESCE(AVG(o.total), 0) as avg_order_value
     FROM orders o ${where}
     GROUP BY DATE(o.created_at)
     ORDER BY date DESC`,
    params
  );

  return result.rows;
};

const getOnlineOrderStatus = async () => {
  const result = await query(
    `SELECT status, COUNT(*) as count, COALESCE(SUM(total), 0) as value
     FROM orders WHERE type = 'online'
     GROUP BY status`
  );
  return result.rows;
};

const getDeliveryStatus = async () => {
  const result = await query(
    `SELECT delivery_status, COUNT(*) as count
     FROM orders WHERE type = 'online' AND delivery_status IS NOT NULL
     GROUP BY delivery_status`
  );
  return result.rows;
};

const getDailyComparison = async () => {
  const result = await query(
    `SELECT 
     SUM(CASE WHEN DATE(created_at) = CURRENT_DATE THEN total ELSE 0 END) as today,
     SUM(CASE WHEN DATE(created_at) = CURRENT_DATE - 1 THEN total ELSE 0 END) as yesterday,
     SUM(CASE WHEN DATE(created_at) >= DATE_TRUNC('week', CURRENT_DATE) THEN total ELSE 0 END) as this_week,
     SUM(CASE WHEN DATE(created_at) >= DATE_TRUNC('month', CURRENT_DATE) THEN total ELSE 0 END) as this_month
     FROM orders WHERE status != 'cancelled'`
  );
  return result.rows[0];
};

const getStockOverview = async () => {
  const result = await query(
    `SELECT s.name as store_name, s.code,
     SUM(i.quantity) as total_stock,
     SUM(CASE WHEN i.quantity <= i.min_stock_level THEN 1 ELSE 0 END) as low_stock_items,
     COUNT(DISTINCT i.product_id) as product_count
     FROM stores s
     LEFT JOIN inventory i ON i.store_id = s.id
     GROUP BY s.id, s.name, s.code
     ORDER BY s.name`
  );
  return result.rows;
};

const getWarehouseStock = async () => {
  const result = await query(
    `SELECT w.name as warehouse_name, w.code,
     SUM(wi.quantity) as total_stock,
     COUNT(DISTINCT wi.product_id) as product_count
     FROM warehouses w
     LEFT JOIN warehouse_inventory wi ON wi.warehouse_id = w.id
     GROUP BY w.id, w.name, w.code`
  );
  return result.rows;
};

const getDivisionWiseSales = async () => {
  const result = await query(
    `SELECT z.name as zone_name, z.code,
     COUNT(DISTINCT o.id) as order_count,
     COALESCE(SUM(o.total), 0) as total_sales
     FROM zones z
     LEFT JOIN stores s ON s.zone_id = z.id
     LEFT JOIN orders o ON o.store_id = s.id AND o.status != 'cancelled' AND o.created_at >= NOW() - INTERVAL '30 days'
     GROUP BY z.id, z.name, z.code
     ORDER BY total_sales DESC`
  );
  return result.rows;
};

const getDivisionWiseOfflineStock = async () => {
  const result = await query(
    `SELECT z.name as zone_name, z.code,
     SUM(i.quantity) as total_stock
     FROM zones z
     LEFT JOIN stores s ON s.zone_id = z.id
     LEFT JOIN inventory i ON i.store_id = s.id
     GROUP BY z.id, z.name, z.code`
  );
  return result.rows;
};

const getTopProducts = async (limit = 10) => {
  const result = await query(
    `SELECT p.name, p.sku, p.price,
     COUNT(DISTINCT oi.order_id) as order_count,
     SUM(oi.quantity) as units_sold,
     SUM(oi.total) as revenue
     FROM products p
     JOIN order_items oi ON oi.product_id = p.id
     JOIN orders o ON o.id = oi.order_id AND o.status != 'cancelled'
     GROUP BY p.id, p.name, p.sku, p.price
     ORDER BY revenue DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
};

const getRecentOrders = async (limit = 20) => {
  const result = await query(
    `SELECT o.*, c.name as customer_name, c.phone as customer_phone
     FROM orders o
     LEFT JOIN customers c ON c.id = o.customer_id
     ORDER BY o.created_at DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
};

module.exports = {
  getMasterDashboard, getSalesSummary, getOnlineOrderStatus, getDeliveryStatus,
  getDailyComparison, getStockOverview, getWarehouseStock, getDivisionWiseSales,
  getDivisionWiseOfflineStock, getTopProducts, getRecentOrders
};
