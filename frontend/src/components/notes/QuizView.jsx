import { useState } from 'react';

export default function QuizView({ questions }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  if (!questions.length) return <p className="empty-tab">No quiz questions generated.</p>;

  const handleSelect = (qIdx, option) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIdx]: option }));
  };

  const score = questions.filter((q, i) => answers[i] === q.answer).length;

  return (
    <div className="quiz-container">
      {questions.map((q, qIdx) => (
        <div key={qIdx} className="quiz-question">
          <p className="question-text">
            <span className="question-num">Q{qIdx + 1}.</span> {q.question}
          </p>
          <div className="quiz-options">
            {(q.options || []).map((opt, oIdx) => {
              const selected = answers[qIdx] === opt;
              const correct = submitted && opt === q.answer;
              const wrong = submitted && selected && opt !== q.answer;
              return (
                <button
                  key={oIdx}
                  className={`quiz-option ${selected ? 'selected' : ''} ${correct ? 'correct' : ''} ${wrong ? 'wrong' : ''}`}
                  onClick={() => handleSelect(qIdx, opt)}
                >
                  <span className="opt-letter">{String.fromCharCode(65 + oIdx)}</span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="quiz-footer">
        {!submitted ? (
          <button
            className="btn-primary"
            onClick={() => setSubmitted(true)}
            disabled={Object.keys(answers).length < questions.length}
          >
            Submit Quiz
          </button>
        ) : (
          <div className="quiz-result">
            <span className="score">{score}/{questions.length}</span>
            <span>{score === questions.length ? '🎉 Perfect!' : score >= questions.length / 2 ? '👍 Good job!' : '📚 Keep studying!'}</span>
            <button className="btn-ghost" onClick={() => { setAnswers({}); setSubmitted(false); }}>Retry</button>
          </div>
        )}
      </div>
    </div>
  );
}
