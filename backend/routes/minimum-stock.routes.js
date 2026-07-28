const express = require("express");
const router = express.Router();
const db = require("../config/db");
router.get("/", (req, res) => {

    db.all(
        `
        SELECT *
        FROM minimum_stock
        ORDER BY item ASC
        `,
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json(rows);

        }
    );

});
router.post("/", (req, res) => {

    const { item, minimum_qty, unit } = req.body;

    db.run(
        `
        INSERT INTO minimum_stock (item, minimum_qty, unit)
        VALUES (?, ?, ?)
        `,
        [item, minimum_qty, unit],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                success: true,
                id: this.lastID
            });

        }
    );

});
module.exports = router;