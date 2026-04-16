const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth');
const controller = require('./customer.controller');

router.get('/', authMiddleware, controller.getCustomers);
router.get('/search', authMiddleware, controller.searchByPhone);
router.get('/:id', authMiddleware, controller.getCustomerById);
router.post('/', authMiddleware, controller.createCustomer);
router.put('/:id', authMiddleware, controller.updateCustomer);
router.post('/:id/addresses', authMiddleware, controller.addAddress);

module.exports = router;
