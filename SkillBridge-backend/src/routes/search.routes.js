const express = require("express");
const { protect } = require("../middlewares/auth");
const { searchProfiles } = require("../controllers/search.controller");

const router = express.Router();
router.get("/", protect, searchProfiles);

module.exports = router;