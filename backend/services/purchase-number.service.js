const db = require("../config/db");

function generatePurchaseNumber() {

    return new Promise((resolve, reject) => {

        db.get(
            "SELECT COUNT(*) AS total FROM purchases",
            [],
            (err, row) => {

                if (err) {
                    return reject(err);
                }

                const next = row.total + 1;

                const purchaseNo =
                    "PUR-" +
                    String(next).padStart(6, "0");

                resolve(purchaseNo);

            }
        );

    });

}

module.exports = {
    generatePurchaseNumber
};