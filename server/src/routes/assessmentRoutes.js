import { Router } from 'express';
import { create, getById, update, remove, getAll } from '../controllers/assessmentController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { checkOwnership } from '../middleware/ownershipMiddleware.js';
import { createAssessmentValidator, updateAssessmentValidator, assessmentQueryValidator } from '../validators/assessment.validator.js';
import { validateIdParam } from '../validators/farmer.validator.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Assessments
 *   description: Farmer risk assessments management APIs
 */

// All routes require authentication
router.use(authenticateUser);

/**
 * @swagger
 * /assessments:
 *   post:
 *     summary: Create a new farmer risk assessment
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - farmerId
 *               - financialRisk
 *               - weatherRisk
 *               - cropRisk
 *               - marketRisk
 *               - wellnessRisk
 *               - overallRisk
 *               - recommendation
 *               - summary
 *             properties:
 *               farmerId:
 *                 type: string
 *                 example: 6a3cd0bd319eb5a97d0675de
 *               financialRisk:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 20
 *               weatherRisk:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 40
 *               cropRisk:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 30
 *               marketRisk:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 15
 *               wellnessRisk:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 10
 *               overallRisk:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 23
 *               recommendation:
 *                 type: string
 *                 example: Plant high yield seeds and irrigate on Day 3.
 *               summary:
 *                 type: string
 *                 example: Low risk layout overview
 *     responses:
 *       201:
 *         description: Assessment created successfully
 *       400:
 *         description: Validation failed
 *       403:
 *         description: Access denied (ownership validation failure)
 */
router.post('/', createAssessmentValidator, create);

/**
 * @swagger
 * /assessments:
 *   get:
 *     summary: Retrieve list of assessments (filtered/paginated)
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: farmerId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assessments list retrieved successfully
 */
router.get('/', assessmentQueryValidator, getAll);

/**
 * @swagger
 * /assessments/{id}:
 *   get:
 *     summary: Retrieve assessment by ID
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assessment retrieved successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Assessment not found
 */
router.get('/:id', validateIdParam, checkOwnership('Assessment'), getById);

/**
 * @swagger
 * /assessments/{id}:
 *   patch:
 *     summary: Update fields of a risk assessment
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               financialRisk:
 *                 type: number
 *               recommendation:
 *                 type: string
 *               summary:
 *                 type: string
 *     responses:
 *       200:
 *         description: Assessment updated successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Assessment not found
 */
router.patch('/:id', validateIdParam, checkOwnership('Assessment'), updateAssessmentValidator, update);

/**
 * @swagger
 * /assessments/{id}:
 *   delete:
 *     summary: Delete a risk assessment
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assessment deleted successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Assessment not found
 */
router.delete('/:id', validateIdParam, checkOwnership('Assessment'), remove);

export default router;
