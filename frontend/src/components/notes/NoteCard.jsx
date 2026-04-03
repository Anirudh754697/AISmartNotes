import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiChevronDown, FiChevronUp, FiFileText, FiImage, FiType } from 'react-icons/fi';
import FlashcardView from './FlashcardView';
import QuizView from './QuizView';

const TYPE_ICONS = { text: FiType, pdf: FiFileText, image: FiImage };
const TYPE_COLORS = { text: '#7c3aed', pdf: '#db2777', image: '#0891b2' };

export default function NoteCard({ note, onDelete, onClick, isExpanded }) {
  const [activeTab, setActiveTab] = useState('summary');
  const Icon = TYPE_ICONS[note.type] || FiType;

  return (
    <motion.div
      layout
      className={`note-card ${isExpanded ? 'expanded' : ''}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Card Header */}
      <div className="note-card-header" onClick={onClick} style={{ cursor: 'pointer' }}>
        <div className="note-type-badge" style={{ background: TYPE_COLORS[note.type] + '22', color: TYPE_COLORS[note.type] }}>
          <Icon size={13} />
          <span>{note.type.toUpperCase()}</span>
        </div>
        <h3 className="note-title">{note.title}</h3>
        <div className="note-header-actions">
          <button className="icon-btn danger" onClick={(e) => { e.stopPropagation(); onDelete(note._id); }}>
            <FiTrash2 size={15} />
          </button>
          <span className="expand-icon">{isExpanded ? <FiChevronUp /> : <FiChevronDown />}</span>
        </div>
      </div>

      {/* Summary always visible */}
      {note.summary && (
        <p className="note-summary">{note.summary}</p>
      )}

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            {/* Inner Tabs */}
            <div className="note-tabs">
              {['summary', 'keypoints', 'flashcards', 'quiz'].map((t) => (
                <button
                  key={t}
                  className={`note-tab ${activeTab === t ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setActiveTab(t); }}
                >
                  {t === 'keypoints' ? 'Key Points' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            <div className="note-tab-content">
              {activeTab === 'summary' && (
                <div className="content-block">
                  <p>{note.summary || 'No summary available.'}</p>
                  {note.originalContent && (
                    <details className="original-content">
                      <summary>View original content</summary>
                      <p>{note.originalContent.substring(0, 800)}{note.originalContent.length > 800 ? '…' : ''}</p>
                    </details>
                  )}
                </div>
              )}

              {activeTab === 'keypoints' && (
                <ul className="key-points">
                  {(note.keyPoints || []).map((pt, i) => (
                    <li key={i}><span className="kp-bullet">▸</span> {pt}</li>
                  ))}
                </ul>
              )}

              {activeTab === 'flashcards' && (
                <FlashcardView flashcards={note.flashcards || []} />
              )}

              {activeTab === 'quiz' && (
                <QuizView questions={note.quizQuestions || []} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
