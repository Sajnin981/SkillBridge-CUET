const express = require("express");
const controller = require("../controllers/opportunity/opportunity.controller");

const router = express.Router();

// Public browsing (no auth) — anyone can list/view opportunities.
router.get("/", controller.listOpportunities);
router.get("/:id", controller.getOpportunity);

module.exports = router;
