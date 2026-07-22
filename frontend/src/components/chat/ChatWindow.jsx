import React, { useState, useEffect, useRef, useCallback } from 'react';
import { chatAPI } from '../../services/api';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { MessageSearch } from './MessageSearch';

const VEGGIE_AVATARS = [
  { id: '1', url: '/avatars/avatar_carrot.png' },
  { id: '2', url: '/avatars/avatar_broccoli.png' },
  { id: '3', url: '/avatars/avatar_tomato.png' },
  { id: '4', url: '/avatars/avatar_eggplant.png' },
  { id: '5', url: '/avatars/avatar_corn.png' },
  { id: '6', url: '/avatars/avatar_pea.png' },
];
const getAvatarUrl = (id) =>
  VEGGIE_AVATARS.find(a => a.id === String(id))?.url || null;

function buildConversationId(idA, idB) {
  return [idA, idB].sort().join('_');
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

export function ChatWindow({ partner, onClose, socket, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const messagesEndRef = useRef(null);
  const messageRefs = useRef({});

  const conversationId = buildConversationId(currentUserId, partner._id);

  // ── Fetch history ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setMessages([]);
    chatAPI.getHistory(partner._id)
      .then((res) => {
        if (!cancelled) {
          setMessages(res.data.messages || []);
          setLoading(false);
        }
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [partner._id]);

  // ── Socket setup ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    socket.emit('join_conversation', { conversationId });

    // Mark as seen when window opens
    socket.emit('mark_seen', { conversationId, senderId: partner._id });
    chatAPI.markSeen(conversationId).catch(() => {});

    const onReceive = (msg) => {
      if (msg.conversationId === conversationId) {
        setMessages((prev) => {
          // If a real message with this _id already exists, do nothing
          if (prev.find((m) => !m._optimistic && m._id === msg._id)) return prev;

          // Remove the optimistic placeholder that matches this real message.
          // We match by sender + content because the temp _id never equals the real _id.
          const incomingSenderId = msg.sender?._id ?? msg.sender;
          const filtered = prev.filter(
            (m) =>
              !(
                m._optimistic &&
                (m.sender?._id ?? m.sender) === incomingSenderId &&
                m.content === msg.content
              )
          );

          return [...filtered, msg];
        });
        // Mark as seen immediately if window is open
        socket.emit('mark_seen', { conversationId, senderId: partner._id });
      }
    };

    const onTyping = ({ userId, isTyping }) => {
      if (userId !== currentUserId) setPartnerTyping(isTyping);
    };

    const onMessageSeen = ({ conversationId: cId }) => {
      if (cId !== conversationId) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.sender === currentUserId || m.sender?._id === currentUserId
            ? { ...m, deliveryStatus: 'seen' }
            : m
        )
      );
    };

    socket.on('receive_message', onReceive);
    socket.on('user_typing', onTyping);
    socket.on('message_seen', onMessageSeen);

    return () => {
      socket.off('receive_message', onReceive);
      socket.off('user_typing', onTyping);
      socket.off('message_seen', onMessageSeen);
    };
  }, [socket, conversationId, currentUserId, partner._id]);

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partnerTyping]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleFileSent = useCallback((msg) => {
    setMessages((prev) => {
      if (prev.find((m) => m._id === msg._id)) return prev;
      return [...prev, msg];
    });
  }, []);

  // Optimistically add a sent message to the list before socket echoes it back
  const handleOptimisticSend = useCallback((optimisticMsg) => {
    setMessages((prev) => [...prev, optimisticMsg]);
  }, []);

  const handleSearchResultClick = (msg) => {
    setShowSearch(false);
    // Scroll to message
    setTimeout(() => {
      const el = messageRefs.current[msg._id];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('highlight-result');
        setTimeout(() => el.classList.remove('highlight-result'), 2000);
      }
    }, 100);
  };

  // ── Group by date ─────────────────────────────────────────────────────────
  const grouped = [];
  let lastDate = null;
  for (const msg of messages) {
    const d = formatDate(msg.createdAt);
    if (d !== lastDate) {
      grouped.push({ type: 'date', label: d, key: `date-${d}-${msg._id}` });
      lastDate = d;
    }
    grouped.push({ type: 'msg', msg });
  }

  const isMyMessage = (msg) =>
    (msg.sender?._id || msg.sender) === currentUserId;

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-window-header">
        <div className="chat-partner-info">
          <div className="chat-avatar chat-avatar--img">
            {getAvatarUrl(partner.avatar) ? (
              <img src={getAvatarUrl(partner.avatar)} alt={partner.name} className="chat-avatar-img" />
            ) : (
              partner.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <div className="chat-partner-name">{partner.name}</div>
            {partnerTyping && <div className="typing-status">typing…</div>}
          </div>
        </div>
        <div className="chat-header-actions">
          <button
            className="chat-header-btn"
            onClick={() => setShowSearch((v) => !v)}
            title="Search messages"
            aria-label="Search messages"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
          <button className="chat-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>
      </div>

      {/* Search panel */}
      {showSearch && (
        <MessageSearch
          partnerId={partner._id}
          onResultClick={handleSearchResultClick}
          onClose={() => setShowSearch(false)}
        />
      )}

      {/* Messages */}
      <div className="chat-messages">
        {loading ? (
          <div className="chat-loading"><div className="chat-spinner" /></div>
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
                ref={(el) => { if (el) messageRefs.current[item.msg._id] = el; }}
              >
                <MessageBubble
                  msg={item.msg}
                  isMine={isMyMessage(item.msg)}
                  currentUserId={currentUserId}
                />
              </div>
            )
          )
        )}

        {/* Typing bubble */}
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
      <ChatInput
        partner={partner}
        socket={socket}
        conversationId={conversationId}
        onFileSent={handleFileSent}
        onOptimisticSend={handleOptimisticSend}
        currentUserId={currentUserId}
      />
    </div>
  );
}

export default ChatWindow;
