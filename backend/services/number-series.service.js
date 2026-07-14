const db = require("../config/db");

// ==========================================
// Generate Auto Number
// ==========================================
function generateNumber(seriesName) {

    return new Promise((resolve, reject) => {

        db.get(
            "SELECT * FROM number_series WHERE series_name = ?",
            [seriesName],
            (err, row) => {

                if (err) return reject(err);

                if (!row) {
                    return reject(new Error("Series Not Found"));
                }

                const nextNumber = row.last_number + 1;

                const code =
                    row.prefix +
                    String(nextNumber).padStart(row.digit_length, "0");

                db.run(
                    "UPDATE number_series SET last_number = ? WHERE series_name = ?",
                    [nextNumber, seriesName],
                    (err) => {

                        if (err) return reject(err);

                        resolve(code);

                    }
                );

            }
        );

    });

}

module.exports = {

    generateNumber

};