const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'sql12.freesqldatabase.com',
    user: 'sql12788410',
    password: 'Nff27MVn78',
    database: 'sql12788410',
    port:3306
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL Database!');
});

module.exports = connection;
