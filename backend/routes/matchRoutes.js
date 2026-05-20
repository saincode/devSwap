const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken } = require('../middleware');

// Get matched users for current user
router.get('/find', verifyToken, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find matches: users who have reciprocal skill interests
    // Criteria:
    // 1. They offer skills that current user wants to learn
    // 2. They want skills that current user can teach
    // 3. Not the current user
    const matches = await User.find({
      _id: { $ne: req.user.id },
      $or: [
        // Match if they offer skills we want AND they want skills we offer
        {
          $and: [
            { skillsOffered: { $in: currentUser.skillsWanted } },
            { skillsWanted: { $in: currentUser.skillsOffered } },
          ],
        },
        // Also match if they offer skills we want (even if not mutual on skills)
        { skillsOffered: { $in: currentUser.skillsWanted } },
      ],
    }).select('-password');

    res.json({ success: true, matches });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get match details
router.get('/:userId', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
