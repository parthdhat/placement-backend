require('dotenv').config(); // Load .env variables

const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT, // Make sure this is set to the public port like 10851
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Connected to MySQL Database!');
  }
});

module.exports = connection;
