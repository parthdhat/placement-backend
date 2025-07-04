const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_jwt_secret_here'; // Same secret used in admin.js

function authenticateAdmin(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        if (user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });

        req.admin = user; // Attach admin data to request
        next();
    });
}

module.exports = authenticateAdmin;
