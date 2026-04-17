const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth');
const controller = require('./inventory.controller');

router.get('/store/:storeId', authMiddleware, controller.getStoreInventory);
router.put('/store/:storeId', authMiddleware, controller.updateStock);
router.get('/store/:storeId/alerts', authMiddleware, controller.getLowStockAlerts);

module.exports = router;
