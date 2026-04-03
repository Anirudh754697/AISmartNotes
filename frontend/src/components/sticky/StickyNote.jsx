import { useState, useRef, useCallback } from 'react';
import { useNotes } from '../../context/NotesContext';
import { updateStickyNote as apiUpdate, deleteStickyNote as apiDelete, enhanceNote } from '../../services/api';
import { motion } from 'framer-motion';
import { FiTrash2, FiZap, FiMapPin, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

const COLOR_MAP = {
  yellow: { bg: '#fef9c3', border: '#fbbf24', text: '#78350f', header: '#fde68a' },
  blue: { bg: '#dbeafe', border: '#60a5fa', text: '#1e3a5f', header: '#bfdbfe' },
  green: { bg: '#dcfce7', border: '#4ade80', text: '#14532d', header: '#bbf7d0' },
  pink: { bg: '#fce7f3', border: '#f472b6', text: '#831843', header: '#fbcfe8' },
  purple: { bg: '#ede9fe', border: '#a78bfa', text: '#4c1d95', header: '#ddd6fe' },
  orange: { bg: '#ffedd5', border: '#fb923c', text: '#7c2d12', header: '#fed7aa' },
};

export default function StickyNoteComponent({ note, boardRef }) {
  const { updateStickyNote, removeStickyNote, fetchAIUsage } = useNotes();
  const [content, setContent] = useState(note.content);
  const [editing, setEditing] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [showEnhanced, setShowEnhanced] = useState(false);
  const [pos, setPos] = useState(note.position || { x: 100, y: 100 });
  const dragStart = useRef(null);
  const noteRef = useRef(null);
  const colors = COLOR_MAP[note.color] || COLOR_MAP.yellow;

  // ── Drag Logic ──────────────────────────────────
  const onMouseDown = useCallback((e) => {
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
    e.preventDefault();
    const startX = e.clientX - pos.x;
    const startY = e.clientY - pos.y;

    const onMove = (me) => {
      const board = boardRef.current;
      const noteEl = noteRef.current;
      if (!board || !noteEl) return;
      const boardRect = board.getBoundingClientRect();
      const noteW = noteEl.offsetWidth;
      const noteH = noteEl.offsetHeight;
      const newX = Math.max(0, Math.min(me.clientX - startX, boardRect.width - noteW));
      const newY = Math.max(0, Math.min(me.clientY - startY, boardRect.height - noteH));
      setPos({ x: newX, y: newY });
    };

    const onUp = async () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      // Save position to backend
      try {
        await apiUpdate(note._id, { position: pos });
        updateStickyNote(note._id, { position: pos });
      } catch {}
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [pos, note._id, boardRef]);

  const handleSave = async () => {
    setEditing(false);
    try {
      await apiUpdate(note._id, { content });
      updateStickyNote(note._id, { content });
    } catch { toast.error('Failed to save'); }
  };

  const handlePin = async () => {
    try {
      await apiUpdate(note._id, { pinned: !note.pinned });
      updateStickyNote(note._id, { pinned: !note.pinned });
    } catch {}
  };

  const handleDelete = async () => {
    try {
      await apiDelete(note._id);
      removeStickyNote(note._id);
    } catch { toast.error('Failed to delete'); }
  };

  const handleEnhance = async () => {
    if (!content.trim()) return toast.error('Write something first!');
    setEnhancing(true);
    try {
      const res = await enhanceNote(content, note._id);
      updateStickyNote(note._id, { enhanced: true, enhancedContent: res.data.enhanced });
      fetchAIUsage();
      setShowEnhanced(true);
      toast.success('Note enhanced! ✨');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Enhancement failed');
    } finally {
      setEnhancing(false);
    }
  };

  return (
    <motion.div
      ref={noteRef}
      className={`sticky-note ${note.pinned ? 'pinned' : ''}`}
      style={{
        left: pos.x,
        top: pos.y,
        background: colors.bg,
        borderColor: colors.border,
        color: colors.text,
        cursor: 'grab',
        zIndex: note.pinned ? 100 : 10,
      }}
      onMouseDown={onMouseDown}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      whileHover={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
    >
      {/* Header */}
      <div className="sticky-header" style={{ background: colors.header }}>
        <div className="sticky-dots">
          <span /><span /><span />
        </div>
        <div className="sticky-actions">
          <button className={`sticky-btn ${note.pinned ? 'active' : ''}`} onClick={handlePin} title="Pin">
            <FiMapPin size={12} />
          </button>
          <button className="sticky-btn" onClick={handleEnhance} disabled={enhancing} title="Enhance with AI">
            {enhancing ? <span className="spinner-xs" /> : <FiZap size={12} />}
          </button>
          <button className="sticky-btn danger" onClick={handleDelete} title="Delete">
            <FiTrash2 size={12} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="sticky-body" onDoubleClick={() => setEditing(true)}>
        {editing ? (
          <div style={{ position: 'relative' }}>
            <textarea
              className="sticky-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              autoFocus
              style={{ color: colors.text }}
            />
            <button className="sticky-save-btn" onClick={handleSave}><FiCheck size={12} /> Save</button>
          </div>
        ) : (
          <p className="sticky-text" title="Double-click to edit">{content || <em>Double-click to edit…</em>}</p>
        )}
      </div>

      {/* Enhanced Content */}
      {note.enhancedContent && (
        <div className="sticky-enhanced">
          <button
            className="enhanced-toggle"
            onClick={() => setShowEnhanced(!showEnhanced)}
          >
            <FiZap size={11} /> {showEnhanced ? 'Hide' : 'Show'} AI Enhancement
          </button>
          {showEnhanced && (
            <div className="enhanced-content">{note.enhancedContent}</div>
          )}
        </div>
      )}
    </motion.div>
  );
}
