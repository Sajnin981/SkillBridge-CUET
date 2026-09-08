/**
 * Custom operational error class so the global error handler can distinguish
 * expected errors (bad input, not found, unauthorized) from unexpected ones.
 */
class AppError extends Error {
  /**
   * @param {string} message
  * @param {number} statusCode - HTTP status code
  * @param {Array} [errors] - Field-level validation errors
   */
  constructor(message, statusCode = 400, errors) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
