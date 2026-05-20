const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware');
const { getMessages, getConversations } = require('../controllers/chatController');

// GET /api/chat/conversations
router.get('/conversations', verifyToken, getConversations);

// GET /api/chat/:userId  (history with a specific user)
router.get('/:userId', verifyToken, getMessages);

module.exports = router;
