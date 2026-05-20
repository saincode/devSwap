const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const connectDB = require('./config/db');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/matches', require('./routes/matchRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'DevSwap API Server Running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// ────────────────────────────────────────────────────
// Socket.IO — Real-time Chat
// ────────────────────────────────────────────────────

// Map userId → socketId for online presence
const onlineUsers = new Map();

// JWT auth middleware for socket connections
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

io.on('connection', (socket) => {
  const userId = socket.userId;
  onlineUsers.set(userId, socket.id);

  // Broadcast updated online list
  io.emit('online_users', Array.from(onlineUsers.keys()));

  console.log(`🟢 User connected: ${userId}`);

  // Join a private room for a conversation
  socket.on('join_conversation', ({ conversationId }) => {
    socket.join(conversationId);
  });

  // Handle sending a message
  socket.on('send_message', async ({ receiverId, content }) => {
    try {
      const conversationId = Message.buildConversationId(userId, receiverId);

      const message = await Message.create({
        conversationId,
        sender: userId,
        receiver: receiverId,
        content,
      });

      await message.populate('sender', 'name');
      await message.populate('receiver', 'name');

      // Emit to both participants
      io.to(conversationId).emit('receive_message', message);

      // If receiver is online but not in the room, send a notification
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('new_message_notification', {
          conversationId,
          senderName: message.sender.name,
          content,
        });
      }
    } catch (err) {
      console.error('Error saving message:', err);
      socket.emit('message_error', { message: 'Failed to send message' });
    }
  });

  // Typing indicators
  socket.on('typing', ({ conversationId, isTyping }) => {
    socket.to(conversationId).emit('user_typing', { userId, isTyping });
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(userId);
    io.emit('online_users', Array.from(onlineUsers.keys()));
    console.log(`🔴 User disconnected: ${userId}`);
  });
});

// ────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
