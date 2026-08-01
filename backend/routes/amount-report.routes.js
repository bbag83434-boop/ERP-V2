const express = require("express");

const router = express.Router();

const amountReportController = require("../controllers/amount-report.controller");

router.get(
    "/",
    amountReportController.getAmountReport
);

module.exports = router;