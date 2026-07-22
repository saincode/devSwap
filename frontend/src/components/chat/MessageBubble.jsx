import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// ─────────────────────────────────────────────────────────────────────────────
// ReadReceipt — ✓ sent  ✓✓ delivered  ✓✓ seen (blue)
// ─────────────────────────────────────────────────────────────────────────────
function ReadReceipt({ status }) {
  if (status === 'seen') {
    return <span className="read-receipt seen" title="Seen">✓✓</span>;
  }
  if (status === 'delivered') {
    return <span className="read-receipt delivered" title="Delivered">✓✓</span>;
  }
  return <span className="read-receipt sent" title="Sent">✓</span>;
}

// ─────────────────────────────────────────────────────────────────────────────
// LinkPreviewCard — renders URL open-graph preview
// ─────────────────────────────────────────────────────────────────────────────
function LinkPreviewCard({ linkPreview, isMine }) {
  if (!linkPreview) return null;
  return (
    <a
      href={linkPreview.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`link-preview-card ${isMine ? 'mine' : 'theirs'}`}
    >
      {linkPreview.image && (
        <img
          src={linkPreview.image}
          alt={linkPreview.title}
          className="link-preview-img"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      )}
      <div className="link-preview-body">
        <div className="link-preview-domain">{linkPreview.domain}</div>
        <div className="link-preview-title">{linkPreview.title}</div>
        {linkPreview.description && (
          <div className="link-preview-desc">{linkPreview.description.substring(0, 120)}</div>
        )}
      </div>
    </a>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FileAttachment — renders file download card
// ─────────────────────────────────────────────────────────────────────────────
function FileAttachment({ attachment, isMine }) {
  if (!attachment) return null;

  const isImage = attachment.mimetype?.startsWith('image/');
  const BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', '');
  const fileUrl = `${BASE_URL}${attachment.url}`;
  const sizeKB = Math.round((attachment.size || 0) / 1024);

  if (isImage) {
    return (
      <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="file-image-link">
        <img
          src={fileUrl}
          alt={attachment.originalName}
          className="file-image-preview"
        />
        <div className="file-name">{attachment.originalName}</div>
      </a>
    );
  }

  // Non-image file
  const ext = attachment.originalName?.split('.').pop()?.toUpperCase() || 'FILE';
  return (
    <a
      href={fileUrl}
      download={attachment.originalName}
      target="_blank"
      rel="noopener noreferrer"
      className={`file-card ${isMine ? 'mine' : 'theirs'}`}
    >
      <div className="file-icon">{ext}</div>
      <div className="file-info">
        <div className="file-name">{attachment.originalName}</div>
        <div className="file-size">{sizeKB} KB</div>
      </div>
      <div className="file-download-icon">⬇</div>
    </a>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ReplyQuote — shows the referenced message above the reply
// ─────────────────────────────────────────────────────────────────────────────
function ReplyQuote({ replyTo }) {
  if (!replyTo) return null;

  let preview = replyTo.content || '';
  if (replyTo.type === 'code') preview = `[Code: ${replyTo.codeSnippet?.language || 'snippet'}]`;
  if (replyTo.type === 'file') preview = `[File: ${replyTo.attachment?.originalName || 'attachment'}]`;

  return (
    <div className="reply-quote">
      <div className="reply-quote-bar" />
      <div className="reply-quote-content">
        <span className="reply-quote-author">
          {replyTo.sender?.name || 'User'}
        </span>
        <span className="reply-quote-text">{preview.substring(0, 100)}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MessageBubble — the main message renderer
// ─────────────────────────────────────────────────────────────────────────────
export function MessageBubble({
  msg,
  isMine,
  currentUserId,
}) {
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };


  return (
    <div className={`chat-bubble-row ${isMine ? 'mine' : 'theirs'}`}>
      <div className="chat-bubble">
        {/* Reply quote */}
        {msg.replyTo && <ReplyQuote replyTo={msg.replyTo} />}

        {/* Message content based on type */}
        {msg.type === 'text' && (
          <span className="bubble-content">{msg.content}</span>
        )}

        {msg.type === 'code' && msg.codeSnippet && (
          <div className="code-snippet-wrapper">
            <div className="code-snippet-header">
              <span className="code-lang-badge">{msg.codeSnippet.language}</span>
              <button
                className="code-copy-btn"
                onClick={() => navigator.clipboard.writeText(msg.codeSnippet.code)}
                title="Copy code"
              >
                📋 Copy
              </button>
            </div>
            <SyntaxHighlighter
              language={msg.codeSnippet.language}
              style={vscDarkPlus}
              customStyle={{ margin: 0, borderRadius: '0 0 8px 8px', fontSize: '0.82rem' }}
              showLineNumbers
            >
              {msg.codeSnippet.code}
            </SyntaxHighlighter>
          </div>
        )}

        {msg.type === 'link' && (
          <>
            <a
              href={msg.content}
              target="_blank"
              rel="noopener noreferrer"
              className="bubble-link"
            >
              {msg.content}
            </a>
            <LinkPreviewCard linkPreview={msg.linkPreview} isMine={isMine} />
          </>
        )}

        {msg.type === 'file' && (
          <FileAttachment attachment={msg.attachment} isMine={isMine} />
        )}

        {/* Time + Read receipt */}
        <div className="bubble-meta">
          <span className="bubble-time">{formatTime(msg.createdAt)}</span>
          {isMine && <ReadReceipt status={msg.deliveryStatus || 'sent'} />}
        </div>
      </div>

    </div>
  );
}

export default MessageBubble;
