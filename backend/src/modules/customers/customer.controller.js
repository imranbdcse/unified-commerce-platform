const customerService = require('./customer.service');
const { ApiResponse } = require('../../utils/ApiResponse');

const getCustomers = async (req, res, next) => {
  try {
    const result = await customerService.getCustomers(req.query);
    ApiResponse.paginated(res, result.customers, result.pagination);
  } catch (err) { next(err); }
};

const getCustomerById = async (req, res, next) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id);
    ApiResponse.success(res, customer);
  } catch (err) { next(err); }
};

const searchByPhone = async (req, res, next) => {
  try {
    const customer = await customerService.searchByPhone(req.query.phone);
    ApiResponse.success(res, customer);
  } catch (err) { next(err); }
};

const createCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.createCustomer(req.body);
    ApiResponse.created(res, customer);
  } catch (err) { next(err); }
};

const updateCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.updateCustomer(req.params.id, req.body);
    ApiResponse.success(res, customer, 'Customer updated');
  } catch (err) { next(err); }
};

const addAddress = async (req, res, next) => {
  try {
    const address = await customerService.addAddress(req.params.id, req.body);
    ApiResponse.created(res, address);
  } catch (err) { next(err); }
};

module.exports = { getCustomers, getCustomerById, searchByPhone, createCustomer, updateCustomer, addAddress };
