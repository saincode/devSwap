import React, { useRef, useState } from 'react';

const ACCEPTED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain', 'text/csv',
].join(',');

const MAX_MB = 10;

export function FileUpload({ onFileSelect, onClose }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  const validate = (file) => {
    if (!file) return 'No file selected.';
    if (file.size > MAX_MB * 1024 * 1024) return `File exceeds ${MAX_MB} MB limit.`;
    return null;
  };

  const handleFile = (file) => {
    const err = validate(file);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    onFileSelect(file);
    onClose();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`file-upload-modal ${dragOver ? 'drag-over' : ''}`}
        onClick={(e) => e.stopPropagation()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="file-upload-header">
          <h3>📁 Upload File</h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div
          className="file-drop-zone"
          onClick={() => inputRef.current?.click()}
        >
          <div className="file-drop-icon">☁️</div>
          <p className="file-drop-label">
            {dragOver ? 'Drop to upload!' : 'Drag & drop or click to select'}
          </p>
          <p className="file-drop-hint">
            Images, PDFs, Docs — up to {MAX_MB} MB
          </p>
        </div>

        {error && <p className="file-upload-error">{error}</p>}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
        />

        <button
          className="btn-browse"
          onClick={() => inputRef.current?.click()}
        >
          Browse Files
        </button>
      </div>
    </div>
  );
}

export default FileUpload;
