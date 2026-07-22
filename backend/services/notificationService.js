const Notification = require('../models/Notification');

/**
 * Create a notification for a message recipient.
 *
 * @param {object} params
 * @param {string} params.recipient  - userId of the notification recipient
 * @param {string} params.sender     - userId of the sender
 * @param {string} params.type       - 'message' | 'mention' | 'reaction'
 * @param {string} params.conversationId
 * @param {string} [params.messageId]
 * @param {string} [params.preview]  - Short text preview
 * @returns {Promise<object>}        - Created notification document
 */
const createNotification = async ({
  recipient,
  sender,
  type = 'message',
  conversationId,
  messageId = null,
  preview = '',
}) => {
  // Don't create self-notifications
  if (recipient.toString() === sender.toString()) return null;

  const notification = await Notification.create({
    recipient,
    sender,
    type,
    conversationId,
    messageId,
    preview: preview.substring(0, 200),
  });

  return notification;
};

/**
 * Get unread notification count for a user.
 * @param {string} userId
 * @returns {Promise<number>}
 */
const getUnreadCount = async (userId) => {
  return Notification.countDocuments({ recipient: userId, read: false });
};

/**
 * Get paginated notifications for a user (newest first).
 * @param {string} userId
 * @param {number} [limit=20]
 * @param {number} [skip=0]
 * @returns {Promise<object[]>}
 */
const getNotifications = async (userId, limit = 20, skip = 0) => {
  return Notification.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sender', 'name')
    .lean();
};

/**
 * Mark all unread notifications as read for a user.
 * @param {string} userId
 * @returns {Promise<void>}
 */
const markAllRead = async (userId) => {
  await Notification.updateMany(
    { recipient: userId, read: false },
    { $set: { read: true } }
  );
};

/**
 * Mark specific notifications as read.
 * @param {string} userId
 * @param {string[]} notificationIds
 * @returns {Promise<void>}
 */
const markRead = async (userId, notificationIds) => {
  await Notification.updateMany(
    { _id: { $in: notificationIds }, recipient: userId },
    { $set: { read: true } }
  );
};

module.exports = {
  createNotification,
  getUnreadCount,
  getNotifications,
  markAllRead,
  markRead,
};
