// middleware.js
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Erişim reddedildi. Lütfen giriş yapın.' });
    }

    try {
        const verified = jwt.verify(token, 'secretKey');
        req.user = verified;
        next();
    } catch (error) {
        res.status(403).json({ message: 'Geçersiz Token' });
    }
};

module.exports = verifyToken;
