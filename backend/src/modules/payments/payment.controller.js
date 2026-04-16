const paymentService = require('./payment.service');
const { ApiResponse } = require('../../utils/ApiResponse');

const getPaymentsByOrder = async (req, res, next) => {
  try {
    const result = await paymentService.getPaymentsByOrder(req.params.orderId);
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

const processPayment = async (req, res, next) => {
  try {
    const result = await paymentService.processPayment(req.body);
    ApiResponse.created(res, result);
  } catch (err) { next(err); }
};

const getPaymentSummary = async (req, res, next) => {
  try {
    const result = await paymentService.getPaymentSummary(req.query.storeId, req.query.date);
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

module.exports = { getPaymentsByOrder, processPayment, getPaymentSummary };
