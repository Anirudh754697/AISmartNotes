import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FlashcardView({ flashcards }) {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (!flashcards.length) return <p className="empty-tab">No flashcards generated.</p>;

  const card = flashcards[current];

  return (
    <div className="flashcard-container">
      <div className="flashcard-counter">
        {current + 1} / {flashcards.length}
      </div>

      {/* 3D Flip Card */}
      <div
        className={`flashcard ${flipped ? 'flipped' : ''}`}
        onClick={() => setFlipped(!flipped)}
      >
        <div className="flashcard-front">
          <span className="card-label">Question</span>
          <p>{card.question}</p>
          <span className="card-hint">Click to reveal answer</span>
        </div>
        <div className="flashcard-back">
          <span className="card-label">Answer</span>
          <p>{card.answer}</p>
        </div>
      </div>

      <div className="flashcard-nav">
        <button
          className="btn-ghost"
          onClick={() => { setCurrent((c) => Math.max(0, c - 1)); setFlipped(false); }}
          disabled={current === 0}
        >
          ← Prev
        </button>
        <button
          className="btn-ghost"
          onClick={() => { setCurrent((c) => Math.min(flashcards.length - 1, c + 1)); setFlipped(false); }}
          disabled={current === flashcards.length - 1}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
