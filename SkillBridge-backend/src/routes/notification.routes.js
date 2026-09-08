const express = require("express");
const { protect } = require("../middlewares/auth");
const controller = require("../controllers/notification/notification.controller");

const router = express.Router();

// Any authenticated role can access its own notifications.
router.use(protect);

router.get("/", controller.listNotifications);
router.patch("/read-all", controller.markAllRead);
router.patch("/:id/read", controller.markRead);

module.exports = router;
