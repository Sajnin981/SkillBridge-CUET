const AppError = require("../utils/AppError");
const castDBError = require("../utils/castDBError");
const { error: sendError } = require("../utils/apiResponse");

/**
 * Centralized error handler. Mounted as the last middleware in app.js.
 * Converts non-operational errors into a safe 500 and always returns the
 * consistent JSON envelope.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  let error = err;

  // Normalize known library errors into AppError instances.
  if (!error.isOperational) {
    error = castDBError(error);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error.";

  // Log full stack for unexpected (non-operational) errors only.
  if (!error.isOperational) {
    console.error("💥 Unexpected error:", error);
  }

  return sendError(res, {
    statusCode,
    message,
    ...(error.errors ? { errors: error.errors } : {}),
  });
};

/**
 * Fallback for unmatched routes — creates a 404 AppError to pass to the handler.
 */
const notFound = (req, _res, next) =>
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));

module.exports = { errorHandler, notFound };
