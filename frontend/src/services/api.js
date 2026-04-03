import axios from 'axios';
import { auth } from '../firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: API_URL });

// Attach Firebase auth token to every request
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Notes ──────────────────────────────────────────────────
export const getNotes = (search) =>
  api.get('/api/notes', { params: search ? { search } : {} });

export const getNoteById = (id) => api.get(`/api/notes/${id}`);

export const createTextNote = (title, content) =>
  api.post('/api/notes/text', { title, content }, { timeout: 60000 });

export const uploadFileNote = (formData) =>
  api.post('/api/notes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });

export const deleteNote = (id) => api.delete(`/api/notes/${id}`);

// ── Sticky Notes ───────────────────────────────────────────
export const getStickyNotes = () => api.get('/api/sticky');

export const createStickyNote = (data) => api.post('/api/sticky', data);

export const updateStickyNote = (id, data) => api.patch(`/api/sticky/${id}`, data);

export const deleteStickyNote = (id) => api.delete(`/api/sticky/${id}`);

// ── AI ─────────────────────────────────────────────────────
export const enhanceNote = (content, stickyNoteId) =>
  api.post('/api/ai/enhance', { content, stickyNoteId }, { timeout: 60000 });

export const combineNotes = (noteContents) =>
  api.post('/api/ai/combine', { noteContents }, { timeout: 60000 });

export const chatWithNotes = (question, noteIds) =>
  api.post('/api/ai/chat', { question, noteIds }, { timeout: 60000 });

export const getAIUsage = () => api.get('/api/ai/usage');

// ── Auth ───────────────────────────────────────────────────
export const syncUser = (displayName) => api.post('/api/auth/sync', { displayName });

export default api;
