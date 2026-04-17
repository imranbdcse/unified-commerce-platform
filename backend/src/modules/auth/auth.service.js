const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../../config/database');
const { ApiError } = require('../../utils/ApiError');
const { generateOTP, saveOTP, verifyOTP } = require('../../utils/otp');

// JWT token তৈরি করুন
const generateTokens = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    phone: user.phone,
    role: user.role_name,
    storeId: user.store_id,
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'refresh-secret', {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });

  return { accessToken, refreshToken };
};

// Staff রেজিস্ট্রেশন
const registerStaff = async ({ name, email, phone, password, roleId, storeId }) => {
  const existingUser = await query(
    'SELECT id FROM users WHERE email = $1 OR phone = $2',
    [email, phone]
  );

  if (existingUser.rows.length > 0) {
    throw new ApiError(409, 'Email or phone already registered');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await query(
    `INSERT INTO users (name, email, phone, password_hash, role_id, store_id) 
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, phone, role_id`,
    [name, email, phone, passwordHash, roleId || 2, storeId || null]
  );

  return result.rows[0];
};

// Staff লগইন
const loginStaff = async ({ email, password }) => {
  const result = await query(
    `SELECT u.*, r.name as role_name 
     FROM users u 
     LEFT JOIN roles r ON r.id = u.role_id
     WHERE (u.email = $1 OR u.phone = $1) AND u.is_active = true`,
    [email]
  );

  if (result.rows.length === 0) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const user = result.rows[0];
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw new ApiError(401, 'Invalid credentials');
  }

  await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

  const tokens = generateTokens(user);
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role_name,
      storeId: user.store_id,
    },
    ...tokens,
  };
};

// Customer রেজিস্ট্রেশন - OTP দিয়ে
const registerCustomer = async ({ name, phone, email }) => {
  const existing = await query('SELECT id FROM customers WHERE phone = $1', [phone]);
  if (existing.rows.length > 0) {
    throw new ApiError(409, 'Phone number already registered');
  }

  const otp = generateOTP();
  await saveOTP(phone, otp, 'register');

  // In production, send SMS here
  console.log(`📱 OTP for ${phone}: ${otp}`);

  return { message: 'OTP sent to your mobile number', phone };
};

// OTP যাচাই করুন এবং Customer তৈরি করুন
const verifyCustomerOTP = async ({ phone, otp, name, email }) => {
  const isValid = await verifyOTP(phone, otp, 'register');
  if (!isValid) {
    throw new ApiError(400, 'Invalid or expired OTP');
  }

  const existing = await query('SELECT id FROM customers WHERE phone = $1', [phone]);
  let customer;

  if (existing.rows.length > 0) {
    customer = existing.rows[0];
  } else {
    const result = await query(
      `INSERT INTO customers (name, phone, email) VALUES ($1, $2, $3) RETURNING *`,
      [name || 'Customer', phone, email || null]
    );
    customer = result.rows[0];
  }

  const token = jwt.sign(
    { id: customer.id, phone: customer.phone, role: 'customer' },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '30d' }
  );

  return { customer, accessToken: token };
};

// Customer লগইন OTP পাঠান
const sendLoginOTP = async (phone) => {
  const otp = generateOTP();
  await saveOTP(phone, otp, 'login');
  console.log(`📱 Login OTP for ${phone}: ${otp}`);
  return { message: 'OTP sent', phone };
};

// Customer OTP লগইন যাচাই
const verifyLoginOTP = async ({ phone, otp }) => {
  const isValid = await verifyOTP(phone, otp, 'login');
  if (!isValid) {
    throw new ApiError(400, 'Invalid or expired OTP');
  }

  let customer = await query('SELECT * FROM customers WHERE phone = $1', [phone]);
  
  if (customer.rows.length === 0) {
    const result = await query(
      `INSERT INTO customers (name, phone) VALUES ($1, $2) RETURNING *`,
      ['Customer', phone]
    );
    customer = result;
  }

  const user = customer.rows[0];
  const token = jwt.sign(
    { id: user.id, phone: user.phone, role: 'customer' },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '30d' }
  );

  return { customer: user, accessToken: token };
};

// Refresh token
const refreshToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'refresh-secret');
    const newToken = jwt.sign(
      { id: decoded.id, email: decoded.email, phone: decoded.phone, role: decoded.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    return { accessToken: newToken };
  } catch (err) {
    throw new ApiError(401, 'Invalid refresh token');
  }
};

module.exports = {
  registerStaff,
  loginStaff,
  registerCustomer,
  verifyCustomerOTP,
  sendLoginOTP,
  verifyLoginOTP,
  refreshToken,
};
