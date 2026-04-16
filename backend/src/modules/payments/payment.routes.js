const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth');
const controller = require('./payment.controller');

router.get('/order/:orderId', authMiddleware, controller.getPaymentsByOrder);
router.post('/', authMiddleware, controller.processPayment);
router.get('/summary', authMiddleware, controller.getPaymentSummary);

module.exports = router;
