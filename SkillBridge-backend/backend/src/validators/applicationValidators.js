const { body } = require("express-validator");
const { APPLICATION_STATUS } = require("../models/Application");

const apply = [
  body("coverLetter").optional().isLength({ max: 3000 }).withMessage("Cover letter too long"),
  body("resumeUrl").optional().isString(),
];

const updateStatus = [
  body("status")
    .notEmpty().withMessage("Status is required")
    .isIn(APPLICATION_STATUS).withMessage(`Status must be one of: ${APPLICATION_STATUS.join(", ")}`),
  body("note").optional().isString(),
];

module.exports = { apply, updateStatus };
