const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',          // ← change to your MySQL username
  password: 'Apurva29',          // ← change to your MySQL password
  database: 'expense_tracker',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();
