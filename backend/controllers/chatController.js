const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');
const { buildFileUrl } = require('../services/fileService');
const { fetchLinkPreview, isValidUrl } = require('../services/linkPreviewService');
const notificationService = require('../services/notificationService');

// ─────────────────────────────────────────────────────────────────────────────
// Helper: build content preview for sidebar & notifications
// ─────────────────────────────────────────────────────────────────────────────
const buildPreview = (msg) => {
  if (msg.type === 'code') return `[Code: ${msg.codeSnippet?.language || 'snippet'}]`;
  if (msg.type === 'file') return `[File: ${msg.attachment?.originalName || 'attachment'}]`;
  if (msg.type === 'link') return msg.linkPreview?.url || msg.content || '[Link]';
  return msg.content || '';
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/chat/:userId — load message history
// ─────────────────────────────────────────────────────────────────────────────
exports.getMessages = async (req, res) => {
  try {
    const conversationId = Message.buildConversationId(req.user.id, req.params.userId);
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const messages = await Message.find({ conversationId, deletedAt: null })
      .sort({ createdAt: 1 })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .populate('replyTo', 'content type codeSnippet attachment sender');

    // Mark all messages sent to current user as read + seen
    await Message.updateMany(
      { conversationId, receiver: userId, read: false },
      {
        $set: { read: true, deliveryStatus: 'seen' },
        $addToSet: { readBy: { user: userId, readAt: new Date() } },
      }
    );

    res.json({ messages });
  } catch (err) {
    console.error('[getMessages]', err);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/chat/conversations — list all chat partners with last message
// ─────────────────────────────────────────────────────────────────────────────
exports.getConversations = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const lastMessages = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }],
          deletedAt: null,
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
        },
      },
    ]);

    const conversations = await Promise.all(
      lastMessages.map(async ({ _id, lastMessage }) => {
        const partnerId =
          lastMessage.sender.toString() === userId.toString()
            ? lastMessage.receiver
            : lastMessage.sender;

        const partner = await User.findById(partnerId).select('name avatar');
        const unread = await Message.countDocuments({
          conversationId: _id,
          receiver: userId,
          read: false,
        });

        return {
          conversationId: _id,
          partner,
          lastMessage: buildPreview(lastMessage),
          lastMessageTime: lastMessage.createdAt,
          lastMessageType: lastMessage.type,
          unread,
        };
      })
    );

    // Sort by most recent
    conversations.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

    res.json({ conversations });
  } catch (err) {
    console.error('[getConversations]', err);
    res.status(500).json({ message: 'Server error fetching conversations' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/chat/send — send a message via REST (supports all types + files)
// ─────────────────────────────────────────────────────────────────────────────
exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const {
      receiverId,
      content = '',
      type = 'text',
      codeLanguage,
      codeContent,
      replyTo,
    } = req.body;

    if (!receiverId) {
      return res.status(400).json({ message: 'receiverId is required' });
    }

    const conversationId = Message.buildConversationId(senderId, receiverId);

    const msgData = {
      conversationId,
      sender: senderId,
      receiver: receiverId,
      type,
      content,
      deliveryStatus: 'sent',
    };

    // ── Code snippet ──────────────────────────────────────────────────────────
    if (type === 'code') {
      if (!codeContent) {
        return res.status(400).json({ message: 'codeContent is required for code messages' });
      }
      msgData.codeSnippet = {
        language: codeLanguage || 'javascript',
        code: codeContent,
      };
    }

    // ── Link ──────────────────────────────────────────────────────────────────
    if (type === 'link') {
      const url = content.trim();
      if (!isValidUrl(url)) {
        return res.status(400).json({ message: 'Invalid URL' });
      }
      const preview = await fetchLinkPreview(url);
      msgData.linkPreview = preview;
    }

    // ── File attachment ───────────────────────────────────────────────────────
    if (type === 'file') {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      msgData.attachment = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: buildFileUrl(req.file.filename),
      };
    }

    // ── Reply ─────────────────────────────────────────────────────────────────
    if (replyTo) {
      const parentMsg = await Message.findById(replyTo);
      if (parentMsg && parentMsg.conversationId === conversationId) {
        msgData.replyTo = replyTo;
      }
    }

    const message = await Message.create(msgData);
    await message.populate('sender', 'name avatar');
    await message.populate('receiver', 'name avatar');
    if (message.replyTo) {
      await message.populate('replyTo', 'content type codeSnippet attachment sender');
    }

    // Create notification
    const preview = buildPreview(message);
    await notificationService.createNotification({
      recipient: receiverId,
      sender: senderId,
      type: 'message',
      conversationId,
      messageId: message._id,
      preview,
    });

    res.status(201).json({ message });
  } catch (err) {
    console.error('[sendMessage]', err);
    res.status(500).json({ message: 'Server error sending message' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/chat/:userId/search?q=query — search messages in a conversation
// ─────────────────────────────────────────────────────────────────────────────
exports.searchMessages = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'Query must be at least 2 characters' });
    }

    const conversationId = Message.buildConversationId(req.user.id, req.params.userId);
    const searchRegex = new RegExp(q.trim(), 'i');

    const messages = await Message.find({
      conversationId,
      deletedAt: null,
      $or: [
        { content: searchRegex },
        { 'codeSnippet.code': searchRegex },
        { 'attachment.originalName': searchRegex },
        { 'linkPreview.title': searchRegex },
        { 'linkPreview.url': searchRegex },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('sender', 'name')
      .populate('receiver', 'name');

    res.json({ messages, query: q.trim() });
  } catch (err) {
    console.error('[searchMessages]', err);
    res.status(500).json({ message: 'Server error searching messages' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/chat/message/:id/react — toggle emoji reaction
// ─────────────────────────────────────────────────────────────────────────────
exports.addReaction = async (req, res) => {
  try {
    const { emoji } = req.body;
    const userId = req.user.id;
    const messageId = req.params.id;

    if (!emoji) {
      return res.status(400).json({ message: 'emoji is required' });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const reactions = message.reactions || new Map();
    const users = reactions.get(emoji) || [];
    const idx = users.findIndex((id) => id.toString() === userId);

    if (idx === -1) {
      // Add reaction
      users.push(new mongoose.Types.ObjectId(userId));
    } else {
      // Remove reaction (toggle)
      users.splice(idx, 1);
    }

    if (users.length === 0) {
      reactions.delete(emoji);
    } else {
      reactions.set(emoji, users);
    }

    message.reactions = reactions;
    await message.save();

    // Serialize reactions as plain object for response
    const reactionsObj = {};
    message.reactions.forEach((userIds, em) => {
      reactionsObj[em] = userIds.map((id) => id.toString());
    });

    res.json({ messageId, reactions: reactionsObj });
  } catch (err) {
    console.error('[addReaction]', err);
    res.status(500).json({ message: 'Server error adding reaction' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/chat/mark-seen — mark messages in a conversation as seen
// ─────────────────────────────────────────────────────────────────────────────
exports.markSeen = async (req, res) => {
  try {
    const { conversationId } = req.body;
    const userId = new mongoose.Types.ObjectId(req.user.id);

    if (!conversationId) {
      return res.status(400).json({ message: 'conversationId is required' });
    }

    await Message.updateMany(
      {
        conversationId,
        receiver: userId,
        deliveryStatus: { $ne: 'seen' },
      },
      {
        $set: { read: true, deliveryStatus: 'seen' },
        $addToSet: { readBy: { user: userId, readAt: new Date() } },
      }
    );

    res.json({ success: true });
  } catch (err) {
    console.error('[markSeen]', err);
    res.status(500).json({ message: 'Server error marking seen' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/notifications — get notifications for current user
// ─────────────────────────────────────────────────────────────────────────────
exports.getNotificationsCtrl = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const skip = parseInt(req.query.skip) || 0;
    const [notifications, unreadCount] = await Promise.all([
      notificationService.getNotifications(req.user.id, limit, skip),
      notificationService.getUnreadCount(req.user.id),
    ]);
    res.json({ notifications, unreadCount });
  } catch (err) {
    console.error('[getNotificationsCtrl]', err);
    res.status(500).json({ message: 'Server error fetching notifications' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/notifications/read — mark notifications as read
// ─────────────────────────────────────────────────────────────────────────────
exports.markNotificationsRead = async (req, res) => {
  try {
    const { ids } = req.body; // optional array of specific IDs
    if (ids && ids.length > 0) {
      await notificationService.markRead(req.user.id, ids);
    } else {
      await notificationService.markAllRead(req.user.id);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('[markNotificationsRead]', err);
    res.status(500).json({ message: 'Server error marking notifications read' });
  }
};
