const express = require("express");
const { protect } = require("../middlewares/auth");
const serveFile = require("../controllers/file.controller");

const router = express.Router();
router.get("/:folder/:filename", protect, serveFile);

module.exports = router;