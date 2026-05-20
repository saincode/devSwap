const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');

// GET /api/chat/:userId  — load message history between current user and :userId
exports.getMessages = async (req, res) => {
  try {
    const conversationId = Message.buildConversationId(
      req.user.id,
      req.params.userId
    );

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .populate('sender', 'name')
      .populate('receiver', 'name');

    // Mark messages as read
    await Message.updateMany(
      { conversationId, receiver: req.user.id, read: false },
      { read: true }
    );

    res.json({ messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
};

// GET /api/chat/conversations  — list all chat partners with last message
exports.getConversations = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Find latest message per conversation that involves current user
    const lastMessages = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }],
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

    // Enrich with partner user info
    const conversations = await Promise.all(
      lastMessages.map(async ({ _id, lastMessage }) => {
        const partnerId =
          lastMessage.sender.toString() === userId.toString()
            ? lastMessage.receiver
            : lastMessage.sender;

        const partner = await User.findById(partnerId).select('name');
        const unread = await Message.countDocuments({
          conversationId: _id,
          receiver: userId,
          read: false,
        });

        return {
          conversationId: _id,
          partner,
          lastMessage: lastMessage.content,
          lastMessageTime: lastMessage.createdAt,
          unread,
        };
      })
    );

    res.json({ conversations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching conversations' });
  }
};
