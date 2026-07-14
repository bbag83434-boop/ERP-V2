const db = require("../config/db");

// =====================================
// Get All Suppliers
// =====================================
exports.addSupplier = (data, callback) => {

    db.get(
        "SELECT id FROM suppliers WHERE supplier_name = ?",
        [data.supplier_name],
        (err, row) => {

            if (err) return callback(err);

            if (row) {
                return callback(new Error("Supplier Already Exists"));
            }

            db.run(
                `
                INSERT INTO suppliers
                (
                    supplier_code,
                    supplier_name,
                    contact_person,
                    mobile,
                    email,
                    gstin,
                    address,
                    city,
                    state,
                    pincode,
                    status,
                    remarks
                )
                VALUES
                (?,?,?,?,?,?,?,?,?,?,?,?)
                `,
                [
                    data.supplier_code,
                    data.supplier_name,
                    data.contact_person,
                    data.mobile,
                    data.email,
                    data.gstin,
                    data.address,
                    data.city,
                    data.state,
                    data.pincode,
                    data.status,
                    data.remarks
                ],
                callback
            );

        }

    );

};