const express = require("express");
const faq = require("../controllers/faq/faq.controller");

const router = express.Router();

router.get("/", faq.listFAQs);

module.exports = router;