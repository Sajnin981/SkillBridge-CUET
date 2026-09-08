const express = require("express");
const controller = require("../controllers/company/company.controller");

const router = express.Router();

router.get("/", controller.listPublicCompanies);
router.get("/:id", controller.getPublicCompany);

module.exports = router;