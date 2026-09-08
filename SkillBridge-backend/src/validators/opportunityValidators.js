const { body } = require("express-validator");
const { OPPORTUNITY_TYPES } = require("../models/Opportunity");

const create = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("type")
    .notEmpty().withMessage("Type is required")
    .isIn(OPPORTUNITY_TYPES).withMessage(`Type must be one of: ${OPPORTUNITY_TYPES.join(", ")}`),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("deadline").isISO8601().withMessage("Deadline must be a valid date"),
  body("openings").optional().isInt({ min: 1 }).withMessage("Openings must be a positive integer"),
  body("location").optional().trim(),
  body("isRemote").optional().isBoolean(),
  body("salary").optional().trim(),
  body("tags").optional().isArray(),
  body("requirements").optional().isArray(),
  body("responsibilities").optional().isArray(),
];

const update = [
  body("title").optional().trim().notEmpty(),
  body("type").optional().isIn(OPPORTUNITY_TYPES),
  body("description").optional().trim().notEmpty(),
  body("deadline").optional().isISO8601(),
  body("openings").optional().isInt({ min: 1 }),
  body("status").optional().isIn(["open", "closed"]),
];

module.exports = { create, update };
