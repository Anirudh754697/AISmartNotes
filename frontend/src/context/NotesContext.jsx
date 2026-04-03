import { createContext, useContext, useState, useCallback } from 'react';
import * as api from '../services/api';

const NotesContext = createContext(null);

export const NotesProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [stickyNotes, setStickyNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [aiUsage, setAiUsage] = useState({ used: 0, limit: 20 });

  const fetchNotes = useCallback(async (search) => {
    setLoadingNotes(true);
    try {
      const res = await api.getNotes(search);
      setNotes(res.data.notes);
    } finally {
      setLoadingNotes(false);
    }
  }, []);

  const fetchStickyNotes = useCallback(async () => {
    const res = await api.getStickyNotes();
    setStickyNotes(res.data.notes);
  }, []);

  const fetchAIUsage = useCallback(async () => {
    const res = await api.getAIUsage();
    setAiUsage(res.data);
  }, []);

  const addNote = (note) => setNotes((prev) => [note, ...prev]);
  const removeNote = (id) => setNotes((prev) => prev.filter((n) => n._id !== id));

  const addStickyNote = (note) => setStickyNotes((prev) => [note, ...prev]);
  const updateStickyNote = (id, updates) =>
    setStickyNotes((prev) => prev.map((n) => (n._id === id ? { ...n, ...updates } : n)));
  const removeStickyNote = (id) => setStickyNotes((prev) => prev.filter((n) => n._id !== id));

  return (
    <NotesContext.Provider
      value={{
        notes, stickyNotes, loadingNotes, aiUsage,
        fetchNotes, fetchStickyNotes, fetchAIUsage,
        addNote, removeNote,
        addStickyNote, updateStickyNote, removeStickyNote,
        setStickyNotes,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => useContext(NotesContext);
