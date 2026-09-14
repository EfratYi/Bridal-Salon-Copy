const pool = require('../DB.js');

const bcrypt = require('bcrypt');
const hashPassword = (password) => {
  const saltRounds = 10;
  return bcrypt.hashSync(password, saltRounds);
};
;

async function createUser(userId, name, email, phone1, phone2, hashedPassword) {
  try {
    const sqlUser = `INSERT INTO users (userId, name, email, phone1, phone2, roleId) VALUES ( ?,?,?,?,?, ?)`;
    const [userResult] = await pool.query(sqlUser, [userId, name, email, phone1, phone2,2]);
    const insertId = userResult.insertId;
    const sqlPassword = `INSERT INTO passwords (userId, password) VALUES ( ?,?)`;
    const result = await pool.query(sqlPassword, [insertId, hashedPassword]);
    return result[0];
  }
  catch (err) {
    throw err;
  }
}

async function getUsers() {
  try {
    const sql = 'SELECT u.id, userId, name, email, phone1, phone2, type role FROM users u, roles r WHERE u.roleId=r.id';
    const result = await pool.query(sql);
    return result[0];
  }
  catch (err) {
    throw err;
  }
}

async function loginModel(email) {
  try {
    const sql = 'SELECT u.id, email, password FROM users u JOIN passwords ON u.id = passwords.userId WHERE u.email = ?';
    const [result] = await pool.query(sql, [email]);
    return result.length > 0 ? result[0] : null;
  } catch (err) {
    throw err;
  }
}

async function getUserByEmail(email) {
  try {
    const sql = 'SELECT * FROM users where email=?';
    const [result] = await pool.query(sql, [email]);
    return result;
  }
  catch (err) {
    throw err;
  }
} 

async function getUserById(id) {
  try {
    const sql = 'SELECT u.id, userId, name, email, phone1, phone2, type role FROM users u JOIN roles r ON u.roleId=r.id WHERE u.id=?';
    const [result] = await pool.query(sql, [id]);
    return result.length > 0 ? result[0] : null;
  }
  catch (err) {
    throw err;
  }
}

module.exports = { createUser, getUsers, getUserById, getUserByEmail, loginModel }
