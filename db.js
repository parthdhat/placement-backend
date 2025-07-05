require('dotenv').config(); // Make sure this is at the top
const mysql = require('mysql2');

// 👇 Add this line just before creating the connection
console.log("DB Host:", process.env.DB_HOST);

const connection = mysql.createConnection({
  host: process.env.DB_HOST,         // ✅ should NOT be 'localhost'
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306
});

connection.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to MySQL Database!');
});

module.exports = connection;
