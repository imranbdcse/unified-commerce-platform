const { query } = require('../../config/database');
const { ApiError } = require('../../utils/ApiError');

const getCustomers = async ({ page = 1, per_page = 20, search }) => {
  const limit = Math.min(parseInt(per_page), 100);
  const offset = (parseInt(page) - 1) * limit;
  let params = [];
  let where = 'WHERE c.is_active = true';
  if (search) {
    where += ' AND (c.name ILIKE $1 OR c.phone ILIKE $1)';
    params.push(`%${search}%`);
  }
  const [data, count] = await Promise.all([
    query(`SELECT * FROM customers c ${where} ORDER BY c.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset]),
    query(`SELECT COUNT(*) FROM customers c ${where}`, params),
  ]);
  return { customers: data.rows, pagination: { total: parseInt(count.rows[0].count), page: parseInt(page), per_page: limit } };
};

const getCustomerById = async (id) => {
  const [customer, addresses, recentOrders] = await Promise.all([
    query('SELECT * FROM customers WHERE id = $1', [id]),
    query('SELECT * FROM customer_addresses WHERE customer_id = $1', [id]),
    query('SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 10', [id]),
  ]);
  if (customer.rows.length === 0) throw new ApiError(404, 'Customer not found');
  return { ...customer.rows[0], addresses: addresses.rows, recentOrders: recentOrders.rows };
};

const searchByPhone = async (phone) => {
  const result = await query('SELECT * FROM customers WHERE phone = $1', [phone]);
  return result.rows[0] || null;
};

const createCustomer = async (data) => {
  const { name, phone, email } = data;
  const result = await query(
    'INSERT INTO customers (name, phone, email) VALUES ($1, $2, $3) RETURNING *',
    [name, phone, email || null]
  );
  return result.rows[0];
};

const updateCustomer = async (id, data) => {
  const { name, email } = data;
  const result = await query(
    'UPDATE customers SET name = COALESCE($1, name), email = COALESCE($2, email), updated_at = NOW() WHERE id = $3 RETURNING *',
    [name, email, id]
  );
  if (result.rows.length === 0) throw new ApiError(404, 'Customer not found');
  return result.rows[0];
};

const addAddress = async (customerId, addressData) => {
  if (addressData.isDefault) {
    await query('UPDATE customer_addresses SET is_default = false WHERE customer_id = $1', [customerId]);
  }
  const result = await query(
    `INSERT INTO customer_addresses (customer_id, label, recipient_name, phone, address_line1, city, district, division, is_default)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [customerId, addressData.label || 'Home', addressData.recipientName, addressData.phone, addressData.addressLine1, addressData.city, addressData.district, addressData.division, addressData.isDefault || false]
  );
  return result.rows[0];
};

module.exports = { getCustomers, getCustomerById, searchByPhone, createCustomer, updateCustomer, addAddress };
