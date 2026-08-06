/**
 * Centralized API response helpers.
 * Every controller returns the same envelope so the frontend service layer
 * can rely on a consistent shape: { success, message, data?, error? }.
 */

/**
 * Send a success response.
 * @param {import('express').Response} res
 * @param {object} options
 * @param {number} [options.statusCode=200]
 * @param {string} [options.message]
 * @param {*} [options.data]
 */
const success = (res, { statusCode = 200, message = "Success", data = {} } = {}) =>
  res.status(statusCode).json({ success: true, message, data });

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {object} options
 * @param {number} [options.statusCode=400]
 * @param {string} [options.message]
 * @param {*} [options.errors]
 */
const error = (res, { statusCode = 400, message = "Something went wrong", errors } = {}) =>
  res.status(statusCode).json({ success: false, message, ...(errors ? { errors } : {}) });

module.exports = { success, error };
