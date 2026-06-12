/**
 * Async wrapper to eliminate try/catch boilerplate in controllers
 * @param {Function} fn - Async route handler
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        next(error);
    }
};

module.exports = { asyncHandler };
