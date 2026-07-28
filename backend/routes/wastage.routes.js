const express = require("express");
const router = express.Router();

const db = require("../config/db");

/* ==============================
   GET ALL WASTAGE
============================== */

router.get("/", (req, res) => {

    const { item, date } = req.query;

    let sql = `
        SELECT *
        FROM wastage
        WHERE 1=1
    `;

    const params = [];

    if (item) {
        sql += " AND item = ?";
        params.push(item);
    }

    if (date) {
        sql += " AND date = ?";
        params.push(date);
    }

    sql += " ORDER BY date DESC, id DESC";

    db.all(sql, params, (err, rows) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                message: "Failed to load wastage history."
            });

        }

        res.json(rows);

    });

});
/* ==============================
   SAVE WASTAGE
============================== */

router.post("/", (req, res) => {

    const { date, wastageData } = req.body;

    if (!date || !Array.isArray(wastageData) || wastageData.length === 0) {

        return res.status(400).json({
            message: "Invalid wastage data."
        });

    }

    let completed = 0;

    for (const row of wastageData) {

        db.run(
            `INSERT INTO wastage
             (date, item, qty, unit, reason)
             VALUES (?, ?, ?, ?, ?)`,
            [
                date,
                row.item,
                row.qty,
                row.unit,
                row.reason
            ],
            (err) => {

                if (err) {
                    console.error(err);

                    return res.status(500).json({
                        message: "Failed to save wastage."
                    });
                }

                completed++;

                if (completed === wastageData.length) {

                    res.json({
                        success: true,
                        message: "Wastage saved successfully."
                    });

                }

            }
        );

    }

});
module.exports = router;