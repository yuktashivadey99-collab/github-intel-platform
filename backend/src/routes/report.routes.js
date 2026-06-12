const express = require('express');
const router = express.Router();
const { getReports, getReport, getSharedReport, deleteReport, togglePublic } = require('../controllers/report.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validate.middleware');

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Saved analysis reports management
 */

/**
 * @swagger
 * /reports:
 *   get:
 *     summary: Get all reports for current user
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Paginated reports list
 */
router.get('/', protect, validate(schemas.paginationQuery, 'query'), getReports);

/**
 * @swagger
 * /reports/{id}:
 *   get:
 *     summary: Get a report by ID
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Report details
 *       404:
 *         description: Report not found
 */
router.get('/:id', protect, getReport);

/**
 * @swagger
 * /reports/{id}/toggle-public:
 *   patch:
 *     summary: Toggle public/private visibility of a report
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Visibility updated, returns shareToken if made public
 */
router.patch('/:id/toggle-public', protect, togglePublic);

/**
 * @swagger
 * /reports/shared/{token}:
 *   get:
 *     summary: Access a publicly shared report via share token
 *     tags: [Reports]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Shared report data
 *       404:
 *         description: Report not found or not public
 */
router.get('/shared/:token', optionalAuth, getSharedReport);

/**
 * @swagger
 * /reports/{id}:
 *   delete:
 *     summary: Delete a report
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Report deleted
 */
router.delete('/:id', protect, deleteReport);

module.exports = router;
