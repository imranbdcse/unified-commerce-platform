const inventoryService = require('./inventory.service');
const { ApiResponse } = require('../../utils/ApiResponse');

const getStoreInventory = async (req, res, next) => {
  try {
    const result = await inventoryService.getStoreInventory(req.params.storeId, req.query);
    ApiResponse.paginated(res, result.inventory, result.pagination);
  } catch (err) { next(err); }
};

const updateStock = async (req, res, next) => {
  try {
    const result = await inventoryService.updateStock(req.params.storeId, req.body.productId, req.body.quantity, req.body.type);
    ApiResponse.success(res, result, 'Stock updated');
    if (req.io) req.io.to(`store-${req.params.storeId}`).emit('stock-updated', result);
  } catch (err) { next(err); }
};

const getLowStockAlerts = async (req, res, next) => {
  try {
    const result = await inventoryService.getLowStockAlerts(req.params.storeId);
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

module.exports = { getStoreInventory, updateStock, getLowStockAlerts };
