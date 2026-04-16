const authService = require('./auth.service');
const { ApiResponse } = require('../../utils/ApiResponse');

const registerStaff = async (req, res, next) => {
  try {
    const result = await authService.registerStaff(req.body);
    ApiResponse.created(res, result, 'Staff registered successfully');
  } catch (err) {
    next(err);
  }
};

const loginStaff = async (req, res, next) => {
  try {
    const result = await authService.loginStaff(req.body);
    ApiResponse.success(res, result, 'Login successful');
  } catch (err) {
    next(err);
  }
};

const registerCustomer = async (req, res, next) => {
  try {
    const result = await authService.registerCustomer(req.body);
    ApiResponse.success(res, result, 'OTP sent');
  } catch (err) {
    next(err);
  }
};

const verifyCustomerOTP = async (req, res, next) => {
  try {
    const result = await authService.verifyCustomerOTP(req.body);
    ApiResponse.success(res, result, 'Registration successful');
  } catch (err) {
    next(err);
  }
};

const sendLoginOTP = async (req, res, next) => {
  try {
    const result = await authService.sendLoginOTP(req.body.phone);
    ApiResponse.success(res, result, 'OTP sent');
  } catch (err) {
    next(err);
  }
};

const verifyLoginOTP = async (req, res, next) => {
  try {
    const result = await authService.verifyLoginOTP(req.body);
    ApiResponse.success(res, result, 'Login successful');
  } catch (err) {
    next(err);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const result = await authService.refreshToken(req.body.refreshToken);
    ApiResponse.success(res, result, 'Token refreshed');
  } catch (err) {
    next(err);
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
