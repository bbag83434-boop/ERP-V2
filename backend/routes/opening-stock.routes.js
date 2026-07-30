const express = require("express");
const router = express.Router();

const db = require("../config/db");

// ==========================
// Get Opening Stock
// ==========================

router.get("/:month", (req, res) => {

    const month = req.params.month;

    db.all(
        `SELECT item, opening_qty, unit
         FROM opening_stock
         WHERE month = ?`,
        [month],
        (err, rows) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json(rows);

        }
    );

});
// ==========================
// ==========================
// Save Opening Stock
// ==========================

router.post("/save", (req, res) => {

    const { month, items } = req.body;

    if (!month || !items || items.length === 0) {
        return res.status(400).json({
            success: false,
            message: "No Data"
        });
    }

    let completed = 0;

    items.forEach(row => {

        db.run(
            `INSERT OR REPLACE INTO opening_stock
            (month, item, opening_qty, unit)
            VALUES (?, ?, ?, ?)`,
            [
                month,
                row.item,
                row.qty,
                row.unit
            ],
            function(err){

                if(err){
                    return res.status(500).json(err);
                }

                completed++;

                if(completed === items.length){

                    res.json({
                        success:true,
                        message:"Opening Stock Saved Successfully"
                    });

                }

            }

        );

    });

});

module.exports = router;