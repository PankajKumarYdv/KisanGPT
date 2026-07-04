import * as assessmentService from '../services/assessmentService.js';
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
  
  const assessment = await assessmentService.createAssessment(req.body, actorId, ipAddress);
  return new ApiResponse(201, 'Assessment created successfully', assessment).send(res);
});

export const getById = asyncHandler(async (req, res, next) => {
  const ipAddress = req.ip;
  const actorId = req.user.id;
  const assessment = await assessmentService.getAssessmentById(req.params.id, actorId, ipAddress);
  return new ApiResponse(200, 'Assessment retrieved successfully', assessment).send(res);
});

export const update = asyncHandler(async (req, res, next) => {
  const ipAddress = req.ip;
  const actorId = req.user.id;
  const assessment = await assessmentService.updateAssessment(req.params.id, req.body, actorId, ipAddress);
  return new ApiResponse(200, 'Assessment updated successfully', assessment).send(res);
});

export const remove = asyncHandler(async (req, res, next) => {
  const ipAddress = req.ip;
  const actorId = req.user.id;
  await assessmentService.deleteAssessment(req.params.id, actorId, ipAddress);
  return new ApiResponse(200, 'Assessment deleted successfully').send(res);
});

export const getAll = asyncHandler(async (req, res, next) => {
  const ipAddress = req.ip;
  const actorId = req.user.id;
  const { page, limit, farmerId } = req.query;

  const queryParams = { page, limit };

  if (req.user.role !== 'admin') {
    const farmer = await farmerRepository.findByUserId(req.user.id);
    if (!farmer) {
      return new ApiResponse(200, 'Assessments list retrieved successfully', [], {
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

  const { records, pagination } = await assessmentService.getAssessments(queryParams, actorId, ipAddress);
  return new ApiResponse(200, 'Assessments list retrieved successfully', records, pagination).send(res);
});
