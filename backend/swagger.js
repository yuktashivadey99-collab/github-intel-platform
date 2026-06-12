const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'GitHub Intelligence Platform API',
            version: '1.0.0',
            description:
                'REST API for analyzing GitHub repositories — health scoring, commit patterns, contributor analysis, tech stack detection, and AI-powered insights.',
            contact: {
                name: 'GitHub Intel Platform',
            },
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 5000}/api/v1`,
                description: 'Development Server',
            },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token',
                },
            },
            schemas: {
                ApiResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        statusCode: { type: 'integer' },
                        message: { type: 'string' },
                        data: { type: 'object' },
                    },
                },
                ApiError: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        statusCode: { type: 'integer' },
                        message: { type: 'string' },
                        errors: { type: 'array', items: { type: 'object' } },
                    },
                },
            },
        },
        security: [{ BearerAuth: [] }],
    },
    // Scan all route files for JSDoc comments
    apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerUi, swaggerSpec };
