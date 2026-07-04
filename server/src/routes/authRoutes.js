import { Router } from 'express';
import { register, login, refresh, logout, me, changePassword, profile } from '../controllers/authController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { registerValidator, loginValidator, changePasswordValidator, updateProfileValidator } from '../validators/auth.validator.js';
import { loginRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User registration, login, and profile operations
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *               - confirmPassword
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Rajesh Kumar
 *               email:
 *                 type: string
 *                 example: rajesh@example.com
 *               phone:
 *                 type: string
 *                 example: "+919876543210"
 *               password:
 *                 type: string
 *                 example: SecurePass123!
 *               confirmPassword:
 *                 type: string
 *                 example: SecurePass123!
 *               role:
 *                 type: string
 *                 enum: [farmer, admin, advisor]
 *                 example: farmer
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post('/register', registerValidator, register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate user & get session tokens
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: rajesh@example.com
 *               password:
 *                 type: string
 *                 example: SecurePass123!
 *     responses:
 *       200:
 *         description: Login successful (Sets HttpOnly cookies accessToken & refreshToken)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Invalid email or password
 */
router.post('/login', loginRateLimiter, loginValidator, login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh JWT access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       400:
 *         description: Refresh token required
 *       401:
 *         description: Invalid token
 */
router.post('/refresh', refresh);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout current user and clear token cookies
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', authenticateUser, logout);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Retrieve current authenticated user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticateUser, me);

/**
 * @swagger
 * /auth/change-password:
 *   patch:
 *     summary: Update password for current user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *               - confirmNewPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               confirmNewPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Validation failed or incorrect old password
 */
router.patch('/change-password', authenticateUser, changePasswordValidator, changePassword);

/**
 * @swagger
 * /auth/profile:
 *   patch:
 *     summary: Update current user profile fields
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               phone:
 *                 type: string
 *               preferredLanguage:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.patch('/profile', authenticateUser, updateProfileValidator, profile);

export default router;
