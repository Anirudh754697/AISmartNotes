import { useState, useRef } from 'react';
import { useNotes } from '../../context/NotesContext';
import { createTextNote, uploadFileNote } from '../../services/api';
import toast from 'react-hot-toast';
import { FiX, FiUpload, FiFileText, FiImage, FiType } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = [
  { id: 'text', label: 'Text', icon: FiType },
  { id: 'pdf', label: 'PDF', icon: FiFileText },
  { id: 'image', label: 'Image', icon: FiImage },
];

export default function NoteUploader({ onClose }) {
  const { addNote, fetchAIUsage } = useNotes();
  const [tab, setTab] = useState('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    const isPdf = f.type === 'application/pdf';
    const isImage = f.type.startsWith('image/');
    if (!isPdf && !isImage) return toast.error('Only PDF and image files supported');
    setFile(f);
    if (isPdf) setTab('pdf');
    else setTab('image');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (tab === 'text') {
        if (!content.trim()) return toast.error('Please enter some content');
        res = await createTextNote(title || 'Text Note', content);
      } else {
        if (!file) return toast.error('Please select a file');
        const fd = new FormData();
        fd.append('file', file);
        if (title) fd.append('title', title);
        res = await uploadFileNote(fd);
      }
      addNote(res.data.note);
      fetchAIUsage();
      toast.success('Note created with AI analysis! ✨');
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      toast.error(msg.includes('limit') ? '⚠️ Daily AI limit reached' : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="modal-card"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h2>Add New Note</h2>
            <button className="icon-btn" onClick={onClose}><FiX /></button>
          </div>

          {/* Tabs */}
          <div className="uploader-tabs">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={`uploader-tab ${tab === t.id ? 'active' : ''}`}
                onClick={() => { setTab(t.id); setFile(null); }}
              >
                <t.icon size={14} /> {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="uploader-form">
            <input
              type="text"
              placeholder="Note title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
            />

            {tab === 'text' ? (
              <textarea
                placeholder="Paste your notes, lecture content, or any text here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="form-textarea"
                rows={8}
                required
              />
            ) : (
              <div
                className={`drop-zone ${dragOver ? 'dragover' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                onClick={() => fileRef.current.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept={tab === 'pdf' ? '.pdf' : 'image/*'}
                  onChange={(e) => handleFile(e.target.files[0])}
                  style={{ display: 'none' }}
                />
                {file ? (
                  <div className="file-selected">
                    <FiFileText size={28} />
                    <span>{file.name}</span>
                    <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                ) : (
                  <>
                    <FiUpload size={32} />
                    <p>Drop {tab === 'pdf' ? 'PDF' : 'image'} here or click to browse</p>
                    <span className="drop-hint">Max 10MB</span>
                  </>
                )}
              </div>
            )}

            <div className="ai-notice">
              ✨ AI will automatically generate summary, key points, flashcards & quiz
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? (
                  <><span className="spinner-sm" /> Analyzing with AI...</>
                ) : (
                  'Create Note with AI'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
