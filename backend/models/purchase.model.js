const db = require("../config/db");

function savePurchaseHeader(data, callback) {

    db.run(
        `INSERT INTO purchases
        (
            invoice_no,
            purchase_date,
            supplier_id,
            total_amount,
            total_gst,
            grand_total,
            remarks
        )
        VALUES (?,?,?,?,?,?,?)`,
        [
            data.invoice_no,
            data.purchase_date,
            data.supplier_id,
            data.total_amount,
            data.total_gst,
            data.grand_total,
            data.remarks
        ],
        function (err) {

            callback(err, this.lastID);

        }

    );

}

module.exports = {

    savePurchaseHeader

};