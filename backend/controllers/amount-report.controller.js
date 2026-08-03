const db = require("../config/db");

function getRows(sql, params) {

    return new Promise((resolve, reject) => {

        db.all(sql, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });

    });

}

exports.getAmountReport = async (req, res) => {

    const { from, to, branch } = req.query;

    if (!from || !to) {

        return res.status(400).json({
            success: false,
            message: "From and To date required"
        });

    }

    let sql = `
        SELECT
            t.branch,
            t.item,
            SUM(t.qty) AS qty,
            t.unit,
            i.rate,
            SUM(t.qty * i.rate) AS amount
        FROM transfers t
        INNER JOIN items i
            ON i.item_name = t.item
        WHERE t.date BETWEEN ? AND ?
    `;

    const params = [from, to];

    if (branch && branch !== "All") {

        sql += ` AND t.branch = ?`;
        params.push(branch);

    }

    sql += `
        GROUP BY
            t.branch,
            t.item,
            t.unit,
            i.rate
        ORDER BY
            t.branch ASC,
            t.item ASC
    `;

    const productionSql = `
        SELECT
            p.item,
            SUM(p.qty) AS qty,
            p.unit,
            COALESCE(i.rate, 0) AS rate,
            SUM(p.qty * COALESCE(i.rate, 0)) AS amount
        FROM production p
        LEFT JOIN items i ON i.item_name = p.item
        WHERE p.date BETWEEN ? AND ?
        GROUP BY p.item, p.unit, i.rate
        ORDER BY p.item ASC
    `;

    const stockSql = `
        WITH opening_totals AS (
            SELECT item, SUM(opening_qty) AS opening_qty, MAX(unit) AS unit
            FROM opening_stock
            WHERE month = ?
            GROUP BY item
        ),
        production_totals AS (
            SELECT item, SUM(qty) AS production_qty, MAX(unit) AS unit
            FROM production
            WHERE date BETWEEN ? AND ?
            GROUP BY item
        ),
        transfer_totals AS (
            SELECT item, SUM(qty) AS transfer_qty, MAX(unit) AS unit
            FROM transfers
            WHERE date BETWEEN ? AND ?
            GROUP BY item
        ),
        wastage_totals AS (
            SELECT item, SUM(qty) AS wastage_qty, MAX(unit) AS unit
            FROM wastage
            WHERE date BETWEEN ? AND ?
            GROUP BY item
        ),
        stock_items AS (
            SELECT item FROM opening_totals
            UNION
            SELECT item FROM production_totals
            UNION
            SELECT item FROM transfer_totals
            UNION
            SELECT item FROM wastage_totals
        )
        SELECT
            si.item,
            COALESCE(ot.unit, pt.unit, tt.unit, wt.unit, i.unit, 'PCS') AS unit,
            COALESCE(i.rate, 0) AS rate,
            COALESCE(ot.opening_qty, 0) AS opening_qty,
            COALESCE(pt.production_qty, 0) AS production_qty,
            COALESCE(tt.transfer_qty, 0) AS transfer_qty,
            COALESCE(wt.wastage_qty, 0) AS wastage_qty,
            COALESCE(ot.opening_qty, 0) +
            COALESCE(pt.production_qty, 0) -
            COALESCE(tt.transfer_qty, 0) -
            COALESCE(wt.wastage_qty, 0) AS closing_qty
        FROM stock_items si
        LEFT JOIN opening_totals ot ON ot.item = si.item
        LEFT JOIN production_totals pt ON pt.item = si.item
        LEFT JOIN transfer_totals tt ON tt.item = si.item
        LEFT JOIN wastage_totals wt ON wt.item = si.item
        LEFT JOIN items i ON i.item_name = si.item
        ORDER BY si.item ASC
    `;

    try {

        const [rows, productionRows, stockRows] = await Promise.all([
            getRows(sql, params),
            getRows(productionSql, [from, to]),
            getRows(stockSql, [from.substring(0, 7), from, to, from, to, from, to])
        ]);

        res.json({
            success: true,
            rows,
            production_rows: productionRows,
            stock_rows: stockRows
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};
