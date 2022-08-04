const jwt = require('jsonwebtoken');

const authorization = (req, res, next) => {
    try {
        const token = req.cookies.accessToken;
        if (!token) {
            return res.status(403).send({ status: false, message: "Token is missing in cookies" });
        }
        const decodedToken = jwt.verify(token, "abc123");

        //set the decoded token userid in req.user attribute
        req.user = decodedToken.userId;
        next();
    } catch {
        return res.status(500).send({ status: false, message: error.message });
    }
};

module.exports = { authorization }