const express = require("express");
const cors = require('cors');
const router = express.Router();
const jwt = require('jsonwebtoken');
const controller = require('../controllers/usersController');
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

router.post('/', async (req, res) => {
  try {
    const user = await controller.loginController(req.body.email, req.body.password);
    if (user) {
      const userData = await controller.getUserById(user.id);
      const secret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || 'dev_secret';
      const accessToken = jwt.sign(
        { user: userData },
        secret,
        { expiresIn: '15m' }
      );

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 15 * 60 * 1000,
        sameSite: 'lax'
      };

      res.cookie('accessToken', accessToken, cookieOptions);
      // return token in body as well for dev convenience
      res.status(200).json({ success: true, data: { user: userData, token: accessToken } });
      return;
    }
    else {
      res.status(401).json({ success: false, message: 'User not found or invalid credentials' });
    }
  }
  catch (err) {
    console.error('POST /logIn error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

module.exports = router;
