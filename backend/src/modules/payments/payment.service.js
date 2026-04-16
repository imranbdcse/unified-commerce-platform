const { query } = require('../../config/database');

const getPaymentsByOrder = async (orderId) => {
  const result = await query('SELECT * FROM order_payments WHERE order_id = $1', [orderId]);
  return result.rows;
};

const processPayment = async ({ orderId, method, amount, reference }) => {
  const result = await query(
    'INSERT INTO order_payments (order_id, method, amount, reference) VALUES ($1, $2, $3, $4) RETURNING *',
    [orderId, method, amount, reference || null]
  );
  return result.rows[0];
};

const getPaymentSummary = async (storeId, date) => {
  const result = await query(
    `SELECT op.method, SUM(op.amount) as total, COUNT(*) as count
     FROM order_payments op
     JOIN orders o ON o.id = op.order_id
     WHERE o.store_id = $1 AND DATE(o.created_at) = $2
     GROUP BY op.method`,
    [storeId, date || new Date().toISOString().split('T')[0]]
  );
  return result.rows;
};

module.exports = { getPaymentsByOrder, processPayment, getPaymentSummary };
