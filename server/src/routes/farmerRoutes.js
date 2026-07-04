import { Router } from 'express';
import { create, getById, update, remove, getAll } from '../controllers/farmerController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { checkOwnership } from '../middleware/ownershipMiddleware.js';
import { createFarmerValidator, updateFarmerValidator, validateIdParam, farmerQueryValidator } from '../validators/farmer.validator.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Farmers
 *   description: Farmer profiles management APIs
 */

// All routes require authentication
router.use(authenticateUser);

/**
 * @swagger
 * /farmers:
 *   post:
 *     summary: Create a new farmer profile
 *     tags: [Farmers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - state
 *               - district
 *               - landSize
 *             properties:
 *               userId:
 *                 type: string
 *                 description: Required only if requested by an admin
 *               state:
 *                 type: string
 *                 example: Punjab
 *               district:
 *                 type: string
 *                 example: Amritsar
 *               village:
 *                 type: string
 *                 example: Jassa
 *               pincode:
 *                 type: string
 *                 example: "143001"
 *               farmName:
 *                 type: string
 *                 example: Alpha Fields
 *               landSize:
 *                 type: number
 *                 example: 5.2
 *               landUnit:
 *                 type: string
 *                 enum: [acres, hectares, bigha]
 *                 example: acres
 *               cropType:
 *                 type: string
 *                 example: Wheat
 *               annualIncome:
 *                 type: number
 *                 example: 300000
 *     responses:
 *       201:
 *         description: Farmer profile created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 */
router.post('/', createFarmerValidator, create);

/**
 * @swagger
 * /farmers:
 *   get:
 *     summary: Retrieve list of farmer profiles (filtered/paginated)
 *     tags: [Farmers]
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
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *       - in: query
 *         name: district
 *         schema:
 *           type: string
 *       - in: query
 *         name: cropType
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [newest, oldest, landSize, annualIncome]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Farmers profiles list retrieved successfully
 */
router.get('/', farmerQueryValidator, getAll);

/**
 * @swagger
 * /farmers/{id}:
 *   get:
 *     summary: Fetch a farmer profile by ID
 *     tags: [Farmers]
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
 *         description: Farmer profile retrieved successfully
 *       403:
 *         description: Access denied (ownership validation failure)
 *       404:
 *         description: Farmer profile not found
 */
router.get('/:id', validateIdParam, checkOwnership('Farmer'), getById);

/**
 * @swagger
 * /farmers/{id}:
 *   patch:
 *     summary: Update farmer profile fields
 *     tags: [Farmers]
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
 *               farmName:
 *                 type: string
 *               landSize:
 *                 type: number
 *               landUnit:
 *                 type: string
 *                 enum: [acres, hectares, bigha]
 *               cropType:
 *                 type: string
 *               annualIncome:
 *                 type: number
 *     responses:
 *       200:
 *         description: Farmer profile updated successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Farmer profile not found
 */
router.patch('/:id', validateIdParam, checkOwnership('Farmer'), updateFarmerValidator, update);

/**
 * @swagger
 * /farmers/{id}:
 *   delete:
 *     summary: Soft delete a farmer profile
 *     tags: [Farmers]
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
 *         description: Farmer profile soft-deleted successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Farmer profile not found
 */
router.delete('/:id', validateIdParam, checkOwnership('Farmer'), remove);

export default router;
