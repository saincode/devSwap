const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const connectDB = require('./config/db');
const Message = require('./models/Message');
const notificationService = require('./services/notificationService');
const { fetchLinkPreview, isValidUrl } = require('./services/linkPreviewService');

const app = express();
const server = http.createServer(app);

// ─────────────────────────────────────────────────────────────────────────────
// Socket.IO setup
// ─────────────────────────────────────────────────────────────────────────────
const CLIENT_URL = (process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '');

const allowedOrigins = [
  CLIENT_URL,
  'http://localhost:3000',
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    const normalised = origin.replace(/\/$/, '');
    if (allowedOrigins.includes(normalised)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
};

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const normalised = origin.replace(/\/$/, '');
      if (allowedOrigins.includes(normalised)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Connect to Database
connectDB();

// ─────────────────────────────────────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────────────────────────────────────
app.use(cors(corsOptions));
app.use(express.json());

// Serve uploaded files as static assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─────────────────────────────────────────────────────────────────────────────
// REST Routes
// ─────────────────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/matches', require('./routes/matchRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

// Basic health-check route
app.get('/', (req, res) => {
  res.json({ message: 'DevSwap API Server Running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  // Multer file type/size errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'File too large. Maximum size is 10 MB.' });
  }
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// ─────────────────────────────────────────────────────────────────────────────
// Socket.IO — Real-time Chat
// ─────────────────────────────────────────────────────────────────────────────

// Map userId → Set<socketId> (supports multiple tabs)
const onlineUsers = new Map();

// ── JWT auth middleware for socket connections ────────────────────────────────
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication error'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

// ── Helper: serialize reactions Map → plain object ────────────────────────────
const serializeReactions = (reactions) => {
  const obj = {};
  if (!reactions) return obj;
  reactions.forEach((userIds, emoji) => {
    obj[emoji] = userIds.map((id) => id.toString());
  });
  return obj;
};

io.on('connection', (socket) => {
  const userId = socket.userId;

  // Track online users (support multiple sockets per user)
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }
  onlineUsers.get(userId).add(socket.id);

  io.emit('online_users', Array.from(onlineUsers.keys()));
  console.log(`🟢 User connected: ${userId} [${socket.id}]`);

  // ── Join a private conversation room ────────────────────────────────────────
  socket.on('join_conversation', ({ conversationId }) => {
    socket.join(conversationId);
  });

  // ── Send a message (text, code, or link via socket) ─────────────────────────
  socket.on('send_message', async ({ receiverId, content, type = 'text', codeLanguage, codeContent, replyTo }) => {
    try {
      const conversationId = Message.buildConversationId(userId, receiverId);

      const msgData = {
        conversationId,
        sender: userId,
        receiver: receiverId,
        type,
        content: content || '',
        deliveryStatus: 'sent',
      };

      // Code snippet
      if (type === 'code' && codeContent) {
        msgData.codeSnippet = { language: codeLanguage || 'javascript', code: codeContent };
      }

      // Link preview (best-effort, async)
      if (type === 'link' && content && isValidUrl(content)) {
        const preview = await fetchLinkPreview(content);
        msgData.linkPreview = preview;
      }

      // Reply
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

      const msgObj = message.toObject();
      msgObj.reactions = serializeReactions(message.reactions);

      // Emit to conversation room (both participants)
      io.to(conversationId).emit('receive_message', msgObj);

      // Create notification
      const preview =
        type === 'code'
          ? `[Code: ${codeLanguage || 'snippet'}]`
          : type === 'link'
          ? content
          : (content || '').substring(0, 100);

      await notificationService.createNotification({
        recipient: receiverId,
        sender: userId,
        type: 'message',
        conversationId,
        messageId: message._id,
        preview,
      });

      // Notify receiver if online in another tab/window
      const receiverSockets = onlineUsers.get(receiverId);
      if (receiverSockets && receiverSockets.size > 0) {
        receiverSockets.forEach((sId) => {
          io.to(sId).emit('new_message_notification', {
            conversationId,
            senderName: message.sender.name,
            content: preview,
            senderId: userId,
          });
        });
      }

      // Update unread count for receiver
      const unreadCount = await notificationService.getUnreadCount(receiverId);
      receiverSockets?.forEach((sId) => {
        io.to(sId).emit('notifications_count', { count: unreadCount });
      });

    } catch (err) {
      console.error('[socket:send_message]', err);
      socket.emit('message_error', { message: 'Failed to send message' });
    }
  });

  // ── Typing indicators ────────────────────────────────────────────────────────
  socket.on('typing', ({ conversationId, isTyping }) => {
    socket.to(conversationId).emit('user_typing', { userId, isTyping });
  });

  // ── Mark messages as seen ────────────────────────────────────────────────────
  socket.on('mark_seen', async ({ conversationId, senderId }) => {
    try {
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

      // Notify original sender that messages were seen
      const senderSockets = onlineUsers.get(senderId);
      if (senderSockets) {
        senderSockets.forEach((sId) => {
          io.to(sId).emit('message_seen', { conversationId, seenBy: userId });
        });
      }
    } catch (err) {
      console.error('[socket:mark_seen]', err);
    }
  });

  // ── Emoji reaction (via socket for real-time) ────────────────────────────────
  socket.on('add_reaction', async ({ messageId, emoji }) => {
    try {
      const message = await Message.findById(messageId);
      if (!message) return;

      const reactions = message.reactions || new Map();
      const users = reactions.get(emoji) || [];
      const idx = users.findIndex((id) => id.toString() === userId);

      if (idx === -1) {
        users.push(new require('mongoose').Types.ObjectId(userId));
      } else {
        users.splice(idx, 1);
      }

      if (users.length === 0) {
        reactions.delete(emoji);
      } else {
        reactions.set(emoji, users);
      }

      message.reactions = reactions;
      await message.save();

      const reactionsObj = serializeReactions(message.reactions);

      io.to(message.conversationId).emit('reaction_updated', {
        messageId,
        reactions: reactionsObj,
      });
    } catch (err) {
      console.error('[socket:add_reaction]', err);
    }
  });

  // ── File message notification (file uploaded via REST, notify via socket) ────
  socket.on('file_message_sent', ({ conversationId, message }) => {
    io.to(conversationId).emit('receive_message', message);
  });

  // ── Disconnect ───────────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    const userSockets = onlineUsers.get(userId);
    if (userSockets) {
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        onlineUsers.delete(userId);
      }
    }
    io.emit('online_users', Array.from(onlineUsers.keys()));
    console.log(`🔴 User disconnected: ${userId} [${socket.id}]`);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
