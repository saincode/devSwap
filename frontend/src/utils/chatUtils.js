/**
 * Returns true if the string is a valid http/https URL.
 * @param {string} str
 * @returns {boolean}
 */
export const isValidUrl = (str) => {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Build a consistent conversationId from two user IDs.
 * @param {string} idA
 * @param {string} idB
 * @returns {string}
 */
export const buildConversationId = (idA, idB) =>
  [idA.toString(), idB.toString()].sort().join('_');

/**
 * Format a date string for display in chat date dividers.
 * @param {string} dateStr
 * @returns {string}
 */
export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

/**
 * Format a timestamp as HH:MM.
 * @param {string} dateStr
 * @returns {string}
 */
export const formatTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
