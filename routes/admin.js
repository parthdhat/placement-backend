const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateAdmin = require('../middleware/adminAuth');

const JWT_SECRET = 'your_jwt_secret_here'; // Use a strong secret or keep in .env

// --------------------------
// Route: Admin Login
// --------------------------
// ✅ Get All Applications (Admin only)
// ✅ Update Application Status (Admin only)
// ✅ Update Application Status (Admin only)
router.put('/applications/:application_id', authenticateAdmin, (req, res) => {
    const applicationId = req.params.application_id;
    const { status } = req.body;

    const allowedStatuses = ['Applied', 'Accepted', 'Rejected']; // Replaced 'Pending' with 'Applied'

    if (!status || !allowedStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Allowed values: Applied, Accepted, Rejected' });
    }

    db.query(
        'UPDATE Applications SET status = ? WHERE application_id = ?',
        [status, applicationId],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ message: 'Application not found' });

            res.json({ message: 'Application status updated successfully' });
        }
    );
});

// ✅ Admin Profile Route (Protected)
router.get('/profile', authenticateAdmin, (req, res) => {
    const adminId = req.admin.admin_id;

    db.query('SELECT admin_id, username, password FROM Admins WHERE admin_id = ?', [adminId], (err, results) => {
        if (err) {          
            return res.status(500).json({ error: err.message });  // 🔔 Print SQL errors here
        }
        if (results.length === 0) return res.status(404).json({ message: 'Admin not found' });

        res.json(results[0]);
    });
});


router.get('/applications', authenticateAdmin, (req, res) => {
    const query = `
        SELECT a.application_id, s.student_id, s.name AS student_name, s.email, 
               c.company_id, c.name AS company_name, c.salary_package, 
               a.status, a.applied_at
        FROM Applications a
        JOIN Students s ON a.student_id = s.student_id
        JOIN Companies c ON a.company_id = c.company_id
        ORDER BY a.applied_at DESC;
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

router.get('/dashboard', authenticateAdmin, (req, res) => {
    res.json({ message: `Welcome Admin ${req.admin.username}` });
});
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) return res.status(400).json({ message: 'Username and password are required' });

    db.query('SELECT * FROM Admins WHERE username = ?', [username], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Admin not found' });

        const admin = results[0];

        bcrypt.compare(password, admin.password, (err, isMatch) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

            const token = jwt.sign(
                { admin_id: admin.admin_id, username: admin.username, role: 'admin' },
                JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.json({ token });
        });
    });
});
router.get('/companies', authenticateAdmin, (req, res) => {
    db.query('SELECT * FROM Companies', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});
// POST /api/admin/companies
router.post('/companies', authenticateAdmin, (req, res) => {
  const { name, description, salary_package, eligibility_cgpa } = req.body;

  if (!name || !description || !salary_package || !eligibility_cgpa) {
    return res.status(400).json({ message: "All fields are required" });
  }

  db.query(
    'INSERT INTO Companies (name, description, salary_package, eligibility_cgpa) VALUES (?, ?, ?, ?)',
    [name, description, salary_package, eligibility_cgpa],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Company added successfully', company_id: result.insertId });
    }
  );
});



module.exports = router;
