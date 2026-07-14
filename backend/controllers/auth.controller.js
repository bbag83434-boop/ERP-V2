const db = require("../config/db");

function login(req, res) {
    res.send("Login GET route working");
}

function loginPost(req, res) {

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: "Username এবং Password দিন"
        });
    }

    db.get(
        "SELECT * FROM users WHERE username = ? AND password = ?",
        [username, password],
        (err, user) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Database Error"
                });
            }

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "ভুল Username অথবা Password"
                });
            }

            res.json({
                success: true,
                message: "Login Success",
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role
                }
            });

        }
    );

}

module.exports = {
    login,
    loginPost
};