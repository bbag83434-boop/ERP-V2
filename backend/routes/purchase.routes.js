const express = require("express");

const router = express.Router();

const purchaseController =
require("../controllers/purchase.controller");

router.get(
    "/next-number",
    purchaseController.getNextPurchaseNumber
);
router.get(
    "/suppliers",
    purchaseController.getSuppliers
);
router.get(
    "/items",
    purchaseController.getStoreItems
);
router.post(
    "/save",
    purchaseController.savePurchase
);
module.exports = router;