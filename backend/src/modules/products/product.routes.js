const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const validate = require('../../middleware/validate');
const { authMiddleware } = require('../../middleware/auth');
const optionalAuth = require('../../middleware/optionalAuth');
const controller = require('./product.controller');

router.get('/', controller.getProducts);
router.get('/categories', controller.getCategories);
router.get('/featured', controller.getFeatured);
router.get('/trending', controller.getTrending);
router.get('/recommendations', optionalAuth, controller.getRecommendations);
router.get('/:id', controller.getProductById);
router.get('/:id/similar', controller.getSimilarProducts);
router.get('/:id/also-bought', controller.getAlsoBought);

router.post('/', authMiddleware, [
  body('name').notEmpty().trim(),
  body('sku').notEmpty().trim(),
  body('price').isFloat({ min: 0 }),
  validate,
], controller.createProduct);

router.put('/:id', authMiddleware, controller.updateProduct);
router.delete('/:id', authMiddleware, controller.deleteProduct);

module.exports = router;
