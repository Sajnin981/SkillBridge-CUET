const express = require("express");
const { protect, restrict, requireApproved } = require("../middlewares/auth");
const controller = require("../controllers/ai/ai.controller");

const router = express.Router();

// Resume analysis — students only
router.post(
  "/resume-analysis",
  protect,
  restrict("student"),
  requireApproved,
  controller.resumeAnalysis
);

// Opportunity recommendations — students only
router.get(
  "/recommendations",
  protect,
  restrict("student"),
  requireApproved,
  controller.recommendations
);

// Candidate matching — companies only
router.post(
  "/candidate-matching",
  protect,
  restrict("company"),
  requireApproved,
  controller.candidateMatching
);

module.exports = router;
