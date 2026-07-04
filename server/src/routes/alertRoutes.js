import { Router } from 'express';
import { create, getById, update, remove, getAll, getUnread, markRead } from '../controllers/alertController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { checkOwnership } from '../middleware/ownershipMiddleware.js';
import { createAlertValidator, updateAlertValidator, alertQueryValidator } from '../validators/alert.validator.js';
import { validateIdParam } from '../validators/farmer.validator.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Alerts
 *   description: System alerts and pest/weather advisory notifications
 */

// All routes require authentication
router.use(authenticateUser);

/**
 * @swagger
 * /alerts:
 *   post:
 *     summary: Dispatch a new alert notification
 *     tags: [Alerts]
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
 *               - title
 *               - description
 *               - severity
 *               - expiresAt
 *             properties:
 *               farmerId:
 *                 type: string
 *                 example: 6a3cd0bd319eb5a97d0675de
 *               title:
 *                 type: string
 *                 example: Pest Advisory Alert
 *               description:
 *                 type: string
 *                 example: Potential pest sightings nearby.
 *               type:
 *                 type: string
 *                 enum: [weather, market, pest, system, general]
 *                 example: pest
 *               severity:
 *                 type: string
 *                 enum: [Low, Medium, High, Critical]
 *                 example: High
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-06-26T12:28:02.000Z"
 *     responses:
 *       201:
 *         description: Alert created successfully
 *       400:
 *         description: Validation failed
 *       403:
 *         description: Access denied (ownership validation failure)
 */
router.post('/', createAlertValidator, create);

/**
 * @swagger
 * /alerts:
 *   get:
 *     summary: Retrieve list of alert notifications (filtered/paginated)
 *     tags: [Alerts]
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
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [Low, Medium, High, Critical]
 *     responses:
 *       200:
 *         description: Alerts list retrieved successfully
 */
router.get('/', alertQueryValidator, getAll);

/**
 * @swagger
 * /alerts/unread:
 *   get:
 *     summary: Retrieve unread notifications list for farmer
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: farmerId
 *         schema:
 *           type: string
 *           description: Required only if query is run by an admin
 *     responses:
 *       200:
 *         description: Unread alerts retrieved successfully
 */
router.get('/unread', getUnread);

/**
 * @swagger
 * /alerts/{id}:
 *   get:
 *     summary: Retrieve a single alert details by ID
 *     tags: [Alerts]
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
 *         description: Alert retrieved successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Alert not found
 */
router.get('/:id', validateIdParam, checkOwnership('Alert'), getById);

/**
 * @swagger
 * /alerts/{id}:
 *   patch:
 *     summary: Update fields of an alert notification
 *     tags: [Alerts]
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               severity:
 *                 type: string
 *                 enum: [Low, Medium, High, Critical]
 *     responses:
 *       200:
 *         description: Alert updated successfully
 */
router.patch('/:id', validateIdParam, checkOwnership('Alert'), updateAlertValidator, update);

/**
 * @swagger
 * /alerts/{id}:
 *   delete:
 *     summary: Delete an alert notification
 *     tags: [Alerts]
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
 *         description: Alert deleted successfully
 */
router.delete('/:id', validateIdParam, checkOwnership('Alert'), remove);

/**
 * @swagger
 * /alerts/{id}/read:
 *   patch:
 *     summary: Mark an alert notification as read
 *     tags: [Alerts]
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
 *         description: Alert marked as read successfully
 */
router.patch('/:id/read', validateIdParam, checkOwnership('Alert'), markRead);

export default router;
