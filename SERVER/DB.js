const mysql = require('mysql2');

const host = process.env.DB_HOST || 'localhost';
const user = process.env.DB_USER || 'root';
const database = process.env.DB_NAME || 'mysql_project';
const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;
const password = process.env.DB_PASSWORD || '';

const pool = mysql.createPool({
  host,
  user,
  database,
  port,
  password,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}).promise();

module.exports = pool;
