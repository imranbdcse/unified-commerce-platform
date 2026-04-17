const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth');
const controller = require('./seller.controller');

router.post('/verify', controller.verifySellerCode);
router.post('/assign/:userId', authMiddleware, controller.assignSellerCode);
router.get('/', authMiddleware, controller.getAllSellers);
router.get('/leaderboard', authMiddleware, controller.getLeaderboard);
router.get('/:id/report', authMiddleware, controller.getSellerReport);
router.get('/:id/daily', authMiddleware, controller.getDailySummary);
router.get('/:id/commissions', authMiddleware, controller.getCommissions);
router.get('/:id/performance', authMiddleware, controller.getSellerPerformance);
router.get('/:id/trend', authMiddleware, controller.getSellerTrend);

module.exports = router;
