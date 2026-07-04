import { body, param, query } from 'express-validator';
import { validateFields } from './auth.validator.js';

export const createFarmerValidator = [
  body('userId')
    .custom((value, { req }) => {
      if (req.user && req.user.role === 'admin') {
        if (!value) {
          throw new Error('User ID is required');
        }
      }
      if (value && !/^[0-9a-fA-F]{24}$/.test(value)) {
        throw new Error('User ID must be a valid Mongo ObjectId');
      }
      return true;
    }),
    
  body('state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
    
  body('district')
    .trim()
    .notEmpty()
    .withMessage('District is required'),
    
  body('pincode')
    .optional({ values: 'falsy' })
    .trim()
    .matches(/^[1-9]\d{5}$/)
    .withMessage('Please provide a valid 6-digit Indian postal code'),
    
  body('landSize')
    .notEmpty()
    .withMessage('Land size is required')
    .isFloat({ min: 0 })
    .withMessage('Land size must be a positive number'),
    
  body('landUnit')
    .optional()
    .isIn(['acres', 'hectares', 'bigha'])
    .withMessage('Land unit must be acres, hectares, or bigha'),
    
  body('annualIncome')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Annual income must be a positive number'),
    
  body('loanAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Loan amount must be a positive number'),
    
  body('farmingExperience')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Farming experience must be a non-negative integer'),
    
  body('latitude')
    .optional({ values: 'falsy' })
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
    
  body('longitude')
    .optional({ values: 'falsy' })
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
    
  validateFields,
];

export const updateFarmerValidator = [
  body('state')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('State cannot be empty'),
    
  body('district')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('District cannot be empty'),
    
  body('pincode')
    .optional({ values: 'falsy' })
    .trim()
    .matches(/^[1-9]\d{5}$/)
    .withMessage('Please provide a valid 6-digit Indian postal code'),
    
  body('landSize')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Land size must be a positive number'),
    
  body('landUnit')
    .optional()
    .isIn(['acres', 'hectares', 'bigha'])
    .withMessage('Land unit must be acres, hectares, or bigha'),
    
  body('annualIncome')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Annual income must be a positive number'),
    
  body('loanAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Loan amount must be a positive number'),
    
  body('farmingExperience')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Farming experience must be a non-negative integer'),
    
  body('latitude')
    .optional({ values: 'falsy' })
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
    
  body('longitude')
    .optional({ values: 'falsy' })
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
    
  validateFields,
];

export const validateIdParam = [
  param('id')
    .isMongoId()
    .withMessage('Invalid resource ID format'),
  validateFields,
];

export const farmerQueryValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer greater than or equal to 1'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100'),
  query('search')
    .optional()
    .trim()
    .isString()
    .withMessage('Search term must be a string'),
  query('cropType')
    .optional()
    .trim()
    .isString(),
  query('state')
    .optional()
    .trim()
    .isString(),
  query('district')
    .optional()
    .trim()
    .isString(),
  query('sortBy')
    .optional()
    .isIn(['newest', 'oldest', 'landSize', 'annualIncome'])
    .withMessage('Invalid sortBy parameter'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('sortOrder must be asc or desc'),
  validateFields,
];
