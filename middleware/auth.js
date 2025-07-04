const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, process.env.JWT_SECRET || 'secret123', (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });

        req.user = user; // Contains student id: { id: student_id }
        next();
    });
}

module.exports = authenticateToken;
