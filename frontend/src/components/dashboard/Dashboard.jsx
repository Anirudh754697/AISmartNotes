import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotes } from '../../context/NotesContext';
import Header from './Header';
import StickyBoard from '../sticky/StickyBoard';
import NoteUploader from '../notes/NoteUploader';
import NoteCard from '../notes/NoteCard';
import ChatPanel from '../chat/ChatPanel';
import { FiSearch, FiPlus, FiMessageSquare, FiBook, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const { notes, fetchNotes, fetchStickyNotes, fetchAIUsage, loadingNotes, removeNote } = useNotes();
  const [activePanel, setActivePanel] = useState('notes'); // 'notes' | 'chat'
  const [showUploader, setShowUploader] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);

  useEffect(() => {
    fetchNotes();
    fetchStickyNotes();
    fetchAIUsage();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchNotes(search);
  };

  const handleDeleteNote = async (id) => {
    const { deleteNote } = await import('../../services/api');
    try {
      await deleteNote(id);
      removeNote(id);
      if (selectedNote?._id === id) setSelectedNote(null);
      toast.success('Note deleted');
    } catch {
      toast.error('Failed to delete note');
    }
  };

  return (
    <div className="dashboard">
      <Header />

      <div className="dashboard-body">
        {/* LEFT: Sticky Board */}
        <aside className="sticky-panel">
          <StickyBoard />
        </aside>

        {/* RIGHT: AI Panel */}
        <main className="ai-panel">
          {/* Panel Tabs */}
          <div className="panel-tabs">
            <button
              className={`panel-tab ${activePanel === 'notes' ? 'active' : ''}`}
              onClick={() => setActivePanel('notes')}
            >
              <FiBook /> My Notes
            </button>
            <button
              className={`panel-tab ${activePanel === 'chat' ? 'active' : ''}`}
              onClick={() => setActivePanel('chat')}
            >
              <FiMessageSquare /> Chat with Notes
            </button>
          </div>

          {activePanel === 'notes' && (
            <div className="notes-panel">
              {/* Search + Add */}
              <div className="notes-toolbar">
                <form onSubmit={handleSearch} className="search-bar">
                  <FiSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search notes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-input"
                  />
                </form>
                <button
                  className="btn-primary"
                  onClick={() => setShowUploader(true)}
                >
                  <FiPlus /> Add Note
                </button>
              </div>

              {/* Note Uploader Modal */}
              {showUploader && (
                <NoteUploader onClose={() => setShowUploader(false)} />
              )}

              {/* Notes Grid */}
              {loadingNotes ? (
                <div className="loading-state">
                  <div className="spinner" />
                  <p>Loading notes...</p>
                </div>
              ) : notes.length === 0 ? (
                <div className="empty-state">
                  <FiZap size={48} className="empty-icon" />
                  <h3>No notes yet</h3>
                  <p>Upload text, PDF, or images to get AI-powered insights</p>
                  <button className="btn-primary" onClick={() => setShowUploader(true)}>
                    <FiPlus /> Create Your First Note
                  </button>
                </div>
              ) : (
                <div className="notes-grid">
                  {notes.map((note) => (
                    <NoteCard
                      key={note._id}
                      note={note}
                      onDelete={handleDeleteNote}
                      onClick={() => setSelectedNote(selectedNote?._id === note._id ? null : note)}
                      isExpanded={selectedNote?._id === note._id}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activePanel === 'chat' && <ChatPanel notes={notes} />}
        </main>
      </div>
    </div>
  );
}
