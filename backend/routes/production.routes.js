const express = require("express");

const router = express.Router();

const db = require("../config/db");
const ExcelJS = require("exceljs");
router.post("/save", (req, res) => {
console.log(req.body);
    const { date, productionData } = req.body;

    if (!date || !productionData || productionData.length === 0) {
        return res.status(400).json({
            success: false,
            message: "No Data"
        });
    }
const entryMonth = date.substring(0, 7); // "2026-07-10" থেকে "2026-07"

    db.get("SELECT month FROM locked_months WHERE month = ?", [entryMonth], (err, lockedRow) => {

        if (lockedRow) {
            return res.status(403).json({
                success: false,
                message: `${entryMonth} মাস Lock করা আছে, নতুন Entry করা যাবে না`
            });
        }

        // এখান থেকে আসল save logic শুরু হবে
        let completed = 0;
        productionData.forEach((row) => {

            db.run(
                `INSERT INTO production(date,item,qty,unit)
                 VALUES(?,?,?,?)`,
                [date, row.item, row.qty, row.unit],
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
router.get("/export-stock-excel/:month", async (req, res) => {

    const month = req.params.month;
    const workbook = new ExcelJS.Workbook();
const sheet = workbook.addWorksheet("Stock Report");

// Company Name
sheet.mergeCells("A1:F1");
sheet.getCell("A1").value = "CHEF BISU";
sheet.getCell("A1").font = {
    bold: true,
    size: 18
};
sheet.getCell("A1").alignment = {
    horizontal: "center"
};

// Report Title
sheet.mergeCells("A2:F2");
sheet.getCell("A2").value = "STOCK REPORT";
sheet.getCell("A2").font = {
    bold: true,
    size: 14
};
sheet.getCell("A2").alignment = {
    horizontal: "center"
};

// Month
sheet.mergeCells("A3:F3");
sheet.getCell("A3").value = "Month : " + month;
sheet.getCell("A3").alignment = {
    horizontal: "right"
};

sheet.addRow([]);

// Header
sheet.addRow([
    "Item",
    "Opening",
    "In (Production)",
    "Out (Transfer)",
    "Closing"
]);
const headerRow = sheet.getRow(5);

headerRow.eachCell((cell) => {

    cell.font = {
        bold: true,
        color: { argb: "FFFFFFFF" }
    };

    cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "1F4E78" }
    };

    cell.alignment = {
        horizontal: "center",
        vertical: "middle"
    };

    cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
    };

});
db.all(
    "SELECT item_name FROM items ORDER BY item_name ASC",
    [],
    (err, items) => {

        if (err) {
            return res.status(500).json(err);
        }

        let completed = 0;
        let totalOpening = 0;
        let grandTotalIn = 0;
        let grandTotalOut = 0;
        let totalClosing = 0;
        if (items.length === 0) {
            return res.json([]);
        }

        items.forEach((itemRow) => {

            const itemName = itemRow.item_name;
            db.get(
    "SELECT opening_qty FROM opening_stock WHERE month = ? AND item = ?",
    [month, itemName],
    (err, openingRow) => {

        const opening = openingRow
            ? openingRow.opening_qty
            : 0;
            db.get(
    `SELECT SUM(qty) AS total
     FROM production
     WHERE item = ?
     AND strftime('%Y-%m', date) = ?`,
    [itemName, month],
    (err, inRow) => {

        const totalIn =
            inRow && inRow.total
                ? inRow.total
                : 0;
                db.get(
    `SELECT SUM(qty) AS total
     FROM transfers
     WHERE item = ?
     AND strftime('%Y-%m', date) = ?`,
    [itemName, month],
    async(err, outRow) => {

        const totalOut =
            outRow && outRow.total
                ? outRow.total
                : 0;
                const closing =
    Number(opening) +
    Number(totalIn) -
    Number(totalOut);
    totalOpening += Number(opening);
    grandTotalIn += Number(totalIn);
    grandTotalOut += Number(totalOut);
    totalClosing += Number(closing);
sheet.addRow([
    itemName,
    opening,
    totalIn,
    totalOut,
    closing
]);
const dataRow = sheet.lastRow;

dataRow.eachCell((cell) => {

    cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
    };

    cell.alignment = {
        horizontal: "center",
        vertical: "middle"
    };

});
completed++;

if (completed === items.length) {
sheet.addRow([]);
const summaryTitle = sheet.addRow(["STOCK SUMMARY"]);

summaryTitle.font = {
    bold: true,
    size: 13,
    color: { argb: "FFFFFFFF" }
};

summaryTitle.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "1F4E78" }
};

summaryTitle.alignment = {
    horizontal: "center"
};

sheet.mergeCells(`A${summaryTitle.number}:B${summaryTitle.number}`);

const summaryRows = [
    ["Total Opening", totalOpening],
    ["Total Production In", grandTotalIn],
    ["Total Transfer Out", grandTotalOut],
    ["Total Closing", totalClosing]
];

summaryRows.forEach(data => {

    const row = sheet.addRow(data);

    row.eachCell(cell => {

        cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" }
        };

        cell.alignment = {
            vertical: "middle"
        };

    });
const closingRow = sheet.getRow(sheet.rowCount);

closingRow.eachCell(cell => {

    cell.font = {
        bold: true,
        color: { argb: "FFFFFFFF" }
    };

    cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "2F75B5" }
    };

});
    row.getCell(1).font = {
        bold: true
    };

    row.getCell(2).alignment = {
        horizontal: "right"
    };

});
    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
        "Content-Disposition",
        "attachment; filename=Stock_Report.xlsx"
    );
sheet.columns.forEach((column) => {

    let maxLength = 12;

    column.eachCell({ includeEmpty: true }, (cell) => {

        const length = cell.value
            ? cell.value.toString().length
            : 10;

        if (length > maxLength) {
            maxLength = length;
        }

    });

    column.width = maxLength + 4;

});
    await workbook.xlsx.write(res);
    res.end();

}
}

                            );

                        }

                    );

                }

            );

        });

    }

);
});
    // এখান থেকে আমরা উপরের Stock Logic ব্যবহার করব
    // শেষে Excel Generate করে Download করাব


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
    router.get("/export-report-excel", async (req, res) => {

    const { from, to } = req.query;

    if (!from || !to) {
        return res.status(400).json({
            message: "From and To date required"
        });
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Report");


// Company Name
sheet.mergeCells("A1:C1");
sheet.getCell("A1").value = "CHEF BISU";
sheet.getCell("A1").font = {
    bold: true,
    size: 18
};
sheet.getCell("A1").alignment = {
    horizontal: "center"
};

// Report Title
sheet.mergeCells("A2:C2");
sheet.getCell("A2").value = "PRODUCTION REPORT";
sheet.getCell("A2").font = {
    bold: true,
    size: 14
};
sheet.getCell("A2").alignment = {
    horizontal: "center"
};

// Date Range
sheet.mergeCells("A3:C3");
sheet.getCell("A3").value = `From : ${from}   To : ${to}`;
sheet.getCell("A3").alignment = {
    horizontal: "right"
};

sheet.addRow([]);
sheet.addRow([
    "Item",
    "Total Qty",
    "Unit"
]);

const headerRow = sheet.getRow(5);

headerRow.eachCell((cell) => {

    cell.font = {
        bold: true,
        color: { argb: "FFFFFFFF" }
    };

    cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "1F4E78" }
    };

    cell.alignment = {
        horizontal: "center",
        vertical: "middle"
    };

    cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
    };

});
db.all(
    `SELECT item, SUM(qty) AS total_qty, unit
     FROM production
     WHERE date BETWEEN ? AND ?
     GROUP BY item, unit
     ORDER BY item ASC`,
    [from, to],
    async (err, rows) => {

        if (err) {
            return res.status(500).json(err);
        }
           console.log(rows);
        rows.forEach(row => {

            sheet.addRow([
                row.item,
                row.total_qty,
                row.unit
            ]);

        });

    
    sheet.columns.forEach((column) => {

            let maxLength = 12;

            column.eachCell({ includeEmpty: true }, (cell) => {

                const length = cell.value
                    ? cell.value.toString().length
                    : 10;

                if (length > maxLength) {
                    maxLength = length;
                }

            });

            column.width = maxLength + 4;

        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=Production_Report.xlsx"
        );

        await workbook.xlsx.write(res);
        res.end();
    }
);
});
router.get("/export-outlet-report", async (req, res) => {

    const { from, to, branch } = req.query;

    console.log(from);
    console.log(to);
    console.log(branch);
db.all(
    `
    SELECT
        item,
        SUM(qty) AS total_qty,
        unit
    FROM transfer
    WHERE branch = ?
      AND date BETWEEN ? AND ?
    GROUP BY item, unit
    ORDER BY item ASC
    `,
    [branch, from, to],
    (err, rows) => {

        if (err) {
            return res.status(500).json(err);
        }

        console.log(rows);

        res.json(rows);
    }
);

return;
    res.json({
        from,
        to,
        branch
    });

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
router.post("/create-month", (req, res) => {

    const { fromMonth, toMonth } = req.body;

    if (!fromMonth || !toMonth) {
        return res.status(400).json({ message: "From এবং To মাস দিন" });
    }

    // ১. সব item list আনা
    db.all("SELECT item_name FROM items", [], (err, items) => {

        if (err) return res.status(500).json(err);

        if (items.length === 0) {
            return res.json({ message: "কোনো Item নেই" });
        }

        items.forEach((itemRow) => {

            const itemName = itemRow.item_name;

            // ২. fromMonth এর Opening আনা
            db.get(
                "SELECT opening_qty FROM opening_stock WHERE month = ? AND item = ?",
                [fromMonth, itemName],
                (err, openingRow) => {

                    const opening = openingRow ? openingRow.opening_qty : 0;

                    // ৩. fromMonth এর মোট Production (In)
                    db.get(
                        `SELECT SUM(qty) as total FROM production 
                         WHERE item = ? AND strftime('%Y-%m', date) = ?`,
                        [itemName, fromMonth],
                        (err, inRow) => {

                            const totalIn = inRow && inRow.total ? inRow.total : 0;

                            // ৪. fromMonth এর মোট Transfer (Out)
                            db.get(
                                `SELECT SUM(qty) as total FROM transfers 
                                 WHERE item = ? AND strftime('%Y-%m', date) = ?`,
                                [itemName, fromMonth],
                                (err, outRow) => {

                                    const totalOut = outRow && outRow.total ? outRow.total : 0;

                                    const closing = Number(opening) + Number(totalIn) - Number(totalOut);
                                    totalOpening += Number(opening);

                                    // ৫. এই closing কে toMonth এর opening হিসেবে বসানো
                                    db.run(
                                        `INSERT OR REPLACE INTO opening_stock (month, item, opening_qty, unit)
                                         VALUES (?, ?, ?, ?)`,
                                        [toMonth, itemName, closing, "PCS"],
                                        function (err) {

                                            completed++;

                                            if (completed === items.length) {
                                                res.json({
                                                    message: `${fromMonth} এর Closing, ${toMonth} এর Opening হিসেবে সেভ হয়েছে`
                                                });
                                            }

                                        }
                                    );

                                }
                            );

                        }
                    );

                }
            );

        });

    });

});
router.get("/locked-months", (req, res) => {

    db.all("SELECT month FROM locked_months", [], (err, rows) => {
        if (err) return res.status(500).json(err);
        res.json(rows.map(r => r.month));
    });

});

router.post("/lock-month", (req, res) => {

    const { month } = req.body;

    if (!month) return res.status(400).json({ message: "মাস দিন" });

    db.run(
        "INSERT OR IGNORE INTO locked_months (month) VALUES (?)",
        [month],
        function (err) {
            if (err) return res.status(500).json(err);
            res.json({ message: `${month} Lock করা হয়েছে` });
        }
    );

});

router.post("/unlock-month", (req, res) => {

    const { month } = req.body;

    if (!month) return res.status(400).json({ message: "মাস দিন" });

    db.run(
        "DELETE FROM locked_months WHERE month = ?",
        [month],
        function (err) {
            if (err) return res.status(500).json(err);
            res.json({ message: `${month} Unlock করা হয়েছে` });
        }
    );

});
router.get("/export-excel", async (req, res) => {

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Production");

    worksheet.columns = [
        { header: "ID", key: "id", width: 10 },
        { header: "Date", key: "date", width: 15 },
        { header: "Item", key: "item", width: 30 },
        { header: "Quantity", key: "qty", width: 15 },
        { header: "Unit", key: "unit", width: 10 }
    ];

    db.all(
        "SELECT * FROM production ORDER BY date DESC",
        [],
        async (err, rows) => {

            if (err) {
                return res.status(500).json(err);
            }

            rows.forEach(row => {
                worksheet.addRow(row);
            });
            const summary = {};

rows.forEach(row => {

    const key = `${row.item}_${row.unit}`;

    if (!summary[key]) {
        summary[key] = {
            item: row.item,
            unit: row.unit,
            total: 0
        };
    }

    summary[key].total += Number(row.qty);

});
worksheet.addRow([]);
worksheet.addRow(["Production Summary"]);
worksheet.addRow(["Item", "Total Qty", "Unit"]);

Object.values(summary).forEach(data => {
    worksheet.addRow([
        data.item,
        data.total,
        data.unit
    ]);
});
            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );

            res.setHeader(
                "Content-Disposition",
                "attachment; filename=Production_Report.xlsx"
            );

            await workbook.xlsx.write(res);
            res.end();
        }
    );

});
module.exports = router;