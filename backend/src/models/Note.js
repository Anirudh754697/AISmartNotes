const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, default: 'Untitled Note' },
    type: { type: String, enum: ['text', 'pdf', 'image'], default: 'text' },
    originalContent: { type: String, default: '' },
    fileUrl: { type: String },
    fileName: { type: String },

    // AI Results
    summary: { type: String },
    keyPoints: [{ type: String }],
    flashcards: [
      {
        question: String,
        answer: String,
      },
    ],
    quizQuestions: [
      {
        question: String,
        options: [String],
        answer: String,
      },
    ],
    aiProcessed: { type: Boolean, default: false },
    aiProcessedAt: { type: Date },
  },
  { timestamps: true }
);

noteSchema.index({ userId: 1, createdAt: -1 });
noteSchema.index({ '$**': 'text' }); // full-text search

module.exports = mongoose.model('Note', noteSchema);
