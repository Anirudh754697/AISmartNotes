const mongoose = require('mongoose');

const stickyNoteSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    content: { type: String, default: '' },
    color: {
      type: String,
      default: 'yellow',
      enum: ['yellow', 'blue', 'green', 'pink', 'purple', 'orange'],
    },
    position: {
      x: { type: Number, default: 100 },
      y: { type: Number, default: 100 },
    },
    pinned: { type: Boolean, default: false },
    enhanced: { type: Boolean, default: false },
    enhancedContent: { type: String },
    width: { type: Number, default: 220 },
    height: { type: Number, default: 200 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StickyNote', stickyNoteSchema);
