const express = require("express");
const router = express.Router();

const storeController = require("../controllers/store.controller");

// Store Items
router.get("/", storeController.getAllStoreItems);

// Branch List
router.get("/branches", storeController.getBranches);

// Add Store Item
router.post("/", storeController.addStoreItem);
//Add store
router.post("/stores", storeController.addStore);
module.exports = router;