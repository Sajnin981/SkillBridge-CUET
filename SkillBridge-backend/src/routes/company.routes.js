const express = require("express");
const { protect, restrict, requireApproved } = require("../middlewares/auth");
const { upload } = require("../middlewares/upload");
const validate = require("../middlewares/validate");
const v = require("../validators/opportunityValidators");
const controller = require("../controllers/company/company.controller");

const router = express.Router();

router.use(protect, restrict("company"));

router.get("/profile", controller.getProfile);
router.put("/profile", controller.updateProfile);
router.post("/profile/logo", requireApproved, upload.single("logo"), controller.uploadLogo);
router.delete("/profile/logo", requireApproved, controller.deleteLogo);

router.post(
  "/opportunities",
  requireApproved,
  v.create,
  validate,
  controller.createOpportunity
);
router.get("/opportunities", controller.listMyOpportunities);
router.get("/opportunities/:id/applicants-count", requireApproved, controller.getOpportunityApplicantCount);
router.put("/opportunities/:id", v.update, validate, controller.updateOpportunity);
router.delete("/opportunities/:id", requireApproved, controller.deleteOpportunity);

// Company analytics
router.get("/analytics", requireApproved, controller.analytics);

module.exports = router;
