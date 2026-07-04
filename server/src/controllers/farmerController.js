import * as farmerService from '../services/farmerService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const create = asyncHandler(async (req, res, next) => {
  const ipAddress = req.ip;
  const actorId = req.user.id;
  const userIdToUse = req.user.role === 'admin' ? req.body.userId : req.user.id;
  
  const farmerData = { ...req.body, userId: userIdToUse };
  const farmer = await farmerService.createFarmer(farmerData, actorId, ipAddress);
  return new ApiResponse(201, 'Farmer profile created successfully', farmer).send(res);
});

export const getById = asyncHandler(async (req, res, next) => {
  const ipAddress = req.ip;
  const actorId = req.user.id;
  const farmer = await farmerService.getFarmerById(req.params.id, actorId, ipAddress);
  return new ApiResponse(200, 'Farmer profile retrieved successfully', farmer).send(res);
});

export const update = asyncHandler(async (req, res, next) => {
  const ipAddress = req.ip;
  const actorId = req.user.id;
  const farmer = await farmerService.updateFarmer(req.params.id, req.body, actorId, ipAddress);
  return new ApiResponse(200, 'Farmer profile updated successfully', farmer).send(res);
});

export const remove = asyncHandler(async (req, res, next) => {
  const ipAddress = req.ip;
  const actorId = req.user.id;
  await farmerService.deleteFarmer(req.params.id, actorId, ipAddress);
  return new ApiResponse(200, 'Farmer profile soft-deleted successfully').send(res);
});

export const getAll = asyncHandler(async (req, res, next) => {
  const ipAddress = req.ip;
  const actorId = req.user.id;
  const { page, limit, search, cropType, state, district, sortBy, sortOrder } = req.query;

  const queryParams = {
    page,
    limit,
    search,
    cropType,
    state,
    district,
    sortBy,
    sortOrder,
  };

  if (req.user.role !== 'admin') {
    queryParams.userId = req.user.id;
  }

  const { records, pagination } = await farmerService.getFarmers(queryParams, actorId, ipAddress);
  return new ApiResponse(200, 'Farmers profiles list retrieved successfully', records, pagination).send(res);
});
