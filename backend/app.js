const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { swaggerUi, swaggerSpec } = require('./swagger');

// Route imports
const authRoutes = require('./src/routes/auth.routes');
const repoRoutes = require('./src/routes/repo.routes');
const reportRoutes = require('./src/routes/report.routes');

// Error & response utilities
const { sendError } = require('./src/utils/apiResponse');

const app = express();

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet());

app.use(
    cors({
        origin: process.env.ALLOWED_ORIGINS
            ? process.env.ALLOWED_ORIGINS.split(',')
            : ['http://localhost:3000', 'http://localhost:5173'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Stricter limiter for analysis (computationally expensive)
const analysisLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    message: { success: false, message: 'Analysis limit reached. Max 20 analyses per hour.' },
});
app.use('/api/v1/repo/analyze', analysisLimiter);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── Logging ─────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ─── API Documentation ───────────────────────────────────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css',
    customSiteTitle: 'GitHub Intel API Docs',
    swaggerOptions: { persistAuthorization: true },
}));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'GitHub Intel Platform API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
    });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/repo', repoRoutes);
app.use('/api/v1/reports', reportRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
    sendError(res, `Route '${req.originalUrl}' not found`, 404);
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error(`[Error] ${err.message}`, err.stack);

    const statusCode = err.statusCode || 500;
    const message =
        process.env.NODE_ENV === 'production' && statusCode === 500
            ? 'Internal server error'
            : err.message;

    sendError(res, message, statusCode, err.errors || []);
});

module.exports = app;
