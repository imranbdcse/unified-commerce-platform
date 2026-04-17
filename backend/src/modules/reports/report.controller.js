const dashboardService = require('./dashboard.service');
const { ApiResponse } = require('../../utils/ApiResponse');

const getMasterDashboard = async (req, res, next) => {
  try {
    const result = await dashboardService.getMasterDashboard();
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

const getSalesSummary = async (req, res, next) => {
  try {
    const result = await dashboardService.getSalesSummary(req.query);
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

const getOnlineOrderStatus = async (req, res, next) => {
  try {
    const result = await dashboardService.getOnlineOrderStatus();
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

const getDeliveryStatus = async (req, res, next) => {
  try {
    const result = await dashboardService.getDeliveryStatus();
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

const getDailyComparison = async (req, res, next) => {
  try {
    const result = await dashboardService.getDailyComparison();
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

const getStockOverview = async (req, res, next) => {
  try {
    const result = await dashboardService.getStockOverview();
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

const getWarehouseStock = async (req, res, next) => {
  try {
    const result = await dashboardService.getWarehouseStock();
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

const getDivisionWiseSales = async (req, res, next) => {
  try {
    const result = await dashboardService.getDivisionWiseSales();
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

const getDivisionWiseStock = async (req, res, next) => {
  try {
    const result = await dashboardService.getDivisionWiseOfflineStock();
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

const getTopProducts = async (req, res, next) => {
  try {
    const result = await dashboardService.getTopProducts(req.query.limit);
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

const getRecentOrders = async (req, res, next) => {
  try {
    const result = await dashboardService.getRecentOrders(req.query.limit);
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

module.exports = {
  getMasterDashboard, getSalesSummary, getOnlineOrderStatus, getDeliveryStatus,
  getDailyComparison, getStockOverview, getWarehouseStock, getDivisionWiseSales,
  getDivisionWiseStock, getTopProducts, getRecentOrders
};
