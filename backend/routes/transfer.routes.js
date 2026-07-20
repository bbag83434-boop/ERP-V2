const express = require("express");
const router = express.Router();
const db = require("../config/db");
const ExcelJS = require("exceljs");


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
    const workbook = new ExcelJS.Workbook();

const sheet = workbook.addWorksheet("Outlet Report");
sheet.addRow(["CHEF BISU"]);
sheet.addRow(["OUTLET TRANSFER REPORT"]);
sheet.mergeCells("A1:C1");
sheet.mergeCells("A2:C2");

sheet.getCell("A1").font = {
    bold: true,
    size: 18
};

sheet.getCell("A1").alignment = {
    horizontal: "center"
};

sheet.getCell("A2").font = {
    bold: true,
    size: 14
};

sheet.getCell("A2").alignment = {
    horizontal: "center"
};
sheet.addRow([]);
sheet.addRow(["From", from]);
sheet.addRow(["To", to]);
sheet.addRow(["Outlet", branch]);
sheet.addRow([]);
sheet.addRow([
    "Item",
    "Total Qty",
    "Unit"
]);
const headerRow = sheet.getRow(8);

headerRow.font = {
    bold: true,
    color: { argb: "FFFFFFFF" }
};

headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "1F4E78" }
};

headerRow.alignment = {
    horizontal: "center",
    vertical: "middle"
};
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

    db.all(query, params, async(err, rows) => {
        if (err) return res.status(500).json(err);
        console.log(rows);
        rows.forEach((row) => {
    sheet.addRow([
        row.item,
        row.total_qty,
        row.unit
    ]);
});
sheet.eachRow((row) => {

    row.eachCell((cell) => {

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

});

sheet.autoFilter = {
    from: "A8",
    to: "C8"
};

sheet.views = [
    {
        state: "frozen",
        ySplit: 8
    }
];
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
    "attachment; filename=Outlet_Transfer_Report.xlsx"
);

await workbook.xlsx.write(res);
res.end();
    });

});
router.get("/export-excel", async (req, res) => {

    db.all(
        "SELECT * FROM transfers ORDER BY date ASC, id ASC",
        async (err, rows) => {

            if (err) {
                return res.status(500).json(err);
            }

            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet("Transfer");

            // Title
            // Company Name
sheet.mergeCells("A1:F1");
sheet.getCell("A1").value = "CHEF BISU ";
sheet.getCell("A1").font = {
    bold: true,
    size: 18
};
sheet.getCell("A1").alignment = {
    horizontal: "center"
};

// Report Title
sheet.mergeCells("A2:F2");
sheet.getCell("A2").value = "TRANSFER REPORT";
sheet.getCell("A2").font = {
    bold: true,
    size: 14
};
sheet.getCell("A2").alignment = {
    horizontal: "center"
};

// Export Date
sheet.mergeCells("A3:F3");
sheet.getCell("A3").value =
    "Export Date : " +
    new Date().toLocaleString();

sheet.getCell("A3").alignment = {
    horizontal: "right"
};

sheet.addRow([]);

            // Header
            sheet.addRow([
                "ID",
                "Date",
                "Branch",
                "Item",
                "Quantity",
                "Unit"
            ]);
            const headerRow = sheet.getRow(5);

headerRow.font = {
    bold: true,
    color: { argb: "FFFFFFFF" }
};

headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1F4E78" }
};

headerRow.alignment = {
    horizontal: "center",
    vertical: "middle"
};

headerRow.eachCell((cell) => {

    cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
    };

});

            // Data
            rows.forEach(row => {

                sheet.addRow([
                    row.id,
                    row.date,
                    row.branch,
                    row.item,
                    row.qty,
                    row.unit
                ]);

            });
// Style Data Rows
const totalRows = sheet.rowCount;

for (let i = 6; i <= totalRows; i++) {

    const row = sheet.getRow(i);

    row.eachCell((cell) => {

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

}
            // Item Wise Summary
            const summary = {};

            rows.forEach(row => {

                const key = row.item + "_" + row.unit;

                if (!summary[key]) {

                    summary[key] = {
                        item: row.item,
                        qty: 0,
                        unit: row.unit
                    };

                }

                summary[key].qty += Number(row.qty);

            });

            sheet.addRow([]);
            sheet.addRow(["Transfer Summary"]);
            sheet.addRow([
                "Item",
                "Total Qty",
                "Unit"
            ]);
         const summaryHeaderRow = sheet.getRow(sheet.lastRow.number);

summaryHeaderRow.font = {
    bold: true,
    color: { argb: "FFFFFFFF" }
};

summaryHeaderRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1F4E78" }
};

summaryHeaderRow.alignment = {
    horizontal: "center"
};

summaryHeaderRow.eachCell((cell) => {

    cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
    };

});
            Object.values(summary).forEach(item => {

                sheet.addRow([
                    item.item,
                    item.qty,
                    item.unit
                ]);

            });

            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );

            res.setHeader(
                "Content-Disposition",
                "attachment; filename=Transfer_Report.xlsx"
            );
// Auto Column Width
sheet.columns.forEach((column) => {

    let maxLength = 10;

    column.eachCell({ includeEmpty: true }, (cell) => {

        const length = cell.value
            ? cell.value.toString().length
            : 0;

        if (length > maxLength) {
            maxLength = length;
        }

    });

    column.width = maxLength + 3;

});
            await workbook.xlsx.write(res);
            res.end();

        }

    );

});
module.exports = router;