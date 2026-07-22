const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware');
const { upload } = require('../services/fileService');
const {
  getMessages,
  getConversations,
  sendMessage,
  searchMessages,
  addReaction,
  markSeen,
  getNotificationsCtrl,
  markNotificationsRead,
} = require('../controllers/chatController');

// ── Conversation list ─────────────────────────────────────────────────────────
router.get('/conversations', verifyToken, getConversations);

// ── Send message (all types) ──────────────────────────────────────────────────
// Uses multer for optional file upload; non-file messages pass through fine.
router.post('/send', verifyToken, upload.single('file'), sendMessage);

// ── Mark messages as seen ─────────────────────────────────────────────────────
router.post('/mark-seen', verifyToken, markSeen);

// ── Notifications ─────────────────────────────────────────────────────────────
router.get('/notifications', verifyToken, getNotificationsCtrl);
router.post('/notifications/read', verifyToken, markNotificationsRead);

// ── Per-conversation routes (must come AFTER static paths like /send) ─────────
router.get('/:userId', verifyToken, getMessages);
router.get('/:userId/search', verifyToken, searchMessages);

// ── Message reactions ─────────────────────────────────────────────────────────
router.post('/message/:id/react', verifyToken, addReaction);

module.exports = router;
