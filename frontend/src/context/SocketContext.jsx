import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import { notificationAPI } from '../services/api';

const SocketContext = createContext({ socket: null, onlineUsers: [], notificationCount: 0 });

export function SocketProvider({ children }) {
  const { token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);

  // ── Fetch initial unread count when token changes ─────────────────────────
  useEffect(() => {
    if (!token) {
      setNotificationCount(0);
      return;
    }
    notificationAPI.getAll(1, 0).then((res) => {
      setNotificationCount(res.data.unreadCount || 0);
    }).catch(() => {});
  }, [token]);

  // ── Socket connection lifecycle ───────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      setSocket((prev) => {
        if (prev) prev.disconnect();
        return null;
      });
      return;
    }

    const newSocket = io('http://localhost:5000', {
      auth: { token },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('🔌 Socket connected:', newSocket.id);
    });

    newSocket.on('online_users', (users) => {
      setOnlineUsers(users);
    });

    // Live notification count from server
    newSocket.on('notifications_count', ({ count }) => {
      setNotificationCount(count);
    });

    // Increment badge on any new message notification
    newSocket.on('new_message_notification', () => {
      setNotificationCount((prev) => prev + 1);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  // ── Expose a reset function to clear count when user opens chat ───────────
  const resetNotificationCount = () => {
    setNotificationCount(0);
    // Persist mark-all-read to the database so the count doesn't reappear on next login
    notificationAPI.markRead().catch(() => {});
  };

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, notificationCount, resetNotificationCount }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
