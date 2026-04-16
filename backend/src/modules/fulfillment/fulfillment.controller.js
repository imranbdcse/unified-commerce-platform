const fulfillmentService = require('./fulfillment.service');
const { ApiResponse } = require('../../utils/ApiResponse');

const processOnlineOrder = async (req, res, next) => {
  try {
    const result = await fulfillmentService.processOnlineOrder(req.params.orderId);
    ApiResponse.success(res, result, 'Order fulfillment initiated');
  } catch (err) { next(err); }
};

const findBestSource = async (req, res, next) => {
  try {
    const result = await fulfillmentService.findBestFulfillmentSource(req.params.orderId, req.body.deliveryAddress);
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

const createTransfer = async (req, res, next) => {
  try {
    const result = await fulfillmentService.createTransferRequest({ ...req.body, requestedBy: req.user?.id });
    ApiResponse.created(res, result, 'Transfer request created');
  } catch (err) { next(err); }
};

const approveTransfer = async (req, res, next) => {
  try {
    const result = await fulfillmentService.approveTransfer(req.params.id, req.user?.id);
    ApiResponse.success(res, result, 'Transfer approved');
  } catch (err) { next(err); }
};

const shipTransfer = async (req, res, next) => {
  try {
    const result = await fulfillmentService.shipTransfer(req.params.id);
    ApiResponse.success(res, result, 'Transfer shipped');
  } catch (err) { next(err); }
};

const receiveTransfer = async (req, res, next) => {
  try {
    const result = await fulfillmentService.receiveTransfer(req.params.id, req.body.items);
    ApiResponse.success(res, result, 'Transfer received');
  } catch (err) { next(err); }
};

const manualTransfer = async (req, res, next) => {
  try {
    const result = await fulfillmentService.manualTransfer({ ...req.body, requestedBy: req.user?.id });
    ApiResponse.created(res, result, 'Manual transfer created');
  } catch (err) { next(err); }
};

module.exports = { processOnlineOrder, findBestSource, createTransfer, approveTransfer, shipTransfer, receiveTransfer, manualTransfer };
