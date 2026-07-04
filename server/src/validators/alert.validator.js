import { body, query } from 'express-validator';
import { validateFields } from './auth.validator.js';

export const createAlertValidator = [
  body('farmerId')
    .notEmpty()
    .withMessage('Farmer ID is required')
    .isMongoId()
    .withMessage('Farmer ID must be a valid Mongo ObjectId'),
    
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required'),
    
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
    
  body('type')
    .optional()
    .isIn(['weather', 'market', 'pest', 'system', 'general'])
    .withMessage('Type must be weather, market, pest, system, or general'),
    
  body('severity')
    .notEmpty()
    .withMessage('Severity is required')
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Severity must be Low, Medium, High, or Critical'),
    
  body('expiresAt')
    .notEmpty()
    .withMessage('expiresAt date is required')
    .isISO8601()
    .withMessage('expiresAt must be a valid ISO 8601 date format'),
    
  validateFields,
];

export const updateAlertValidator = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  
  body('type')
    .optional()
    .isIn(['weather', 'market', 'pest', 'system', 'general'])
    .withMessage('Type must be weather, market, pest, system, or general'),
    
  body('severity')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Severity must be Low, Medium, High, or Critical'),
    
  body('isRead')
    .optional()
    .isBoolean()
    .withMessage('isRead must be a boolean value'),
    
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('expiresAt must be a valid ISO 8601 date'),
    
  validateFields,
];

export const alertQueryValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer >= 1'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100'),
  query('farmerId')
    .optional()
    .isMongoId()
    .withMessage('farmerId must be a valid Mongo ObjectId'),
  query('severity')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Severity must be Low, Medium, High, or Critical'),
  validateFields,
];
