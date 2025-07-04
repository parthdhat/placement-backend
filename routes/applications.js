const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/auth');




// ✅ POST /api/applications/apply → Apply to a company
router.post('/apply', authenticateToken, (req, res) => {
  const { company_id } = req.body;
  const student_id = req.user.id;

  if (!company_id) return res.status(400).json({ message: 'Company ID is required' });

  // Step 1: Fetch student CGPA and company eligibility CGPA
  const studentQuery = 'SELECT cgpa FROM Students WHERE student_id = ?';
  const companyQuery = 'SELECT eligibility_cgpa FROM Companies WHERE company_id = ?';

  db.query(studentQuery, [student_id], (err, studentResults) => {
    if (err) return res.status(500).json({ error: err.message });
    if (studentResults.length === 0) return res.status(404).json({ message: 'Student not found' });

    db.query(companyQuery, [company_id], (err, companyResults) => {
      if (err) return res.status(500).json({ error: err.message });
      if (companyResults.length === 0) return res.status(404).json({ message: 'Company not found' });

      const studentCgpa = parseFloat(studentResults[0].cgpa);
      const eligibilityCgpa = parseFloat(companyResults[0].eligibility_cgpa);

      if (studentCgpa < eligibilityCgpa) {
        return res.status(403).json({ message: `Minimum CGPA required is ${eligibilityCgpa}` });
      }

      // Step 2: Check if already applied
      db.query(
        'SELECT * FROM Applications WHERE student_id = ? AND company_id = ?',
        [student_id, company_id],
        (err, results) => {
          if (err) return res.status(500).json({ error: err.message });
          if (results.length > 0) return res.status(400).json({ message: 'Already applied to this company' });

          // Step 3: Insert application
          db.query(
            'INSERT INTO Applications (student_id, company_id) VALUES (?, ?)',
            [student_id, company_id],
            (err) => {
              if (err) return res.status(500).json({ error: err.message });
              res.status(201).json({ message: 'Application submitted successfully' });
            }
          );
        }
      );
    });
  });
});



// ✅ GET /api/applications/company/:company_id → Get all applications for a company
router.get('/company/:company_id', (req, res) => {
    const companyId = req.params.company_id;

    const query = `
        SELECT a.application_id, s.student_id, s.name AS student_name, s.email, a.applied_at,a.status
        FROM Applications a
        JOIN Students s ON a.student_id = s.student_id
        WHERE a.company_id = ?;
    `;

    db.query(query, [companyId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// ✅ GET /api/applications/my → Get applications of the currently logged-in student
// GET student’s own applications
router.get('/my', authenticateToken, (req, res) => {
  const student_id = req.user.id;

  db.query(
    `SELECT a.application_id, a.company_id, c.name as company_name, c.salary_package, a.status, a.applied_at
     FROM Applications a
     JOIN Companies c ON a.company_id = c.company_id
     WHERE a.student_id = ?`,
    [student_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});


module.exports = router;
