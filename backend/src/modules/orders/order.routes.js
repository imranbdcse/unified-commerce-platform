const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth');
const controller = require('./order.controller');

router.post('/pos', authMiddleware, controller.createPOSOrder);
router.post('/online', authMiddleware, controller.createOnlineOrder);
router.post('/sync', authMiddleware, controller.syncOfflineOrder);
router.get('/', authMiddleware, controller.getOrders);
router.get('/:id', authMiddleware, controller.getOrderById);
router.patch('/:id/status', authMiddleware, controller.updateOrderStatus);

module.exports = router;
