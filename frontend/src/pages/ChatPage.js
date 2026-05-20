import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { chatAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import './ChatPage.css';

// Utility: build a consistent conversationId from two user IDs
function buildConversationId(idA, idB) {
  return [idA, idB].sort().join('_');
}

function formatTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// ─────────────────────────────────────────────────────────────────────────────
// ChatWindow — the right panel for a single conversation
// ─────────────────────────────────────────────────────────────────────────────
function ChatWindow({ partner, onClose, socket, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const conversationId = buildConversationId(currentUserId, partner._id);

  // ── Fetch message history ──────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    chatAPI
      .getHistory(partner._id)
      .then((res) => {
        if (!cancelled) {
          setMessages(res.data.messages);
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
    return () => { cancelled = true; };
  }, [partner._id]);

  // ── Join Socket.IO room & listen ───────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    socket.emit('join_conversation', { conversationId });

    const handleReceive = (msg) => {
      if (msg.conversationId === conversationId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    const handleTyping = ({ userId, isTyping }) => {
      if (userId !== currentUserId) setPartnerTyping(isTyping);
    };

    socket.on('receive_message', handleReceive);
    socket.on('user_typing', handleTyping);

    return () => {
      socket.off('receive_message', handleReceive);
      socket.off('user_typing', handleTyping);
    };
  }, [socket, conversationId, currentUserId]);

  // ── Auto-scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partnerTyping]);

  // ── Typing indicator ───────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!socket) return;
    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', { conversationId, isTyping: true });
    }
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing', { conversationId, isTyping: false });
    }, 1500);
  };

  // ── Send message ───────────────────────────────────────────────────────────
  const sendMessage = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || !socket) return;
    socket.emit('send_message', { receiverId: partner._id, content: trimmed });
    setInput('');
    clearTimeout(typingTimeoutRef.current);
    setIsTyping(false);
    socket.emit('typing', { conversationId, isTyping: false });
  }, [input, socket, partner._id, conversationId]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Group messages by date ─────────────────────────────────────────────────
  const grouped = [];
  let lastDate = null;
  for (const msg of messages) {
    const d = formatDate(msg.createdAt);
    if (d !== lastDate) {
      grouped.push({ type: 'date', label: d, key: `date-${d}` });
      lastDate = d;
    }
    grouped.push({ type: 'msg', msg });
  }

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-window-header">
        <div className="chat-partner-info">
          <div className="chat-avatar">{partner.name.charAt(0).toUpperCase()}</div>
          <div>
            <div className="chat-partner-name">{partner.name}</div>
            {partnerTyping && <div className="typing-status">typing…</div>}
          </div>
        </div>
        <button className="chat-close-btn" onClick={onClose} aria-label="Close chat">✕</button>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {loading ? (
          <div className="chat-loading">
            <div className="chat-spinner" />
          </div>
        ) : messages.length === 0 ? (
          <div className="chat-empty">
            <div className="chat-empty-icon">💬</div>
            <p>No messages yet. Say hello to <strong>{partner.name}</strong>!</p>
          </div>
        ) : (
          grouped.map((item) =>
            item.type === 'date' ? (
              <div key={item.key} className="chat-date-divider">
                <span>{item.label}</span>
              </div>
            ) : (
              <div
                key={item.msg._id}
                className={`chat-bubble-row ${
                  item.msg.sender._id === currentUserId ||
                  item.msg.sender === currentUserId
                    ? 'mine'
                    : 'theirs'
                }`}
              >
                <div className="chat-bubble">
                  <span className="bubble-content">{item.msg.content}</span>
                  <span className="bubble-time">{formatTime(item.msg.createdAt)}</span>
                </div>
              </div>
            )
          )
        )}

        {partnerTyping && (
          <div className="chat-bubble-row theirs">
            <div className="chat-bubble typing-bubble">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-row">
        <textarea
          className="chat-input"
          placeholder={`Message ${partner.name}…`}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button
          className="chat-send-btn"
          onClick={sendMessage}
          disabled={!input.trim()}
          aria-label="Send message"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ChatPage — full page with conversation list + chat window
// ─────────────────────────────────────────────────────────────────────────────
export function ChatPage({ socket }) {
  const { user } = useAuth();
  const location = useLocation();
  const partnerFromNav = location.state?.partner || null;
  const [conversations, setConversations] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(partnerFromNav);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [notification, setNotification] = useState(null);

  // Fetch conversation list
  useEffect(() => {
    chatAPI
      .getConversations()
      .then((res) => setConversations(res.data.conversations))
      .catch(console.error)
      .finally(() => setLoadingConvs(false));
  }, []);

  // Socket notifications
  useEffect(() => {
    if (!socket) return;

    const handleNotification = ({ senderName, content }) => {
      setNotification({ senderName, content });
      setTimeout(() => setNotification(null), 4000);
      // Refresh conversation list
      chatAPI.getConversations().then((res) => setConversations(res.data.conversations));
    };

    socket.on('new_message_notification', handleNotification);
    return () => socket.off('new_message_notification', handleNotification);
  }, [socket]);

  return (
    <div className="chat-page">
      {/* Toast notification */}
      {notification && (
        <div className="chat-toast">
          <strong>{notification.senderName}</strong>: {notification.content}
        </div>
      )}

      <div className="chat-layout">
        {/* ── Sidebar ─────────────────────────────── */}
        <aside className="chat-sidebar">
          <div className="chat-sidebar-header">
            <h2>💬 Messages</h2>
          </div>

          {loadingConvs ? (
            <div className="chat-loading"><div className="chat-spinner" /></div>
          ) : conversations.length === 0 ? (
            <div className="chat-sidebar-empty">
              <p>No conversations yet.</p>
              <p>Start chatting from your Matches!</p>
            </div>
          ) : (
            <ul className="conversation-list">
              {conversations.map((conv) => (
                <li
                  key={conv.conversationId}
                  className={`conversation-item ${
                    selectedPartner?._id === conv.partner?._id ? 'active' : ''
                  }`}
                  onClick={() => setSelectedPartner(conv.partner)}
                >
                  <div className="conv-avatar">
                    {conv.partner?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="conv-info">
                    <div className="conv-name">{conv.partner?.name}</div>
                    <div className="conv-last-msg">{conv.lastMessage}</div>
                  </div>
                  {conv.unread > 0 && (
                    <span className="conv-unread-badge">{conv.unread}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* ── Main Area ───────────────────────────── */}
        <main className="chat-main">
          {selectedPartner ? (
            <ChatWindow
              partner={selectedPartner}
              onClose={() => setSelectedPartner(null)}
              socket={socket}
              currentUserId={user?._id || user?.id}
            />
          ) : (
            <div className="chat-placeholder">
              <h2>Select a conversation</h2>
              <p>Choose a match to start chatting</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
