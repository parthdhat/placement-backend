const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateAdmin = require('../middleware/adminAuth');


// CREATE NEW COMPANY
router.post('/',authenticateAdmin,(req, res) => {
    const { name, description, eligibility_cgpa, salary_package } = req.body;

    if (!name || !description || !eligibility_cgpa || !salary_package) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    db.query(
        'INSERT INTO Companies (name, description, eligibility_cgpa, salary_package) VALUES (?, ?, ?, ?)',
        [name, description, eligibility_cgpa, salary_package],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Company added successfully', company_id: result.insertId });
        }
    );
});

// GET ALL COMPANIES
router.get('/', (req, res) => {
    db.query('SELECT * FROM Companies', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// GET SINGLE COMPANY BY ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM Companies WHERE company_id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Company not found' });
        res.json(results[0]);
    });
});

module.exports = router;
