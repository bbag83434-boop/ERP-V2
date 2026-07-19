const express = require("express");
const router = express.Router();

const db = require("../config/db");

router.post("/save", (req, res) => {
console.log(req.body);
    const { date, productionData } = req.body;

    if (!date || !productionData || productionData.length === 0) {
        return res.status(400).json({
            success: false,
            message: "No Data"
        });
    }

    let completed = 0;

    productionData.forEach((row) => {

        db.run(
            `INSERT INTO production(date,item,qty,unit)
             VALUES(?,?,?,?)`,
            [
                date,
                row.item,
                row.qty,
                row.unit
            ],
            function (err) {

                if (err) {
                    console.log(err);
                    return res.status(500).json(err);
                }

                completed++;

                if (completed === productionData.length) {

                    res.json({
                        success: true,
                        message: "Production Saved Successfully"
                    });

                }

            }

        );

    });

});

router.get("/all", (req, res) => {

    db.all(
        `SELECT
    p.*,
    (
        SELECT status
        FROM edit_requests er
        WHERE er.production_id = p.id
        ORDER BY er.id DESC
        LIMIT 1
    ) AS request_status
FROM production p
ORDER BY p.id DESC`,
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json(rows);

        }
    );

});
router.delete("/delete/:id", (req, res) => {

    const id = req.params.id;

    db.run(
        "DELETE FROM production WHERE id = ?",
        [id],
        function (err) {

            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                success: true,
                message: "Production Deleted Successfully"
            });

        }
    );

});
router.put("/update/:id", (req, res) => {

    const id = req.params.id;
    const { item, qty, unit } = req.body;

    db.run(
        `UPDATE production
         SET item = ?, qty = ?, unit = ?
         WHERE id = ?`,
        [item, qty, unit, id],
        function (err) {

            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                success: true,
                message: "Production Updated Successfully"
            });

        }
    );

});
router.get("/date/:date", (req, res) => {

    const date = req.params.date;

    db.all(
        "SELECT * FROM production WHERE date = ? ORDER BY id DESC",
        [date],
        (err, rows) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json(rows);

        }
    );

});
router.get("/count", (req, res) => {

    db.get(
        "SELECT COUNT(*) AS total FROM production",
        [],
        (err, row) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json(row);

        }
    );

});
router.get("/today", (req, res) => {

    const today = new Date().toISOString().split("T")[0];

    db.get(

        "SELECT COUNT(*) AS total FROM production WHERE date = ?",

        [today],

        (err, row) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json(row);

        }

    );

});
// =============================
// Get All Items
// =============================
router.get("/items", (req, res) => {

    db.all(
        "SELECT * FROM items ORDER BY item_name ASC",
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json(rows);

        }
    );

});
router.post("/items", (req, res) => {

    const { item_name } = req.body;

    if (!item_name) {
        return res.status(400).json({
            message: "Item Name Required"
        });
    }

    db.run(
        "INSERT INTO items (item_name) VALUES (?)",
        [item_name],
        function (err) {

            if (err) {
                return res.status(500).json({
                    message: "Item Already Exists"
                });
            }

            res.json({
                message: "Item Saved Successfully"
            });

        }
    );

});
router.delete("/items/:id", (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM items WHERE id = ?", [id], function(err) {
        if (err) return res.status(500).json(err);
        res.json({ message: "Item Deleted Successfully" });
    });
});
router.get("/branches", (req, res) => {

    db.all(
        "SELECT * FROM branches ORDER BY branch_name ASC",
        [],
        (err, rows) => {
            if (err) return res.status(500).json(err);
            res.json(rows);
        }
    );

});

router.post("/branches", (req, res) => {

    const { branch_name } = req.body;

    if (!branch_name) {
        return res.status(400).json({ message: "Branch Name Required" });
    }

    db.run(
        "INSERT INTO branches (branch_name) VALUES (?)",
        [branch_name],
        function (err) {
            if (err) return res.status(500).json({ message: "Branch Already Exists" });
            res.json({ message: "Branch Saved Successfully" });
        }
    );

});

