import { useState, useRef, useEffect } from 'react';
import { useNotes } from '../../context/NotesContext';
import { chatWithNotes } from '../../services/api';
import { FiSend, FiUser, FiCpu, FiPlus, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatPanel() {
  const { notes, fetchAIUsage } = useNotes();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your AI study assistant. Ask me anything about your uploaded notes!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNoteSelector, setShowNoteSelector] = useState(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState([]);
  
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await chatWithNotes(userMsg, selectedNoteIds);
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.answer }]);
      fetchAIUsage();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to get AI response");
    } finally {
      setLoading(false);
    }
  };

  const toggleNoteSelection = (id) => {
    setSelectedNoteIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="chat-panel">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-info">
          <FiMessageSquare className="chat-icon" />
          <div>
            <h3>Study Assistant</h3>
            <p>{selectedNoteIds.length > 0 ? `Chatting with ${selectedNoteIds.length} notes` : "Chatting with all notes"}</p>
          </div>
        </div>
        <button 
          className={`btn-ghost sm ${showNoteSelector ? 'active' : ''}`}
          onClick={() => setShowNoteSelector(!showNoteSelector)}
        >
          <FiPlus /> {showNoteSelector ? "Close Selector" : "Choose Context"}
        </button>
      </div>

      {/* Note Selector Modal-ish */}
      <AnimatePresence>
        {showNoteSelector && (
          <motion.div 
            className="note-selector"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="selector-inner">
              <p className="selector-title">Select notes to include in conversation:</p>
              <div className="selector-grid">
                {notes.map(note => (
                  <button
                    key={note._id}
                    className={`selector-item ${selectedNoteIds.includes(note._id) ? 'selected' : ''}`}
                    onClick={() => toggleNoteSelection(note._id)}
                  >
                    <div className="item-check">
                      {selectedNoteIds.includes(note._id) && <FiCheck size={10} />}
                    </div>
                    <span className="item-title">{note.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="chat-messages" ref={scrollRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`message-row ${msg.role}`}>
            <div className="message-avatar">
              {msg.role === 'user' ? <FiUser /> : <FiCpu />}
            </div>
            <div className="message-bubble">
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message-row assistant">
            <div className="message-avatar pulse">
              <FiCpu />
            </div>
            <div className="message-bubble loading">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="chat-input-area">
        <input
          type="text"
          placeholder="Ask a question about your notes..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="btn-primary icon" disabled={loading || !input.trim()}>
          <FiSend />
        </button>
      </form>
    </div>
  );
}

// Add missing icon imports for this file
import { FiMessageSquare, FiCheck } from 'react-icons/fi';
