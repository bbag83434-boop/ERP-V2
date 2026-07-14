const express = require("express");
const router = express.Router();
const db = require("../config/db");



router.post("/save", (req, res) => {

    const { date, branch, transferData } = req.body;

    if (!date || !branch || !transferData || transferData.length === 0) {
        return res.status(400).json({
            success: false,
            message: "No Data"
        });
    }

    let completed = 0;

    transferData.forEach((row) => {

        db.run(
            `INSERT INTO transfers (date, branch, item, qty, unit)
             VALUES (?, ?, ?, ?, ?)`,
            [date, branch, row.item, row.qty, row.unit],
            function (err) {

                if (err) {
                    console.log(err);
                    return res.status(500).json(err);
                }

                completed++;

                if (completed === transferData.length) {
                    res.json({
                        success: true,
                        message: "Transfer Saved Successfully"
                    });
                }

            }
        );

    });

});
router.get("/all", (req, res) => {

    db.all(
        `SELECT * FROM transfers ORDER BY id DESC`,
        [],
        (err, rows) => {
            if (err) return res.status(500).json(err);
            res.json(rows);
        }
    );

});

router.delete("/delete/:id", (req, res) => {

    const id = req.params.id;

    db.run(
        "DELETE FROM transfers WHERE id = ?",
        [id],
        function (err) {
            if (err) return res.status(500).json(err);
            res.json({ success: true, message: "Transfer Deleted Successfully" });
        }
    );

});

router.put("/update/:id", (req, res) => {

    const id = req.params.id;
    const { branch, item, qty, unit } = req.body;

    db.run(
        `UPDATE transfers
         SET branch = ?, item = ?, qty = ?, unit = ?
         WHERE id = ?`,
        [branch, item, qty, unit, id],
        function (err) {
            if (err) return res.status(500).json(err);
            res.json({ success: true, message: "Transfer Updated Successfully" });
        }
    );

});
router.get("/report", (req, res) => {

    const { from, to, branch } = req.query;

    if (!from || !to) {
        return res.status(400).json({ message: "From and To date required" });
    }

    let query = `SELECT branch, item, SUM(qty) as total_qty, unit 
                 FROM transfers 
                 WHERE date BETWEEN ? AND ?`;
    let params = [from, to];

    if (branch && branch !== "All") {
        query += " AND branch = ?";
        params.push(branch);
    }

    query += " GROUP BY branch, item, unit ORDER BY branch ASC, item ASC";

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json(err);
        res.json(rows);
    });

});
module.exports = router;