const productService = require('./product.service');
const { ApiResponse } = require('../../utils/ApiResponse');

const getProducts = async (req, res, next) => {
  try {
    const result = await productService.getProducts(req.query);
    ApiResponse.paginated(res, result.products, result.pagination);
  } catch (err) { next(err); }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    ApiResponse.success(res, product);
  } catch (err) { next(err); }
};

const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    ApiResponse.created(res, product);
  } catch (err) { next(err); }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    ApiResponse.success(res, product, 'Product updated');
  } catch (err) { next(err); }
};

const deleteProduct = async (req, res, next) => {
  try {
    const result = await productService.deleteProduct(req.params.id);
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

const getSimilarProducts = async (req, res, next) => {
  try {
    const products = await productService.getSimilarProducts(req.params.id, req.query.limit);
    ApiResponse.success(res, products);
  } catch (err) { next(err); }
};

const getAlsoBought = async (req, res, next) => {
  try {
    const products = await productService.getAlsoBought(req.params.id, req.query.limit);
    ApiResponse.success(res, products);
  } catch (err) { next(err); }
};

const getRecommendations = async (req, res, next) => {
  try {
    const customerId = req.user?.id;
    const products = await productService.getPersonalizedRecommendations(customerId, req.query.limit);
    ApiResponse.success(res, products);
  } catch (err) { next(err); }
};

const getTrending = async (req, res, next) => {
  try {
    const products = await productService.getTrendingProducts(req.query.limit);
    ApiResponse.success(res, products);
  } catch (err) { next(err); }
};

const getFeatured = async (req, res, next) => {
  try {
    const products = await productService.getFeaturedProducts(req.query.limit);
    ApiResponse.success(res, products);
  } catch (err) { next(err); }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await productService.getCategories();
    ApiResponse.success(res, categories);
  } catch (err) { next(err); }
};

module.exports = {
  getProducts, getProductById, createProduct, updateProduct, deleteProduct,
  getSimilarProducts, getAlsoBought, getRecommendations, getTrending, getFeatured, getCategories
};
