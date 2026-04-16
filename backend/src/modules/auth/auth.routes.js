const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../../middleware/validate');
const controller = require('./auth.controller');

// POST /api/v1/auth/register/staff
router.post('/register/staff', [
  body('name').notEmpty().trim(),
  body('email').optional().isEmail(),
  body('phone').notEmpty(),
  body('password').isLength({ min: 6 }),
  validate,
], controller.registerStaff);

// POST /api/v1/auth/login
router.post('/login', [
  body('email').notEmpty(),
  body('password').notEmpty(),
  validate,
], controller.loginStaff);

// POST /api/v1/auth/customer/register
router.post('/customer/register', [
  body('phone').notEmpty().matches(/^01[3-9]\d{8}$/),
  validate,
], controller.registerCustomer);

// POST /api/v1/auth/customer/verify-otp
router.post('/customer/verify-otp', [
  body('phone').notEmpty(),
  body('otp').isLength({ min: 6, max: 6 }),
  validate,
], controller.verifyCustomerOTP);

// POST /api/v1/auth/customer/login
router.post('/customer/login', [
  body('phone').notEmpty(),
  validate,
], controller.sendLoginOTP);

// POST /api/v1/auth/customer/verify-login
router.post('/customer/verify-login', [
  body('phone').notEmpty(),
  body('otp').isLength({ min: 6, max: 6 }),
  validate,
], controller.verifyLoginOTP);

// POST /api/v1/auth/refresh
router.post('/refresh', controller.refreshToken);

module.exports = router;
