const express = require("express");
const router = express.Router();

const supplierController = require("../controllers/supplier.controller");

// ==============================
// Get All Suppliers
// ==============================
router.get(
    "/",
    supplierController.getAllSuppliers
);

// ==============================
// Add Supplier
// ==============================
router.post(
    "/",
    supplierController.addSupplier
);

module.exports = router;