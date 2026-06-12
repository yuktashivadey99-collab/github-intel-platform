const express = require('express');
const router = express.Router();
const { analyzeRepo, getAnalysis, getUserAnalyses, deleteAnalysis } = require('../controllers/repo.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validate.middleware');

/**
 * @swagger
 * tags:
 *   name: Repository Analysis
 *   description: GitHub repository intelligence analysis
 */

/**
 * @swagger
 * /repo/analyze:
 *   post:
 *     summary: Trigger full analysis of a GitHub repository
 *     tags: [Repository Analysis]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [repoUrl]
 *             properties:
 *               repoUrl:
 *                 type: string
 *                 example: https://github.com/facebook/react
 *               githubToken:
 *                 type: string
 *                 description: Optional personal GitHub token for private repos
 *               includeAiInsights:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       202:
 *         description: Analysis started, returns analysis ID
 *       422:
 *         description: Invalid repository URL
 *       429:
 *         description: Analysis rate limit exceeded
 */
router.post('/analyze', protect, validate(schemas.analyzeRepo), analyzeRepo);

/**
 * @swagger
 * /repo/analyses:
 *   get:
 *     summary: Get all analyses for the current user
 *     tags: [Repository Analysis]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [createdAt, updatedAt, overallScore] }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc] }
 *     responses:
 *       200:
 *         description: Paginated list of analyses
 */
router.get('/analyses', protect, validate(schemas.paginationQuery, 'query'), getUserAnalyses);

/**
 * @swagger
 * /repo/analyses/{id}:
 *   get:
 *     summary: Get a specific analysis by ID
 *     tags: [Repository Analysis]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Analysis details
 *       404:
 *         description: Analysis not found
 */
router.get('/analyses/:id', protect, getAnalysis);

/**
 * @swagger
 * /repo/analyses/{id}:
 *   delete:
 *     summary: Delete an analysis
 *     tags: [Repository Analysis]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Analysis deleted
 *       404:
 *         description: Analysis not found
 */
router.delete('/analyses/:id', protect, deleteAnalysis);

module.exports = router;
