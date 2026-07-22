import React, { useEffect, useRef, useState } from 'react';
import { notificationAPI } from '../../services/api';

export function NotificationBell({ socket }) {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [panelStyle, setPanelStyle] = useState({});
  const bellRef = useRef(null);

  // Request browser notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Fetch initial unread count
  useEffect(() => {
    notificationAPI.getAll().then((res) => {
      setCount(res.data.unreadCount || 0);
    }).catch(() => {});
  }, []);

  // Socket: live count updates
  useEffect(() => {
    if (!socket) return;
    const handler = ({ count: newCount }) => setCount(newCount);
    socket.on('notifications_count', handler);
    return () => socket.off('notifications_count', handler);
  }, [socket]);

  // Socket: browser notification when tab is not active
  useEffect(() => {
    if (!socket) return;
    const handler = ({ senderName, content }) => {
      if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(`New message from ${senderName}`, {
          body: content,
          icon: '/favicon.ico',
        });
      }
    };
    socket.on('new_message_notification', handler);
    return () => socket.off('new_message_notification', handler);
  }, [socket]);

  // Load notifications when panel opens
  useEffect(() => {
    if (!open) return;
    notificationAPI.getAll().then((res) => {
      setNotifications(res.data.notifications || []);
      setCount(res.data.unreadCount || 0);
    }).catch(() => {});
  }, [open]);

  // Outside click to close
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Toggle panel — compute position from button rect for fixed positioning
  const handleToggle = () => {
    if (!open && bellRef.current) {
      const rect = bellRef.current.getBoundingClientRect();
      setPanelStyle({
        top: rect.bottom + 8,
        left: rect.right + 8,
      });
    }
    setOpen((o) => !o);
  };

  const markAllRead = async () => {
    try {
      await notificationAPI.markRead();
      setCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}h ago`;
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div ref={bellRef} className="notif-bell-container">
      <button
        className="notif-bell-btn"
        onClick={handleToggle}
        title="Notifications"
      >
        🔔
        {count > 0 && (
          <span className="notif-badge">{count > 99 ? '99+' : count}</span>
        )}
      </button>

      {open && (
        <div
          className="notif-panel"
          style={{ top: panelStyle.top, left: panelStyle.left }}
        >
          <div className="notif-panel-header">
            <span className="notif-panel-title">Notifications</span>
            {count > 0 && (
              <button className="notif-mark-all-btn" onClick={markAllRead}>
                Mark all read
              </button>
            )}
          </div>

          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">No notifications yet</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`notif-item ${n.read ? '' : 'unread'}`}
                >
                  <div className="notif-avatar">
                    {n.sender?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="notif-content">
                    <div className="notif-text">
                      <strong>{n.sender?.name}</strong> sent you a message
                    </div>
                    {n.preview && (
                      <div className="notif-preview">{n.preview.substring(0, 80)}</div>
                    )}
                    <div className="notif-time">{formatTime(n.createdAt)}</div>
                  </div>
                  {!n.read && <div className="notif-dot" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
