const { query } = require('../config/database');

// OTP তৈরি করুন
const generateOTP = () => {
  if (process.env.NODE_ENV === 'test' || process.env.OTP_TEST_CODE) {
    return process.env.OTP_TEST_CODE || '123456';
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// OTP সংরক্ষণ করুন
const saveOTP = async (phone, code, purpose = 'login') => {
  const expiresAt = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES || 5)) * 60 * 1000);
  
  // পুরানো OTP বাতিল করুন
  await query(
    `UPDATE otp_codes SET is_used = true WHERE phone = $1 AND purpose = $2 AND is_used = false`,
    [phone, purpose]
  );

  await query(
    `INSERT INTO otp_codes (phone, code, purpose, expires_at) VALUES ($1, $2, $3, $4)`,
    [phone, code, purpose, expiresAt]
  );

  return code;
};

// OTP যাচাই করুন
const verifyOTP = async (phone, code, purpose = 'login') => {
  const result = await query(
    `SELECT * FROM otp_codes 
     WHERE phone = $1 AND code = $2 AND purpose = $3 
     AND is_used = false AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`,
    [phone, code, purpose]
  );

  if (result.rows.length === 0) {
    return false;
  }

  await query(`UPDATE otp_codes SET is_used = true WHERE id = $1`, [result.rows[0].id]);
  return true;
};

module.exports = { generateOTP, saveOTP, verifyOTP };
