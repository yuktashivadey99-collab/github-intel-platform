const Joi = require('joi');
const { sendError } = require('../utils/apiResponse');

/**
 * Factory function — creates a Joi validation middleware for a given schema
 * @param {Joi.ObjectSchema} schema - Joi schema to validate against
 * @param {string} source - 'body' | 'query' | 'params'
 * @returns {Function} Express middleware
 */
const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[source], {
            abortEarly: false,    // Collect all errors, not just the first
            stripUnknown: true,   // Remove unknown fields from input
            convert: true,        // Type coerce where possible
        });

        if (error) {
            const errors = error.details.map((detail) => ({
                field: detail.path.join('.'),
                message: detail.message.replace(/['"]/g, ''),
            }));

            return sendError(res, 'Validation failed', 422, errors);
        }

        // Replace req[source] with sanitized/validated value
        req[source] = value;
        next();
    };
};

// ─── Reusable Joi Schemas ─────────────────────────────────────────────────────

const schemas = {
    register: Joi.object({
        name: Joi.string().trim().min(2).max(100).required(),
        email: Joi.string().email().lowercase().trim().required(),
        password: Joi.string().min(8).max(128).required(),
        githubToken: Joi.string().optional().allow(''),
    }),

    login: Joi.object({
        email: Joi.string().email().lowercase().trim().required(),
        password: Joi.string().required(),
    }),

    analyzeRepo: Joi.object({
        repoUrl: Joi.string()
            .uri({ scheme: ['https'] })
            .pattern(/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/)
            .required()
            .messages({
                'string.pattern.base': 'repoUrl must be a valid GitHub repository URL (e.g., https://github.com/owner/repo)',
            }),
        githubToken: Joi.string().optional().allow(''),
        includeAiInsights: Joi.boolean().default(true),
    }),

    paginationQuery: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(50).default(10),
        sortBy: Joi.string().valid('createdAt', 'updatedAt', 'overallScore').default('createdAt'),
        order: Joi.string().valid('asc', 'desc').default('desc'),
    }),
};

module.exports = { validate, schemas };
