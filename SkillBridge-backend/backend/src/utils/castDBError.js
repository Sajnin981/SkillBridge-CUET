const AppError = require("./AppError");

/**
 * Convert various Mongoose / library errors into a consistent AppError so the
 * centralized error handler always receives an operational error.
 */
const castDBError = (err) => {
  let message = err.message;

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
  }

  // Mongoose duplicate key (e.g. duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `Duplicate value for ${field}: ${err.keyValue?.[field]}`;
    return new AppError(message, 409);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return new AppError(`Validation failed: ${messages.join(", ")}`, 400);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return new AppError("Invalid token. Please log in again.", 401);
  }
  if (err.name === "TokenExpiredError") {
    return new AppError("Your session has expired. Please log in again.", 401);
  }

  // Multer errors
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return new AppError("File too large. Please upload a smaller file.", 413);
    }
    return new AppError(err.message || "File upload error.", 400);
  }

  return err;
};

module.exports = castDBError;
