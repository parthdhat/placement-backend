const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// ✅ Get student profile by ID

module.exports = router;

router.post('/register', (req, res) => {
    const { name, email, branch, cgpa, resume_link, password } = req.body;

    // Check if user already exists
    db.query('SELECT * FROM Students WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) return res.status(400).json({ message: 'Student already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(
            'INSERT INTO Students (name, email, branch, cgpa, resume_link, password) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, branch, cgpa, resume_link, hashedPassword],
            (err, result) => {
                if (err) return res.status(500).json({ error: err.message });
                res.status(201).json({ message: 'Student registered successfully' });
            }
        );
    });
});

// LOGIN STUDENT
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM Students WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Student not found' });

        const student = results[0];
        const isMatch = await bcrypt.compare(password, student.password);

        if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

        const token = jwt.sign({ id: student.student_id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '2h' });

        res.json({
            message: 'Login successful',
            token,
            student: {
                id: student.student_id,
                name: student.name,
                email: student.email,
                branch: student.branch,
                cgpa: student.cgpa,
                resume_link: student.resume_link
            }
        });
    });
});
// GET Profile of the logged-in student
router.get('/profile', authenticateToken, (req, res) => {
  const student_id = req.user.id;

  db.query(
    'SELECT student_id, name, email, branch, cgpa, resume_link FROM Students WHERE student_id = ?',
    [student_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(404).json({ message: 'Student not found' });
      res.json(results[0]);
    }
  );
});
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { resume_link, cgpa } = req.body;

  if (parseInt(id) !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }

  db.query(
    'UPDATE Students SET resume_link = ?, cgpa = ? WHERE student_id = ?',
    [resume_link, cgpa, id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Profile updated successfully' });
    }
  );
});




module.exports = router;
