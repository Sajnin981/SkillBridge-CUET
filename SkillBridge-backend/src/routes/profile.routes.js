const express = require("express");
const { protect, restrict, requireApproved } = require("../middlewares/auth");
const controller = require("../controllers/profile/profile.controller");

const router = express.Router();

router.use(protect, restrict("student", "company", "admin"));
router.get("/students/:id", requireApproved, controller.getStudentProfile);
router.get("/companies/:id", requireApproved, controller.getCompanyProfile);

module.exports = router;
