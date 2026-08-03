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

// Dashboard live alerts for items at or below their configured minimum stock.
router.get("/alerts", (req, res) => {

    db.all(
        `
        WITH production_totals AS (
            SELECT item, SUM(qty) AS total
            FROM production
            WHERE strftime('%Y-%m', date) = strftime('%Y-%m', 'now')
            GROUP BY item
        ),
        transfer_totals AS (
            SELECT item, SUM(qty) AS total
            FROM transfers
            WHERE strftime('%Y-%m', date) = strftime('%Y-%m', 'now')
            GROUP BY item
        ),
        wastage_totals AS (
            SELECT item, SUM(qty) AS total
            FROM wastage
            WHERE strftime('%Y-%m', date) = strftime('%Y-%m', 'now')
            GROUP BY item
        ),
        stock_levels AS (
            SELECT
                ms.item,
                ms.minimum_qty,
                ms.unit,
                COALESCE(os.opening_qty, 0) +
                COALESCE(pt.total, 0) -
                COALESCE(tt.total, 0) -
                COALESCE(wt.total, 0) AS current_qty
            FROM minimum_stock ms
            LEFT JOIN opening_stock os
                ON os.item = ms.item
                AND os.month = strftime('%Y-%m', 'now')
            LEFT JOIN production_totals pt ON pt.item = ms.item
            LEFT JOIN transfer_totals tt ON tt.item = ms.item
            LEFT JOIN wastage_totals wt ON wt.item = ms.item
        )
        SELECT item, minimum_qty, unit, current_qty
        FROM stock_levels
        WHERE current_qty <= minimum_qty
        ORDER BY (minimum_qty - current_qty) DESC, item ASC
        `,
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json(rows.map((row) => ({
                ...row,
                minimum_qty: Number(row.minimum_qty) || 0,
                current_qty: Number(row.current_qty) || 0
            })));

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

router.put("/:id", (req, res) => {

    const id = Number(req.params.id);
    const minimumQty = Number(req.body.minimum_qty);
    const unit = req.body.unit || "PCS";

    if (!Number.isInteger(id) || id <= 0 || !Number.isFinite(minimumQty) || minimumQty < 0) {
        return res.status(400).json({ error: "Valid minimum quantity is required" });
    }

    db.run(
        `UPDATE minimum_stock
         SET minimum_qty = ?, unit = ?
         WHERE id = ?`,
        [minimumQty, unit, id],
        function (err) {

            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: "Minimum stock item not found" });
            }

            res.json({ success: true });

        }
    );

});

router.delete("/:id", (req, res) => {

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "Valid item id is required" });
    }

    db.run("DELETE FROM minimum_stock WHERE id = ?", [id], function (err) {

        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: "Minimum stock item not found" });
        }

        res.json({ success: true });

    });

});
module.exports = router;
