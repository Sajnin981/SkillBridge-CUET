const express = require("express");
const { protect, restrict } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { body } = require("express-validator");
const controller = require("../controllers/admin/admin.controller");

const router = express.Router();

router.use(protect, restrict("admin"));

// Verification queue
router.get("/verifications", controller.listVerifications);
router.get("/verifications/:role/:id", controller.getVerification);
router.patch("/verifications/:role/:id/approve", controller.approve);
router.patch("/verifications/:role/:id/reject", controller.reject);

// Opportunity moderation
router.delete("/opportunities/:id", controller.deleteOpportunity);

// Dashboard statistics
router.get("/analytics", controller.analytics);

// User management
router.get("/users", controller.listUsers);
router.get("/users/:role/:id", controller.getUser);
router.patch(
  "/users/:role/:id/status",
  [
    body("status").isIn(["pending", "approved", "rejected"]).withMessage("Invalid status"),
    body("reason").optional().isString(),
  ],
  validate,
  controller.updateUserStatus
);
router.delete("/users/:role/:id", controller.deleteUser);

// Reports
router.get("/reports", controller.reports);

// AI logs
router.get("/ai-logs", controller.listAILogs);

module.exports = router;
