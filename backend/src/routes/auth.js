const express = require('express');
const router = express.Router();
const User = require('../models/User');
const verifyToken = require('../middleware/auth');

// POST /api/auth/sync — upsert user record on login
router.post('/sync', verifyToken, async (req, res) => {
  try {
    const { displayName } = req.body;
    const user = await User.findOneAndUpdate(
      { uid: req.user.uid },
      { uid: req.user.uid, email: req.user.email, ...(displayName && { displayName }) },
      { upsert: true, new: true }
    );
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
