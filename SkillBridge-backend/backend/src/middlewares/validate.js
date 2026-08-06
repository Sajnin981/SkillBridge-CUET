const { validationResult } = require("express-validator");
const AppError = require("../utils/AppError");

/**
 * Collects express-validator results and throws a 422 if any rule failed.
 * Must be placed after the validation chain in a route.
 */
const validate = (req, _res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array().map((e) => ({ field: e.path, message: e.msg }));
  return next(new AppError("Validation failed", 422, errors));
};

module.exports = validate;
