const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true },
    email: { type: String },
    displayName: { type: String },
    dailyAiRequests: { type: Number, default: 0 },
    lastRequestDate: { type: Date },
    totalNotesCreated: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
