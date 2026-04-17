const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth');
const controller = require('./zone.controller');

router.get('/', authMiddleware, controller.getAllZones);
router.get('/:id', authMiddleware, controller.getZoneDetail);
router.get('/:id/sales', authMiddleware, controller.getZoneSales);
router.get('/:id/stock', authMiddleware, controller.getZoneStock);
router.get('/:id/online-orders', authMiddleware, controller.getZoneOnlineOrders);

module.exports = router;
