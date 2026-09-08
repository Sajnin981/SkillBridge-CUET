const { body } = require("express-validator");

const studentRegister = [
  body("fullName").trim().notEmpty().withMessage("Full name is required"),
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Valid email is required")
    .normalizeEmail(),
  body("studentId").trim().notEmpty().withMessage("Student ID is required"),
  body("department").trim().notEmpty().withMessage("Department is required"),
  body("batch").trim().notEmpty().withMessage("Batch is required"),
  body("phone")
    .trim()
    .customSanitizer((value) => value.replace(/[^\d+]/g, ""))
    .notEmpty().withMessage("Phone is required")
    .matches(/^\+?\d{10,15}$/).withMessage("Phone must be 10–15 digits"),
  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/).withMessage("Password must contain an uppercase letter")
    .matches(/[a-z]/).withMessage("Password must contain a lowercase letter")
    .matches(/[0-9]/).withMessage("Password must contain a number"),
];

const companyRegister = [
  body("companyName").trim().notEmpty().withMessage("Company name is required"),
  body("hrName").trim().notEmpty().withMessage("HR name is required"),
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Valid email is required")
    .normalizeEmail(),
  body("phone")
    .trim()
    .customSanitizer((value) => value.replace(/[^\d+]/g, ""))
    .notEmpty().withMessage("Phone is required")
    .matches(/^\+?\d{10,15}$/).withMessage("Phone must be 10–15 digits"),
  body("website").optional({ checkFalsy: true }).isURL().withMessage("Website must be a valid URL"),
  body("industry").trim().notEmpty().withMessage("Industry is required"),
  body("address").trim().notEmpty().withMessage("Address is required"),
  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/).withMessage("Password must contain an uppercase letter")
    .matches(/[a-z]/).withMessage("Password must contain a lowercase letter")
    .matches(/[0-9]/).withMessage("Password must contain a number"),
];

const login = [
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  body("role")
    .notEmpty().withMessage("Role is required")
    .isIn(["student", "company", "admin"]).withMessage("Role must be student, company, or admin"),
];

module.exports = { studentRegister, companyRegister, login };
