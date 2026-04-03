import { useEffect, useRef, useState } from 'react';
import { useNotes } from '../../context/NotesContext';
import { createStickyNote } from '../../services/api';
import StickyNoteComponent from './StickyNote';
import StickyToolbar from './StickyToolbar';
import { FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function StickyBoard() {
  const { stickyNotes, addStickyNote, fetchStickyNotes } = useNotes();
  const boardRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStickyNotes();
  }, []);

  const handleAddNote = async (color = 'yellow') => {
    const board = boardRef.current;
    const rect = board ? board.getBoundingClientRect() : { width: 600, height: 500 };
    const x = Math.random() * (rect.width - 240) + 20;
    const y = Math.random() * (rect.height - 220) + 20;

    setLoading(true);
    try {
      const res = await createStickyNote({ color, position: { x, y } });
      addStickyNote(res.data.note);
    } catch {
      toast.error('Failed to create sticky note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sticky-board-wrapper">
      <div className="sticky-board-header">
        <h2 className="sticky-board-title">📌 Sticky Board</h2>
        <StickyToolbar onAdd={handleAddNote} loading={loading} />
      </div>

      <div className="sticky-board" ref={boardRef}>
        {stickyNotes.length === 0 && (
          <div className="board-empty">
            <p>No sticky notes yet</p>
            <button className="btn-primary sm" onClick={() => handleAddNote()}>
              <FiPlus /> Add Note
            </button>
          </div>
        )}
        {stickyNotes.map((note) => (
          <StickyNoteComponent key={note._id} note={note} boardRef={boardRef} />
        ))}
      </div>
    </div>
  );
}
