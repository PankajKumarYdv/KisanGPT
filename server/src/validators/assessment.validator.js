import { body, query } from 'express-validator';
import { validateFields } from './auth.validator.js';

const riskValidation = (field) => 
  body(field)
    .notEmpty()
    .withMessage(`${field} is required`)
    .isFloat({ min: 0, max: 100 })
    .withMessage(`${field} must be a number between 0 and 100`);

export const createAssessmentValidator = [
  body('farmerId')
    .notEmpty()
    .withMessage('Farmer ID is required')
    .isMongoId()
    .withMessage('Farmer ID must be a valid Mongo ObjectId'),
    
  riskValidation('financialRisk'),
  riskValidation('weatherRisk'),
  riskValidation('cropRisk'),
  riskValidation('marketRisk'),
  riskValidation('wellnessRisk'),
  riskValidation('overallRisk'),
  
  body('recommendation')
    .trim()
    .notEmpty()
    .withMessage('Recommendation is required'),
    
  body('summary')
    .trim()
    .notEmpty()
    .withMessage('Summary is required'),
    
  body('assessmentStatus')
    .optional()
    .isIn(['Pending', 'Completed', 'Failed'])
    .withMessage('Status must be Pending, Completed, or Failed'),
    
  validateFields,
];

export const updateAssessmentValidator = [
  body('financialRisk').optional().isFloat({ min: 0, max: 100 }).withMessage('financialRisk must be a number between 0 and 100'),
  body('weatherRisk').optional().isFloat({ min: 0, max: 100 }).withMessage('weatherRisk must be a number between 0 and 100'),
  body('cropRisk').optional().isFloat({ min: 0, max: 100 }).withMessage('cropRisk must be a number between 0 and 100'),
  body('marketRisk').optional().isFloat({ min: 0, max: 100 }).withMessage('marketRisk must be a number between 0 and 100'),
  body('wellnessRisk').optional().isFloat({ min: 0, max: 100 }).withMessage('wellnessRisk must be a number between 0 and 100'),
  body('overallRisk').optional().isFloat({ min: 0, max: 100 }).withMessage('overallRisk must be a number between 0 and 100'),
  
  body('recommendation').optional().trim().notEmpty().withMessage('Recommendation cannot be empty'),
  body('summary').optional().trim().notEmpty().withMessage('Summary cannot be empty'),
  
  body('assessmentStatus')
    .optional()
    .isIn(['Pending', 'Completed', 'Failed'])
    .withMessage('Status must be Pending, Completed, or Failed'),
    
  validateFields,
];

export const assessmentQueryValidator = [
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
  validateFields,
];
