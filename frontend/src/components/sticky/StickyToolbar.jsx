import { useState } from 'react';
import { useNotes } from '../../context/NotesContext';
import { combineNotes } from '../../services/api';
import { FiPlus, FiLayers } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ['yellow', 'blue', 'green', 'pink', 'purple', 'orange'];
const COLOR_SWATCHES = {
  yellow: '#fbbf24', blue: '#60a5fa', green: '#4ade80',
  pink: '#f472b6', purple: '#a78bfa', orange: '#fb923c',
};

export default function StickyToolbar({ onAdd, loading }) {
  const { stickyNotes, fetchAIUsage } = useNotes();
  const [showPicker, setShowPicker] = useState(false);
  const [combining, setCombining] = useState(false);
  const [combined, setCombined] = useState('');
  const [showCombined, setShowCombined] = useState(false);

  const handleCombine = async () => {
    const contents = stickyNotes.filter((n) => n.content.trim()).map((n) => n.content);
    if (contents.length < 2) return toast.error('Need at least 2 notes with content to combine');
    setCombining(true);
    try {
      const res = await combineNotes(contents);
      setCombined(res.data.summary);
      setShowCombined(true);
      fetchAIUsage();
      toast.success('Notes combined! ✨');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to combine');
    } finally {
      setCombining(false);
    }
  };

  return (
    <div className="sticky-toolbar">
      {/* Color picker */}
      <div className="color-picker-wrap">
        <button
          className="btn-ghost sm"
          onClick={() => setShowPicker(!showPicker)}
          title="Add note"
        >
          <FiPlus /> Add Note
        </button>
        <AnimatePresence>
          {showPicker && (
            <motion.div
              className="color-picker"
              initial={{ opacity: 0, scale: 0.9, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              {COLORS.map((c) => (
                <button
                  key={c}
                  className="color-swatch"
                  style={{ background: COLOR_SWATCHES[c] }}
                  onClick={() => { onAdd(c); setShowPicker(false); }}
                  title={c}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Combine with AI */}
      <button
        className="btn-ghost sm"
        onClick={handleCombine}
        disabled={combining}
        title="Combine all notes with AI"
      >
        {combining ? <span className="spinner-xs" /> : <FiLayers />}
        Combine AI
      </button>

      {/* Combined result modal */}
      <AnimatePresence>
        {showCombined && combined && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCombined(false)}
          >
            <motion.div
              className="modal-card"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>🤖 AI Combined Summary</h2>
                <button className="btn-ghost" onClick={() => setShowCombined(false)}>✕</button>
              </div>
              <div className="combined-result">
                <pre>{combined}</pre>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