router.delete("/branches/:id", (req, res) => {

    const id = req.params.id;

    db.run(
        "DELETE FROM branches WHERE id = ?",
        [id],
        function (err) {
            if (err) return res.status(500).json(err);
            res.json({ message: "Branch Deleted Successfully" });
        }
    );

});
router.get("/stock/:month", (req, res) => {

    const month = req.params.month; // format: "2026-07"

    // ১. সব item list আনা
    db.all("SELECT item_name FROM items ORDER BY item_name ASC", [], (err, items) => {

        if (err) return res.status(500).json(err);

        const stockData = [];
        let completed = 0;

        if (items.length === 0) {
            return res.json([]);
        }

        items.forEach((itemRow) => {

            const itemName = itemRow.item_name;

            // ২. Opening balance আনা
            db.get(
                "SELECT opening_qty FROM opening_stock WHERE month = ? AND item = ?",
                [month, itemName],
                (err, openingRow) => {

                    const opening = openingRow ? openingRow.opening_qty : 0;

                    // ৩. এই মাসে মোট Production (In) আনা
                    db.get(
                        `SELECT SUM(qty) as total FROM production 
                         WHERE item = ? AND strftime('%Y-%m', date) = ?`,
                        [itemName, month],
                        (err, inRow) => {

                            const totalIn = inRow && inRow.total ? inRow.total : 0;

                            // ৪. এই মাসে মোট Transfer (Out) আনা
                            db.get(
                                `SELECT SUM(qty) as total FROM transfers 
                                 WHERE item = ? AND strftime('%Y-%m', date) = ?`,
                                [itemName, month],
                                (err, outRow) => {

                                    const totalOut = outRow && outRow.total ? outRow.total : 0;

                                    const closing = Number(opening) + Number(totalIn) - Number(totalOut);

                                    stockData.push({
                                        item: itemName,
                                        opening: opening,
                                        in: totalIn,
                                        out: totalOut,
                                        closing: closing
                                    });

                                    completed++;

                                    if (completed === items.length) {
                                        res.json(stockData);
                                    }

                                }
                            );

                        }
                    );

                }
            );

        });

    });

});
router.get("/chart", (req, res) => {

    db.all(`
        SELECT
            date,
            SUM(qty) AS total
        FROM production
        GROUP BY date
        ORDER BY date ASC
        LIMIT 30
    `, [], (err, rows) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(rows);

    });
    });
    router.get("/report", (req, res) => {

    const { from, to } = req.query;

    if (!from || !to) {
        return res.status(400).json({ message: "From and To date required" });
    }

    db.all(
        `SELECT item, SUM(qty) as total_qty, unit 
         FROM production 
         WHERE date BETWEEN ? AND ? 
         GROUP BY item, unit
         ORDER BY item ASC`,
        [from, to],
        (err, rows) => {
            if (err) return res.status(500).json(err);
            res.json(rows);
        }
    );
    });
router.get("/users", (req, res) => {

    db.all(
        "SELECT id, username, role FROM users ORDER BY username ASC",
        [],
        (err, rows) => {
            if (err) return res.status(500).json(err);
            res.json(rows);
        }
    );

});

router.post("/users", (req, res) => {

    const { username, password, role } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({ message: "সব তথ্য দিন" });
    }

    db.run(
        "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
        [username, password, role],
        function (err) {
            if (err) return res.status(500).json({ message: "এই Username আগে থেকে আছে" });
            res.json({ message: "User Created Successfully" });
        }
    );

});

router.delete("/users/:id", (req, res) => {

    const id = req.params.id;

    db.run(
        "DELETE FROM users WHERE id = ?",
        [id],
        function (err) {
            if (err) return res.status(500).json(err);
            res.json({ message: "User Deleted Successfully" });
        }
    );

});

router.post("/request-edit", (req, res) => {

    const { production_id, requested_by } = req.body;

    if (!production_id || !requested_by) {
        return res.status(400).json({
            message: "Missing Data"
        });
    }

    db.run(
        `INSERT INTO edit_requests
        (production_id, requested_by)
        VALUES (?, ?)`,
        [production_id, requested_by],
        function (err) {

            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                success: true,
                message: "Edit Request Sent Successfully"
            });

        }
    );

});
router.get("/edit-requests", (req, res) => {

    db.all(
        `SELECT
            id,
            production_id,
            requested_by,
            status,
            created_at
         FROM edit_requests
         ORDER BY id DESC`,
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json(rows);

        }
    );

});
router.put("/approve-request/:id", (req, res) => {

    const id = req.params.id;

    db.run(
        `UPDATE edit_requests
         SET status = 'Approved'
         WHERE id = ?`,
        [id],
        function (err) {

            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                success: true,
                message: "Request Approved Successfully"
            });

        }
    );

});
module.exports = router;