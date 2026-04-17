const orderService = require('./order.service');
const { ApiResponse } = require('../../utils/ApiResponse');

const createPOSOrder = async (req, res, next) => {
  try {
    const order = await orderService.createPOSOrder(req.body, req.user?.id);
    if (req.io) req.io.emit('new-order', { orderId: order.id, type: 'pos' });
    ApiResponse.created(res, order, 'Order created');
  } catch (err) { next(err); }
};

const createOnlineOrder = async (req, res, next) => {
  try {
    const order = await orderService.createOnlineOrder(req.body, req.user?.id);
    if (req.io) req.io.emit('new-order', { orderId: order.id, type: 'online' });
    ApiResponse.created(res, order, 'Order placed successfully');
  } catch (err) { next(err); }
};

const syncOfflineOrder = async (req, res, next) => {
  try {
    const order = await orderService.syncOfflineOrder(req.body, req.user?.id);
    ApiResponse.success(res, order, 'Order synced');
  } catch (err) { next(err); }
};

const getOrders = async (req, res, next) => {
  try {
    const result = await orderService.getOrders(req.query);
    ApiResponse.paginated(res, result.orders, result.pagination);
  } catch (err) { next(err); }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    ApiResponse.success(res, order);
  } catch (err) { next(err); }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await orderService.updateOrderStatus(req.params.id, req.body.status, req.body.deliveryStatus);
    if (req.io) req.io.emit('order-status-updated', { orderId: order.id, status: order.status });
    ApiResponse.success(res, order, 'Order updated');
  } catch (err) { next(err); }
};

module.exports = { createPOSOrder, createOnlineOrder, syncOfflineOrder, getOrders, getOrderById, updateOrderStatus };
