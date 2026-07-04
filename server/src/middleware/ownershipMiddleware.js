import { Farmer } from '../models/Farmer.js';
import { Assessment } from '../models/Assessment.js';
import { Alert } from '../models/Alert.js';
import { ApiError } from '../utils/apiError.js';

export const checkOwnership = (modelName) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }

      // Admins are bypass-authorized
      if (req.user.role === 'admin') {
        return next();
      }

      const resourceId = req.params.id;

      if (modelName === 'Farmer') {
        const farmer = await Farmer.findById(resourceId);
        if (!farmer) {
          throw new ApiError(404, 'Farmer profile not found');
        }
        const farmerUserId = farmer.userId && (farmer.userId._id ? farmer.userId._id.toString() : farmer.userId.toString());
        if (farmerUserId !== req.user.id) {
          throw new ApiError(403, 'Access denied: You do not own this farmer profile');
        }
      } else if (modelName === 'Assessment') {
        const assessment = await Assessment.findById(resourceId);
        if (!assessment) {
          throw new ApiError(404, 'Assessment not found');
        }
        const farmer = await Farmer.findById(assessment.farmerId);
        const farmerUserId = farmer && farmer.userId && (farmer.userId._id ? farmer.userId._id.toString() : farmer.userId.toString());
        if (!farmer || farmerUserId !== req.user.id) {
          throw new ApiError(403, 'Access denied: You do not own this assessment');
        }
      } else if (modelName === 'Alert') {
        const alert = await Alert.findById(resourceId);
        if (!alert) {
          throw new ApiError(404, 'Alert not found');
        }
        const farmer = await Farmer.findById(alert.farmerId);
        const farmerUserId = farmer && farmer.userId && (farmer.userId._id ? farmer.userId._id.toString() : farmer.userId.toString());
        if (!farmer || farmerUserId !== req.user.id) {
          throw new ApiError(403, 'Access denied: You do not own this alert');
        }
      }

      next();
    } catch (error) {
      if (error instanceof ApiError) {
        return error.send(res);
      }
      return res.status(500).json({
        success: false,
        message: 'Internal server error during ownership check',
        errors: [error.message],
      });
    }
  };
};
