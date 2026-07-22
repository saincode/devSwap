import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { chatAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { ChatSidebar } from '../components/chat/ChatSidebar';
import { ChatWindow } from '../components/chat/ChatWindow';
import '../components/chat/chat.css';

// ─────────────────────────────────────────────────────────────────────────────
// ChatPage — orchestrates sidebar + chat window
// ─────────────────────────────────────────────────────────────────────────────
export function ChatPage({ socket }) {
  const { user } = useAuth();
  const location = useLocation();
  const partnerFromNav = location.state?.partner || null;

  const [conversations, setConversations] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(partnerFromNav);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [notification, setNotification] = useState(null);

  const currentUserId = user?._id || user?.id;

  // ── Load conversation list ─────────────────────────────────────────────────
  const refreshConversations = () => {
    chatAPI
      .getConversations()
      .then((res) => setConversations(res.data.conversations || []))
      .catch(console.error)
      .finally(() => setLoadingConvs(false));
  };

  useEffect(() => {
    refreshConversations();
  }, []);

  // ── Socket: refresh sidebar on new message ─────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleNotification = ({ senderName, content }) => {
      setNotification({ senderName, content });
      setTimeout(() => setNotification(null), 4000);
      refreshConversations();
    };

    socket.on('new_message_notification', handleNotification);

    // Also refresh on receive (in case user switches conversations)
    const handleReceive = () => {
      refreshConversations();
    };
    socket.on('receive_message', handleReceive);

    return () => {
      socket.off('new_message_notification', handleNotification);
      socket.off('receive_message', handleReceive);
    };
  }, [socket]);

  // ── When selecting a partner, clear unread badge optimistically ───────────
  const handleSelectPartner = (partner) => {
    setSelectedPartner(partner);
    setConversations((prev) =>
      prev.map((conv) =>
        conv.partner?._id === partner?._id ? { ...conv, unread: 0 } : conv
      )
    );
  };

  return (
    <div className="chat-page">
      {/* Toast notification */}
      {notification && (
        <div className="chat-toast">
          <strong>{notification.senderName}</strong>: {notification.content}
        </div>
      )}

      <div className="chat-layout">
        {/* ── Conversation Sidebar ──────────────────────────────────────── */}
        <ChatSidebar
          conversations={conversations}
          loadingConvs={loadingConvs}
          selectedPartner={selectedPartner}
          onSelect={handleSelectPartner}
        />

        {/* ── Main Chat Area ────────────────────────────────────────────── */}
        <main className="chat-main">
          {selectedPartner ? (
            <ChatWindow
              key={selectedPartner._id}
              partner={selectedPartner}
              onClose={() => setSelectedPartner(null)}
              socket={socket}
              currentUserId={currentUserId}
            />
          ) : (
            <div className="chat-placeholder">
              <div style={{ fontSize: '4rem' }}>💬</div>
              <h2>Select a conversation</h2>
              <p>Choose a match to start chatting</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default ChatPage;
