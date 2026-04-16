const { query } = require('../../config/database');
const { ApiError } = require('../../utils/ApiError');

// Seller কোড যাচাই করুন
const verifySellerCode = async (sellerCode, pin) => {
  const result = await query(
    `SELECT u.*, r.name as role_name FROM users u 
     JOIN roles r ON r.id = u.role_id
     WHERE u.seller_code = $1 AND u.seller_pin = $2 AND u.is_active = true`,
    [sellerCode, pin]
  );

  if (result.rows.length === 0) {
    throw new ApiError(401, 'Invalid seller code or PIN');
  }

  return {
    id: result.rows[0].id,
    name: result.rows[0].name,
    sellerCode: result.rows[0].seller_code,
    role: result.rows[0].role_name,
    storeId: result.rows[0].store_id,
  };
};

// Seller কোড নির্ধারণ করুন
const assignSellerCode = async (userId, sellerCode, pin) => {
  const existing = await query('SELECT id FROM users WHERE seller_code = $1 AND id != $2', [sellerCode, userId]);
  if (existing.rows.length > 0) throw new ApiError(409, 'Seller code already in use');

  const result = await query(
    'UPDATE users SET seller_code = $1, seller_pin = $2 WHERE id = $3 RETURNING id, name, seller_code',
    [sellerCode, pin, userId]
  );

  return result.rows[0];
};

// সকল Seller তালিকা
const getAllSellers = async ({ page = 1, per_page = 20 }) => {
  const limit = Math.min(parseInt(per_page), 100);
  const offset = (parseInt(page) - 1) * limit;

  const result = await query(
    `SELECT u.id, u.name, u.phone, u.seller_code, u.is_active,
     COUNT(DISTINCT o.id) as total_orders,
     COALESCE(SUM(o.total), 0) as total_sales,
     COALESCE(SUM(sc.commission_amount), 0) as total_commission
     FROM users u
     JOIN roles r ON r.id = u.role_id AND r.name = 'seller'
     LEFT JOIN orders o ON o.seller_id = u.id AND o.status != 'cancelled'
     LEFT JOIN seller_commissions sc ON sc.seller_id = u.id
     GROUP BY u.id, u.name, u.phone, u.seller_code, u.is_active
     ORDER BY total_sales DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return result.rows;
};

// Seller রিপোর্ট
const getSellerReport = async (sellerId, { from_date, to_date }) => {
  const result = await query(
    `SELECT 
     u.name as seller_name, u.seller_code,
     COUNT(DISTINCT o.id) as total_orders,
     COALESCE(SUM(o.total), 0) as total_sales,
     COALESCE(SUM(sc.commission_amount), 0) as total_commission,
     COALESCE(AVG(o.total), 0) as avg_order_value
     FROM users u
     LEFT JOIN orders o ON o.seller_id = u.id AND o.status != 'cancelled'
     AND ($1::date IS NULL OR DATE(o.created_at) >= $1::date)
     AND ($2::date IS NULL OR DATE(o.created_at) <= $2::date)
     LEFT JOIN seller_commissions sc ON sc.seller_id = u.id
     WHERE u.id = $3
     GROUP BY u.id, u.name, u.seller_code`,
    [from_date || null, to_date || null, sellerId]
  );

  return result.rows[0];
};

// দৈনিক সারসংক্ষেপ
const getDailySummary = async (sellerId) => {
  const result = await query(
    `SELECT 
     COUNT(DISTINCT o.id) as today_orders,
     COALESCE(SUM(o.total), 0) as today_sales,
     COALESCE(SUM(sc.commission_amount), 0) as today_commission
     FROM orders o
     LEFT JOIN seller_commissions sc ON sc.seller_id = $1 AND sc.order_id = o.id
     WHERE o.seller_id = $1 AND DATE(o.created_at) = CURRENT_DATE AND o.status != 'cancelled'`,
    [sellerId]
  );
  return result.rows[0];
};

// কমিশন তালিকা
const getCommissions = async (sellerId, { page = 1, per_page = 20 }) => {
  const limit = Math.min(parseInt(per_page), 100);
  const offset = (parseInt(page) - 1) * limit;

  const result = await query(
    `SELECT sc.*, o.order_number, o.created_at as order_date
     FROM seller_commissions sc
     JOIN orders o ON o.id = sc.order_id
     WHERE sc.seller_id = $1
     ORDER BY sc.created_at DESC
     LIMIT $2 OFFSET $3`,
    [sellerId, limit, offset]
  );

  return result.rows;
};

// Performance metrics
const getSellerPerformance = async (sellerId) => {
  const [daily, weekly, monthly] = await Promise.all([
    query(`SELECT COALESCE(SUM(total), 0) as sales, COUNT(*) as orders FROM orders WHERE seller_id = $1 AND DATE(created_at) = CURRENT_DATE AND status != 'cancelled'`, [sellerId]),
    query(`SELECT COALESCE(SUM(total), 0) as sales, COUNT(*) as orders FROM orders WHERE seller_id = $1 AND created_at >= NOW() - INTERVAL '7 days' AND status != 'cancelled'`, [sellerId]),
    query(`SELECT COALESCE(SUM(total), 0) as sales, COUNT(*) as orders FROM orders WHERE seller_id = $1 AND created_at >= NOW() - INTERVAL '30 days' AND status != 'cancelled'`, [sellerId]),
  ]);

  return {
    daily: daily.rows[0],
    weekly: weekly.rows[0],
    monthly: monthly.rows[0],
  };
};

// Leaderboard
const getLeaderboard = async (period = 'monthly') => {
  let dateFilter = '';
  if (period === 'daily') dateFilter = "AND DATE(o.created_at) = CURRENT_DATE";
  else if (period === 'weekly') dateFilter = "AND o.created_at >= NOW() - INTERVAL '7 days'";
  else if (period === 'monthly') dateFilter = "AND o.created_at >= NOW() - INTERVAL '30 days'";

  const result = await query(
    `SELECT u.id, u.name, u.seller_code,
     COUNT(DISTINCT o.id) as total_orders,
     COALESCE(SUM(o.total), 0) as total_sales,
     COALESCE(SUM(sc.commission_amount), 0) as total_commission,
     RANK() OVER (ORDER BY COALESCE(SUM(o.total), 0) DESC) as rank
     FROM users u
     JOIN roles r ON r.id = u.role_id AND r.name = 'seller'
     LEFT JOIN orders o ON o.seller_id = u.id AND o.status != 'cancelled' ${dateFilter}
     LEFT JOIN seller_commissions sc ON sc.seller_id = u.id
     GROUP BY u.id, u.name, u.seller_code
     ORDER BY total_sales DESC
     LIMIT 20`
  );

  return result.rows;
};

// Trend data
const getSellerTrend = async (sellerId, days = 30) => {
  const safeDays = Math.min(Math.max(parseInt(days) || 30, 1), 365);
  const result = await query(
    `SELECT DATE(created_at) as date, COUNT(*) as orders, COALESCE(SUM(total), 0) as sales
     FROM orders
     WHERE seller_id = $1 AND created_at >= NOW() - ($2 * interval '1 day') AND status != 'cancelled'
     GROUP BY DATE(created_at)
     ORDER BY date`,
    [sellerId, safeDays]
  );
  return result.rows;
};

module.exports = {
  verifySellerCode, assignSellerCode, getAllSellers, getSellerReport,
  getDailySummary, getCommissions, getSellerPerformance, getLeaderboard, getSellerTrend
};
