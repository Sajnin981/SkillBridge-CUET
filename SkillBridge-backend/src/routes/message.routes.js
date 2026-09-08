const express = require("express");
const { protect, restrict, requireApproved } = require("../middlewares/auth");
const controller = require("../controllers/message/message.controller");

const router = express.Router();

router.use(protect, restrict("student", "company"), requireApproved);

router.get("/conversations", controller.listConversations);
router.post("/conversations", controller.startConversation);
router.get("/conversations/:id/messages", controller.listMessages);
router.post("/conversations/:id/messages", controller.sendMessage);
router.patch("/conversations/:id/read", controller.markRead);

module.exports = router;
