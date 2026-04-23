const ApiError = require('../utils/apiError');

const notFound = (req, res, next) => {
    next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    
    // Log error for developers
    if (statusCode === 500 || process.env.NODE_ENV === 'development') {
        console.error(`[ERROR] ${req.method} ${req.url}`);
        console.error(err.stack);
    }

    const response = {
        status: 'error',
        message: err.message || 'Internal server error'
    };

    if (err.details) {
        response.details = err.details;
    }

    // Include stack trace only in development
    if (process.env.NODE_ENV === 'development' && statusCode === 500) {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

module.exports = {
    notFound,
    errorHandler
};
