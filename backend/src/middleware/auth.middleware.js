const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ApiError } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');

/**
 * Protect routes — verifies JWT from Authorization header
 * Attaches decoded user to req.user
 */
const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Extract token from Bearer header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        throw new ApiError(401, 'Access denied. No token provided.');
    }

    // Verify token
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            throw new ApiError(401, 'Token has expired. Please log in again.');
        }
        throw new ApiError(401, 'Invalid token. Please log in again.');
    }

    // Attach user to request (exclude password)
    const user = await User.findById(decoded.id).select('-password -githubToken');
    if (!user) {
        throw new ApiError(401, 'User belonging to this token no longer exists.');
    }

    req.user = user;
    next();
});

/**
 * Restrict access to specific roles
 * Usage: authorize('admin')
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new ApiError(
                403,
                `Role '${req.user.role}' is not authorized to access this resource.`
            );
        }
        next();
    };
};

/**
 * Optional auth — attaches user if token present, but doesn't block if missing
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password -githubToken');
        } catch {
            // Silent — optional auth doesn't block
        }
    }

    next();
});

module.exports = { protect, authorize, optionalAuth };
