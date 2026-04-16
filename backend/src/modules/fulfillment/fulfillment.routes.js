const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth');
const controller = require('./fulfillment.controller');

router.post('/process/:orderId', authMiddleware, controller.processOnlineOrder);
router.post('/best-source/:orderId', authMiddleware, controller.findBestSource);
router.post('/transfers', authMiddleware, controller.createTransfer);
router.post('/transfers/manual', authMiddleware, controller.manualTransfer);
router.patch('/transfers/:id/approve', authMiddleware, controller.approveTransfer);
router.patch('/transfers/:id/ship', authMiddleware, controller.shipTransfer);
router.patch('/transfers/:id/receive', authMiddleware, controller.receiveTransfer);

module.exports = router;
