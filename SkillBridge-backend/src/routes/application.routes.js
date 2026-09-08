const express = require("express");
const { protect, restrict, requireApproved } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { upload } = require("../middlewares/upload");
const v = require("../validators/applicationValidators");
const application = require("../controllers/application/application.controller");

const router = express.Router();

// Apply to an opportunity — student only.
router.post(
  "/opportunities/:id/apply",
  protect,
  restrict("student"),
  requireApproved,
  upload.single("resume"),
  v.apply,
  validate,
  application.apply
);

// Student-side application tracking.
router.get("/applications/me", protect, restrict("student"), application.myApplications);

// Company-side applicant management.
router.get(
  "/applications/company",
  protect,
  restrict("company"),
  requireApproved,
  application.listCompanyApplicants
);
router.get(
  "/applications/opportunity/:opportunityId",
  protect,
  restrict("company"),
  requireApproved,
  application.listApplicants
);
router.patch(
  "/applications/:id/status",
  protect,
  restrict("company"),
  requireApproved,
  v.updateStatus,
  validate,
  application.updateStatus
);

// Keep literal company routes before the dynamic student application ID route.
router.get("/applications/:id", protect, restrict("student"), application.getMyApplication);
router.delete("/applications/:id/withdraw", protect, restrict("student"), application.withdraw);

module.exports = router;
