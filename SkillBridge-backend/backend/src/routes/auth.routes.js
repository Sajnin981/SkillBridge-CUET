const express = require("express");
const { upload } = require("../middlewares/upload");
const validate = require("../middlewares/validate");
const { protect } = require("../middlewares/auth");
const { authLimiter } = require("../middlewares/rateLimiter");
const auth = require("../controllers/auth/auth.controller");
const authLogin = require("../controllers/auth/authLogin.controller");
const v = require("../validators/authValidators");

const router = express.Router();

// Public
router.post(
  "/student/register",
  authLimiter,
  upload.fields([
    { name: "idCard", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  v.studentRegister,
  validate,
  auth.registerStudent
);

router.post(
  "/company/register",
  authLimiter,
  upload.fields([
    { name: "tradeLicense", maxCount: 1 },
    { name: "logo", maxCount: 1 },
  ]),
  v.companyRegister,
  validate,
  auth.registerCompany
);

router.post("/login", authLimiter, v.login, validate, authLogin.login);

// Authenticated
router.get("/me", protect, authLogin.getMe);

module.exports = router;
