import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../../services/api';

export function MessageSearch({ partnerId, onResultClick, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const highlight = (text, q) => {
    if (!text || !q) return text || '';
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  const doSearch = async (q) => {
    if (q.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    try {
      const res = await chatAPI.searchMessages(partnerId, q.trim());
      setResults(res.data.messages || []);
      setSearched(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 400);
  };

  const getPreview = (msg) => {
    if (msg.type === 'code') return `[Code] ${msg.codeSnippet?.code || ''}`;
    if (msg.type === 'file') return `[File] ${msg.attachment?.originalName || ''}`;
    if (msg.type === 'link') return msg.linkPreview?.url || msg.content || '';
    return msg.content || '';
  };

  return (
    <div className="message-search-panel">
      <div className="search-panel-header">
        <div className="search-input-row">
          <span className="search-icon">🔍</span>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Search messages…"
            value={query}
            onChange={handleChange}
          />
          {query && (
            <button className="search-clear-btn" onClick={() => { setQuery(''); setResults([]); setSearched(false); }}>
              ✕
            </button>
          )}
        </div>
        <button className="search-close-btn" onClick={onClose}>Close</button>
      </div>

      <div className="search-results">
        {loading && (
          <div className="search-loading">
            <div className="chat-spinner" />
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="search-empty">No messages found for "{query}"</div>
        )}

        {!loading && results.map((msg) => {
          const preview = getPreview(msg);
          const highlighted = highlight(preview, query);
          const time = new Date(msg.createdAt).toLocaleDateString([], {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
          });

          return (
            <button
              key={msg._id}
              className="search-result-item"
              onClick={() => onResultClick(msg)}
            >
              <div className="search-result-author">{msg.sender?.name}</div>
              <div
                className="search-result-preview"
                dangerouslySetInnerHTML={{ __html: highlighted }}
              />
              <div className="search-result-time">{time}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default MessageSearch;
