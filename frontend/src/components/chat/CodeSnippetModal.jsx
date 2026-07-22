import React, { useState, useRef } from 'react';

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'cpp', 'c',
  'csharp', 'go', 'rust', 'php', 'ruby', 'swift', 'kotlin',
  'html', 'css', 'sql', 'bash', 'json', 'yaml', 'markdown',
];

export function CodeSnippetModal({ onSend, onClose }) {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const textareaRef = useRef(null);

  const handleSend = () => {
    if (!code.trim()) return;
    onSend({ language, code: code.trim() });
    onClose();
  };

  const handleKeyDown = (e) => {
    // Tab inserts spaces instead of changing focus
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        textareaRef.current.selectionStart = start + 2;
        textareaRef.current.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="code-modal" onClick={(e) => e.stopPropagation()}>
        <div className="code-modal-header">
          <h3>📎 Share Code Snippet</h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="code-modal-body">
          <div className="code-modal-lang-row">
            <label htmlFor="code-lang-select">Language:</label>
            <select
              id="code-lang-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="lang-select"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <textarea
            ref={textareaRef}
            className="code-textarea"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Paste your ${language} code here…`}
            spellCheck={false}
          />
        </div>

        <div className="code-modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button
            className="btn-send-code"
            onClick={handleSend}
            disabled={!code.trim()}
          >
            Send Snippet
          </button>
        </div>
      </div>
    </div>
  );
}

export default CodeSnippetModal;
