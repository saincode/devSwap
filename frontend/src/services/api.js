import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

// ── User ──────────────────────────────────────────────────────────────────────
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getAllUsers: () => api.get('/users'),
};

// ── Matching ──────────────────────────────────────────────────────────────────
export const matchAPI = {
  findMatches: () => api.get('/matches/find'),
  getMatchDetails: (userId) => api.get(`/matches/${userId}`),
};

// ── Chat ──────────────────────────────────────────────────────────────────────
export const chatAPI = {
  // Get message history with a user
  getHistory: (userId) => api.get(`/chat/${userId}`),

  // Get all conversations
  getConversations: () => api.get('/chat/conversations'),

  /**
   * Send a message via REST (required for file uploads).
   * For text/code/link, socket is preferred — this is used as fallback or for files.
   *
   * @param {object} params
   * @param {string} params.receiverId
   * @param {string} [params.type='text'] — 'text' | 'code' | 'link' | 'file'
   * @param {string} [params.content]
   * @param {string} [params.codeLanguage]
   * @param {string} [params.codeContent]
   * @param {string} [params.replyTo]   — message ID
   * @param {File}   [params.file]      — File object for uploads
   */
  sendMessage: ({ receiverId, type = 'text', content = '', codeLanguage, codeContent, replyTo, file }) => {
    const formData = new FormData();
    formData.append('receiverId', receiverId);
    formData.append('type', type);
    formData.append('content', content);
    if (codeLanguage) formData.append('codeLanguage', codeLanguage);
    if (codeContent) formData.append('codeContent', codeContent);
    if (replyTo) formData.append('replyTo', replyTo);
    if (file) formData.append('file', file);

    return api.post('/chat/send', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Search messages in a conversation
  searchMessages: (userId, query) =>
    api.get(`/chat/${userId}/search`, { params: { q: query } }),

  // Toggle emoji reaction on a message
  addReaction: (messageId, emoji) =>
    api.post(`/chat/message/${messageId}/react`, { emoji }),

  // Mark messages in a conversation as seen
  markSeen: (conversationId) =>
    api.post('/chat/mark-seen', { conversationId }),
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationAPI = {
  getAll: (limit = 20, skip = 0) =>
    api.get('/chat/notifications', { params: { limit, skip } }),

  markRead: (ids) =>
    api.post('/chat/notifications/read', { ids: ids || [] }),
};

export default api;
