const express = require("express");
const { protect, restrict, requireApproved } = require("../middlewares/auth");
const { upload } = require("../middlewares/upload");
const controller = require("../controllers/student/student.controller");

const router = express.Router();

router.use(protect, restrict("student"));

router.get("/profile", controller.getProfile);
router.put("/profile", controller.updateProfile);
router.post("/profile/avatar", requireApproved, upload.single("avatar"), controller.uploadAvatar);
router.delete("/profile/avatar", requireApproved, controller.deleteAvatar);
router.post(
  "/resume",
  requireApproved,
  upload.single("resume"),
  controller.uploadResume
);
router.delete("/resume", requireApproved, controller.deleteResume);

// Saved opportunities
router.get("/saved-opportunities", requireApproved, controller.listSavedOpportunities);
router.post("/saved-opportunities/:opportunityId", requireApproved, controller.saveOpportunity);
router.delete("/saved-opportunities/:opportunityId", requireApproved, controller.unsaveOpportunity);

module.exports = router;
