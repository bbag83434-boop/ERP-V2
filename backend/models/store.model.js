const db = require("../config/db");

// ==========================
// Get All Store Items
// ==========================
function getAllStoreItems(callback) {

    db.all(
        "SELECT * FROM store_items ORDER BY item_name ASC",
        [],
        callback
    );

}

// ==========================
// Add Store Item
// ==========================
function addStoreItem(data, callback) {

    db.run(
        `INSERT INTO store_items
        (
            item_code,
            item_name,
            category,
            brand,
            unit,
            hsn_code,
            gst,
            purchase_rate,
            average_rate,
            min_stock,
            max_stock,
            reorder_level,
            barcode,
            qr_code,
            status,
            remarks
        )
        VALUES
        (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
            data.item_code,
            data.item_name,
            data.category,
            data.brand,
            data.unit,
            data.hsn_code,
            data.gst,
            data.purchase_rate,
            data.average_rate,
            data.min_stock,
            data.max_stock,
            data.reorder_level,
            data.barcode,
            data.qr_code,
            data.status,
            data.remarks
        ],
        callback
    );

}
// ==========================
// Get All Branches
// ==========================
function getBranches(callback) {

    db.all(
        "SELECT * FROM stores ORDER BY store_name ASC",
        [],
        callback
    );

}
// ==========================
// Add Store
// ==========================
function addStore(data, callback) {

    db.run(
        `INSERT INTO stores
        (
            store_code,
            store_name,
            address,
            city,
            state,
            mobile,
            email,
            gst_number,
            manager_name,
            status
        )
        VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [
            data.store_code,
            data.store_name,
            data.address,
            data.city,
            data.state,
            data.mobile,
            data.email,
            data.gst_number,
            data.manager_name,
            data.status
        ],
        callback
    );

}

module.exports = {

    getAllStoreItems,
    getBranches,
    addStore,

    
    addStoreItem

};