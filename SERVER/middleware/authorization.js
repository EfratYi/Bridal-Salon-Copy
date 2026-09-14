const jwt = require('jsonwebtoken');
const usersModel = require('../model/usersModel');
require('dotenv').config();

const verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    let token = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    const secret = process.env.JWT_SECRET || process.env.ACCESS_TOKEN_SECRET || 'dev_secret';
    const decoded = jwt.verify(token, secret);
    // decoded should contain user info (id, email, role if included)
    req.user = decoded;
    return next();
  } catch (err) {
    console.error('verifyJWT error:', err);
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

const authAdmin = async (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  try {
    const user = await usersModel.getUserById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin' || user.role === 'Admin') return next();
    return res.status(403).json({ success: false, message: 'Forbidden' });
  } catch (err) {
    console.error('authAdmin error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const authEmployee = async (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  try {
    const user = await usersModel.getUserById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin' || user.role === 'employee' || user.role === 'Employee') return next();
    return res.status(403).json({ success: false, message: 'Forbidden' });
  } catch (err) {
    console.error('authEmployee error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { verifyJWT, authAdmin, authEmployee };
