/**
 * Standardized API response helpers
 */

class ApiResponse {
    constructor(statusCode, data, message = 'Success') {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }
}

class ApiError extends Error {
    constructor(statusCode, message = 'Something went wrong', errors = [], stack = '') {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json(new ApiResponse(statusCode, data, message));
};

const sendError = (res, message = 'Something went wrong', statusCode = 500, errors = []) => {
    return res.status(statusCode).json({
        statusCode,
        success: false,
        message,
        errors,
        data: null,
    });
};

module.exports = { ApiResponse, ApiError, sendSuccess, sendError };
