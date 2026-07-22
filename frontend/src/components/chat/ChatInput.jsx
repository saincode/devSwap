import React, { useState, useRef } from 'react';
import { FileUpload } from './FileUpload';
import { EmojiPickerWrapper } from './EmojiPickerWrapper';
import { isValidUrl } from '../../utils/chatUtils';

export function ChatInput({
  partner,
  socket,
  conversationId,
  onFileSent,
  onOptimisticSend,
  currentUserId,
}) {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const typingTimeoutRef = useRef(null);

  // ── Typing indicator ──────────────────────────────────────────────────────
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

  const stopTyping = () => {
    clearTimeout(typingTimeoutRef.current);
    if (isTyping) {
      setIsTyping(false);
      socket?.emit('typing', { conversationId, isTyping: false });
    }
  };

  // ── Send text / link message via socket ───────────────────────────────────
  const sendTextMessage = () => {
    const trimmed = input.trim();
    if (!trimmed || !socket) return;

    const type = isValidUrl(trimmed) ? 'link' : 'text';
    const tempId = `temp_${Date.now()}`;

    // Optimistic: show message immediately
    onOptimisticSend?.({
      _id: tempId,
      _optimistic: true,
      conversationId,
      type,
      content: trimmed,
      sender: { _id: currentUserId },
      deliveryStatus: 'sent',
      createdAt: new Date().toISOString(),
    });

    socket.emit('send_message', {
      receiverId: partner._id,
      content: trimmed,
      type,
    });

    setInput('');
    stopTyping();
  };

  // ── Upload file via REST, then notify via socket ──────────────────────────
  const sendFile = async (file) => {
    setUploading(true);
    try {
      const { chatAPI } = await import('../../services/api');
      const res = await chatAPI.sendMessage({
        receiverId: partner._id,
        type: 'file',
        content: '',
        file,
      });
      const msg = res.data.message;
      // Notify partner via socket
      socket?.emit('file_message_sent', { conversationId, message: msg });
      onFileSent(msg);
    } catch (err) {
      console.error('File upload failed:', err);
      alert('File upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // ── Emoji insert into text input ──────────────────────────────────────────
  const insertEmoji = (emoji) => {
    setInput((prev) => prev + emoji);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendTextMessage();
    }
  };

  return (
    <>

      <div className="chat-input-row">
        {/* Toolbar buttons */}
        <div className="chat-input-toolbar">
          <button
            className="toolbar-btn"
            onClick={() => setShowFileModal(true)}
            title="Send file"
            aria-label="Attach file"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66L9.41 17.41a2 2 0 01-2.83-2.83L15.07 6.1"/>
            </svg>
          </button>
          <button
            className="toolbar-btn"
            onClick={() => setShowEmojiPicker((v) => !v)}
            title="Emoji"
            aria-label="Insert emoji"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
              <line x1="9" y1="9" x2="9.01" y2="9"/>
              <line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
          </button>
        </div>

        {/* Text input */}
        <textarea
          className="chat-input"
          placeholder={uploading ? 'Uploading…' : `Message ${partner.name}…`}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={uploading}
        />

        {/* Send button */}
        <button
          className="chat-send-btn"
          onClick={sendTextMessage}
          disabled={!input.trim() || uploading}
          aria-label="Send message"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>

      {/* Emoji picker */}
      {showEmojiPicker && (
        <EmojiPickerWrapper
          onEmojiClick={insertEmoji}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}

      {/* File upload modal */}
      {showFileModal && (
        <FileUpload
          onFileSelect={sendFile}
          onClose={() => setShowFileModal(false)}
        />
      )}
    </>
  );
}

export default ChatInput;
