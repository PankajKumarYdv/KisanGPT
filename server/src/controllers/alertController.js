import * as alertService from '../services/alertService.js';
import * as farmerRepository from '../repositories/farmerRepository.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const create = asyncHandler(async (req, res, next) => {
  const ipAddress = req.ip;
  const actorId = req.user.id;

  if (req.user.role !== 'admin') {
    const farmer = await farmerRepository.findById(req.body.farmerId);
    const farmerUserId = farmer && farmer.userId && (farmer.userId._id ? farmer.userId._id.toString() : farmer.userId.toString());
    if (!farmer || farmerUserId !== req.user.id) {
      throw new ApiError(403, 'Access denied: You do not own this farmer profile');
    }
  }

  const alert = await alertService.createAlert(req.body, actorId, ipAddress);
  return new ApiResponse(201, 'Alert created successfully', alert).send(res);
});

export const getById = asyncHandler(async (req, res, next) => {
  const ipAddress = req.ip;
  const actorId = req.user.id;
  const alert = await alertService.getAlertById(req.params.id, actorId, ipAddress);
  return new ApiResponse(200, 'Alert retrieved successfully', alert).send(res);
});

export const update = asyncHandler(async (req, res, next) => {
  const ipAddress = req.ip;
  const actorId = req.user.id;
  const alert = await alertService.updateAlert(req.params.id, req.body, actorId, ipAddress);
  return new ApiResponse(200, 'Alert updated successfully', alert).send(res);
});

export const remove = asyncHandler(async (req, res, next) => {
  const ipAddress = req.ip;
  const actorId = req.user.id;
  await alertService.deleteAlert(req.params.id, actorId, ipAddress);
  return new ApiResponse(200, 'Alert deleted successfully').send(res);
});

export const markRead = asyncHandler(async (req, res, next) => {
  const ipAddress = req.ip;
  const actorId = req.user.id;
  const alert = await alertService.markAlertAsRead(req.params.id, actorId, ipAddress);
  return new ApiResponse(200, 'Alert marked as read successfully', alert).send(res);
});

export const getUnread = asyncHandler(async (req, res, next) => {
  const ipAddress = req.ip;
  const actorId = req.user.id;
  
  let farmerId = req.query.farmerId;

  if (req.user.role !== 'admin') {
    const farmer = await farmerRepository.findByUserId(req.user.id);
    if (!farmer) {
      return new ApiResponse(200, 'Unread alerts retrieved successfully', []).send(res);
    }
    farmerId = farmer._id;
  }

  const alerts = await alertService.getUnreadAlerts(farmerId, actorId, ipAddress);
  return new ApiResponse(200, 'Unread alerts retrieved successfully', alerts).send(res);
});

export const getAll = asyncHandler(async (req, res, next) => {
  const ipAddress = req.ip;
  const actorId = req.user.id;
  const { page, limit, farmerId, severity } = req.query;

  const queryParams = { page, limit, severity };

  if (req.user.role !== 'admin') {
    const farmer = await farmerRepository.findByUserId(req.user.id);
    if (!farmer) {
      return new ApiResponse(200, 'Alerts list retrieved successfully', [], {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        totalPages: 0,
        totalRecords: 0
      }).send(res);
    }
    queryParams.farmerId = farmer._id;
  } else if (farmerId) {
    queryParams.farmerId = farmerId;
  }

  const { records, pagination } = await alertService.getAlerts(queryParams, actorId, ipAddress);
  return new ApiResponse(200, 'Alerts list retrieved successfully', records, pagination).send(res);
});
