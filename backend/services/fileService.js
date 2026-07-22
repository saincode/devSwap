const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ─────────────────────────────────────────────────────────────────────────────
// Ensure uploads directory exists
// ─────────────────────────────────────────────────────────────────────────────
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// Allowed MIME types
// ─────────────────────────────────────────────────────────────────────────────
const ALLOWED_MIME_TYPES = new Set([
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
  // Archives
  'application/zip',
  'application/x-zip-compressed',
]);

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

// ─────────────────────────────────────────────────────────────────────────────
// Disk Storage Config
// ─────────────────────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type '${file.mimetype}' is not allowed.`), false);
  }
};

/** Multer middleware instance — use as `upload.single('file')` in routes */
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_BYTES },
});

/**
 * Build the public URL for an uploaded file.
 * @param {string} filename — the stored filename
 * @returns {string}
 */
const buildFileUrl = (filename) => `/uploads/${filename}`;

/**
 * Delete a file from disk by its stored filename.
 * @param {string} filename
 */
const deleteFile = (filename) => {
  const fullPath = path.join(UPLOAD_DIR, filename);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

module.exports = { upload, buildFileUrl, deleteFile, UPLOAD_DIR };
