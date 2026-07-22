const mongoose = require('mongoose');

// ─────────────────────────────────────────────────────────────────────────────
// Sub-schemas
// ─────────────────────────────────────────────────────────────────────────────

const codeSnippetSchema = new mongoose.Schema(
  {
    language: { type: String, default: 'javascript' },
    code: { type: String, required: true, maxlength: 10000 },
  },
  { _id: false }
);

const linkPreviewSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    domain: { type: String, default: '' },
  },
  { _id: false }
);

const attachmentSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },      // stored filename on disk
    originalName: { type: String, required: true },  // user-facing name
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },           // bytes
    url: { type: String, required: true },            // served path
  },
  { _id: false }
);

const readReceiptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    readAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Message Schema
// ─────────────────────────────────────────────────────────────────────────────

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ── Message Type ──────────────────────────────────────────────────────────
    type: {
      type: String,
      enum: ['text', 'code', 'link', 'file'],
      default: 'text',
    },

    // ── Core Content ─────────────────────────────────────────────────────────
    content: {
      type: String,
      default: '',
      trim: true,
      maxlength: 5000,
    },

    // ── Rich Content (one populated based on `type`) ──────────────────────────
    codeSnippet: { type: codeSnippetSchema, default: null },
    linkPreview: { type: linkPreviewSchema, default: null },
    attachment: { type: attachmentSchema, default: null },

    // ── Reply to another message ──────────────────────────────────────────────
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },

    // ── Emoji Reactions: { "👍": ["userId1", "userId2"], "❤️": ["userId3"] } ──
    reactions: {
      type: Map,
      of: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      default: {},
    },

    // ── Delivery / Read Status ────────────────────────────────────────────────
    deliveryStatus: {
      type: String,
      enum: ['sent', 'delivered', 'seen'],
      default: 'sent',
    },

    // Legacy single-field read flag (kept for backward compat with existing queries)
    read: {
      type: Boolean,
      default: false,
    },

    // Per-user read receipts
    readBy: {
      type: [readReceiptSchema],
      default: [],
    },

    // Soft delete
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// ─────────────────────────────────────────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────────────────────────────────────────
messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ conversationId: 1, 'readBy.user': 1 });
// Full-text search on content and code
messageSchema.index(
  { content: 'text', 'codeSnippet.code': 'text', 'attachment.originalName': 'text' },
  { name: 'message_text_search' }
);

// ─────────────────────────────────────────────────────────────────────────────
// Statics
// ─────────────────────────────────────────────────────────────────────────────

/** Build a consistent conversationId from two user IDs */
messageSchema.statics.buildConversationId = function (idA, idB) {
  return [idA.toString(), idB.toString()].sort().join('_');
};

module.exports = mongoose.model('Message', messageSchema);
