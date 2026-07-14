const storeModel = require("../models/store.model");

// =================================
// Get All Store Items
// =================================
exports.getAllStoreItems = (req, res) => {

    storeModel.getAllStoreItems((err, rows) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.json({
            success: true,
            data: rows
        });

    });

};

// =================================
// Add Store Item
// =================================
exports.addStoreItem = (req, res) => {

    const data = req.body;

    if (!data.item_name) {
        return res.status(400).json({
            success: false,
            message: "Item Name Required"
        });
    }

    storeModel.addStoreItem(data, (err) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.json({
            success: true,
            message: "Store Item Saved Successfully"
        });

    });

};
// =================================
// Get Active Store Items
// =================================
exports.getPurchaseItems = (req, res) => {

    storeModel.getPurchaseItems((err, rows) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.json(rows);

    });

};
// ==========================
// Get All Branches
// ==========================
exports.getBranches = (req, res) => {

    storeModel.getBranches((err, rows) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.json({
            success: true,
            data: rows
        });

    });

};
// ==========================
// Add Store
// ==========================
exports.addStore = (req, res) => {

    const data = req.body;

    if (!data.store_name) {
        return res.status(400).json({
            success: false,
            message: "Store Name Required"
        });
    }

    storeModel.addStore(data, (err) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.json({
            success: true,
            message: "Store Saved Successfully"
        });

    });

};