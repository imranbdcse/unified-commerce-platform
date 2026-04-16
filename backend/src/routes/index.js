const express = require('express');
const router = express.Router();

const authRoutes = require('../modules/auth/auth.routes');
const productRoutes = require('../modules/products/product.routes');
const orderRoutes = require('../modules/orders/order.routes');
const customerRoutes = require('../modules/customers/customer.routes');
const inventoryRoutes = require('../modules/inventory/inventory.routes');
const paymentRoutes = require('../modules/payments/payment.routes');
const sellerRoutes = require('../modules/seller/seller.routes');
const zoneRoutes = require('../modules/zone/zone.routes');
const fulfillmentRoutes = require('../modules/fulfillment/fulfillment.routes');
const reportRoutes = require('../modules/reports/report.routes');

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/customers', customerRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/payments', paymentRoutes);
router.use('/sellers', sellerRoutes);
router.use('/zones', zoneRoutes);
router.use('/fulfillment', fulfillmentRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
