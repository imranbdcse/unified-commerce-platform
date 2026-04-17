const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth');
const controller = require('./report.controller');

router.get('/dashboard', authMiddleware, controller.getMasterDashboard);
router.get('/sales', authMiddleware, controller.getSalesSummary);
router.get('/online-orders', authMiddleware, controller.getOnlineOrderStatus);
router.get('/delivery', authMiddleware, controller.getDeliveryStatus);
router.get('/daily-comparison', authMiddleware, controller.getDailyComparison);
router.get('/stock', authMiddleware, controller.getStockOverview);
router.get('/warehouse-stock', authMiddleware, controller.getWarehouseStock);
router.get('/division-sales', authMiddleware, controller.getDivisionWiseSales);
router.get('/division-stock', authMiddleware, controller.getDivisionWiseStock);
router.get('/top-products', authMiddleware, controller.getTopProducts);
router.get('/recent-orders', authMiddleware, controller.getRecentOrders);

module.exports = router;
