const express = require('express');
const router = express.Router();
const { register, login, getMe, updateGithubToken } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validate.middleware');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication & profile
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: secret123
 *               githubToken:
 *                 type: string
 *                 example: ghp_xxxxxxxxxxxx
 *     responses:
 *       201:
 *         description: User registered successfully
 *       422:
 *         description: Validation error
 *       409:
 *         description: Email already exists
 */
router.post('/register', validate(schemas.register), register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login and receive JWT
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validate(schemas.login), login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *       401:
 *         description: Unauthorized
 */
router.get('/me', protect, getMe);

/**
 * @swagger
 * /auth/github-token:
 *   patch:
 *     summary: Update user's GitHub personal access token
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [githubToken]
 *             properties:
 *               githubToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token updated successfully
 */
router.patch('/github-token', protect, updateGithubToken);

module.exports = router;
