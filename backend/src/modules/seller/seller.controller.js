const sellerService = require('./seller.service');
const { ApiResponse } = require('../../utils/ApiResponse');

const verifySellerCode = async (req, res, next) => {
  try {
    const result = await sellerService.verifySellerCode(req.body.sellerCode, req.body.pin);
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

const assignSellerCode = async (req, res, next) => {
  try {
    const result = await sellerService.assignSellerCode(req.params.userId, req.body.sellerCode, req.body.pin);
    ApiResponse.success(res, result, 'Seller code assigned');
  } catch (err) { next(err); }
};

const getAllSellers = async (req, res, next) => {
  try {
    const result = await sellerService.getAllSellers(req.query);
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

const getSellerReport = async (req, res, next) => {
  try {
    const result = await sellerService.getSellerReport(req.params.id, req.query);
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

const getDailySummary = async (req, res, next) => {
  try {
    const result = await sellerService.getDailySummary(req.params.id);
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

const getCommissions = async (req, res, next) => {
  try {
    const result = await sellerService.getCommissions(req.params.id, req.query);
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

const getSellerPerformance = async (req, res, next) => {
  try {
    const result = await sellerService.getSellerPerformance(req.params.id);
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

const getLeaderboard = async (req, res, next) => {
  try {
    const result = await sellerService.getLeaderboard(req.query.period);
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

const getSellerTrend = async (req, res, next) => {
  try {
    const result = await sellerService.getSellerTrend(req.params.id, req.query.days);
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

module.exports = {
  verifySellerCode, assignSellerCode, getAllSellers, getSellerReport,
  getDailySummary, getCommissions, getSellerPerformance, getLeaderboard, getSellerTrend
};
