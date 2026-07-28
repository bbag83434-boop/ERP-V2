function requireLogin(req, res, next) {

    if (!req.session || !req.session.user) {

        return res.status(401).json({
            success: false,
            message: "Login required"
        });

    }

    next();

}

module.exports = {
    requireLogin
};