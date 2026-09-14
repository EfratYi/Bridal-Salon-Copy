const express = require('express');
const router = express.Router();

// returns the authenticated user based on token in Authorization header or cookie
router.get('/me', async (req, res) => {
  try {
    // req.user is set by verifyJWT middleware (it contains the decoded token)
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });

    // token payload may be { user: {...} } or bare user fields
    const payload = req.user;
    const user = payload.user ? payload.user : payload;

    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error('GET /authentication/me error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
