const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken } = require('../middleware');

// ── Helpers ──────────────────────────────────────────────────────────────────

// Compute profile completion % and auto-assign badges
function computeCompletion(user) {
  const checks = {
    hasBio: !!(user.bio && user.bio.trim().length > 10),
    hasOffered: user.skillsOffered?.length > 0,
    hasWanted: user.skillsWanted?.length > 0,
    hasProficiency: user.skillProficiency && [...(user.skillProficiency || new Map()).keys()].length > 0,
    hasGoal: !!(user.learningGoal && user.learningGoal !== ''),
    hasGithub: !!(user.socialLinks?.github),
    hasLinkedin: !!(user.socialLinks?.linkedin),
    hasPortfolio: !!(user.socialLinks?.portfolio || user.socialLinks?.behance),
  };

  const total = Object.keys(checks).length;
  const done = Object.values(checks).filter(Boolean).length;
  const percent = Math.round((done / total) * 100);

  // Auto-assign badges based on activity
  const badges = [...(user.badges || [])];
  if (checks.hasOffered && checks.hasProficiency && !badges.includes('Skill Expert')) {
    badges.push('Skill Expert');
  }
  if (checks.hasGithub && checks.hasPortfolio && !badges.includes('Portfolio Pro')) {
    badges.push('Portfolio Pro');
  }
  if (percent === 100 && !badges.includes('Complete Profile')) {
    badges.push('Complete Profile');
  }

  return { percent, checks, badges };
}

// ── Routes ────────────────────────────────────────────────────────────────────

// GET /api/users/profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { percent, checks } = computeCompletion(user);
    res.json({ success: true, user, profileCompletion: percent, completionChecks: checks });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/users/profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const {
      skillsOffered,
      skillsWanted,
      skillProficiency,
      bio,
      isBeginnerMode,
      learningGoal,
      socialLinks,
    } = req.body;

    const updateData = {
      skillsOffered,
      skillsWanted,
      bio,
      isBeginnerMode,
      learningGoal,
      socialLinks,
    };

    // Handle skillProficiency map
    if (skillProficiency && typeof skillProficiency === 'object') {
      updateData.skillProficiency = skillProficiency;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Auto-compute and save badges
    const { percent, checks, badges } = computeCompletion(user);
    if (badges.length !== (user.badges || []).length) {
      await User.findByIdAndUpdate(req.user.id, { badges });
      user.badges = badges;
    }

    res.json({ success: true, user, profileCompletion: percent, completionChecks: checks });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/users  — all users (public)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
