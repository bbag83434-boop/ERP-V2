const purchaseNumber =
require("../services/purchase-number.service");
const purchaseModel = require("../models/purchase.model");

const db = require("../config/db");

async function getNextPurchaseNumber(req, res) {

    try {

        const number =
        await purchaseNumber.generatePurchaseNumber();

        res.json({
            purchase_no: number
        });

    } catch (err) {

        res.status(500).json(err);

    }

}
// ================================
// Save Purchase
// ================================
function savePurchase(req, res) {

    const data = req.body;

    purchaseModel.savePurchaseHeader(
        data,
        (err, purchaseId) => {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message: err.message
                });

            }

            res.json({
                success: true,
                purchase_id: purchaseId,
                message: "Purchase Header Saved Successfully"
            });

        }
    );

}
// =============================
// Get Store Items
// =============================
function getStoreItems(req, res) {

    db.all(
        `SELECT
            id,
            item_name,
            unit,
            purchase_rate,
            gst
         FROM store_items
         WHERE status='ACTIVE'
         ORDER BY item_name`,
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json(rows);

        }

    );

}

// =============================
// Get Suppliers
// =============================
function getSuppliers(req, res) {

    db.all(
        `SELECT
            id,
            supplier_name,
            gstin
            mobile,
            address
         FROM suppliers
         ORDER BY supplier_name ASC`,
        [],
        (err, rows) => {

            if (err) {
                console.log(err);
                return res.status(500).json(err);
            }

            res.json(rows);

        }

    );

}

module.exports = {
    getNextPurchaseNumber,
    getStoreItems,
    getSuppliers,
    savePurchase
};