require('dotenv').config();

const express = require('express');
const cors = require('cors');
const studentRoutes = require('./routes/students');
const companyRoutes = require('./routes/companies');
const applicationRoutes = require('./routes/applications');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Route paths
app.use('/api/students', studentRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  console.log("server");
    res.send('College Placement Management Backend');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
