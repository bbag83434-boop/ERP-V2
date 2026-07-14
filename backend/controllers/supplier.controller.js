const supplierModel = require("../models/supplier.model");
const numberSeries = require("../services/number-series.service");

// ======================================
// Get All Suppliers
// ======================================
exports.getAllSuppliers = (req, res) => {

    supplierModel.getAllSuppliers((err, rows) => {

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

// ======================================
// Add Supplier
// ======================================
exports.addSupplier = async (req, res) => {

    try {

        const data = req.body;

        if (!data.supplier_name) {
            return res.status(400).json({
                success: false,
                message: "Supplier Name Required"
            });
        }

        data.supplier_code =
            await numberSeries.generateNumber("SUPPLIER");

        supplierModel.addSupplier(data, (err) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.json({
                success: true,
                message: "Supplier Saved Successfully"
            });

        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};