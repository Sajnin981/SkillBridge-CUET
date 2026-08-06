/**
 * Custom operational error class so the global error handler can distinguish
 * expected errors (bad input, not found, unauthorized) from unexpected ones.
 */
class AppError extends Error {
  /**
   * @param {string} message
   * @param {number} statusCode - HTTP status code
   */
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
