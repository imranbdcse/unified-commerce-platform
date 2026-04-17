const zoneService = require('./zone.service');
const { ApiResponse } = require('../../utils/ApiResponse');

const getAllZones = async (req, res, next) => {
  try {
    const zones = await zoneService.getAllZones();
    ApiResponse.success(res, zones);
  } catch (err) { next(err); }
};

const getZoneSales = async (req, res, next) => {
  try {
    const result = await zoneService.getZoneSales(req.params.id, req.query);
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

const getZoneStock = async (req, res, next) => {
  try {
    const result = await zoneService.getZoneStock(req.params.id);
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

const getZoneOnlineOrders = async (req, res, next) => {
  try {
    const result = await zoneService.getZoneOnlineOrders(req.params.id);
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

const getZoneDetail = async (req, res, next) => {
  try {
    const result = await zoneService.getZoneDetail(req.params.id);
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

module.exports = { getAllZones, getZoneSales, getZoneStock, getZoneOnlineOrders, getZoneDetail };
