const db = require("../config/db");

exports.getAmountReport = (req, res) => {

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

    db.all(sql, params, (err, rows) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: err.message
            });

        }

        res.json({
            success: true,
            rows
        });

    });

};