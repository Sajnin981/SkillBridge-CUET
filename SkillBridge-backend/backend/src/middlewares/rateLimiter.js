const rateLimit = require("express-rate-limit");

/**
 * Generic API rate limiter (per IP). Tighter limits can be applied per-route
 * (e.g. login) where needed.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again later.",
  },
});

/**
 * Stricter limiter for authentication endpoints to slow brute-force attempts.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
  },
});

module.exports = { apiLimiter, authLimiter };
