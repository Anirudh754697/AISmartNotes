const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const StickyNote = require('../models/StickyNote');
const verifyToken = require('../middleware/auth');
const aiRateLimit = require('../middleware/rateLimit');
const gemini = require('../services/gemini');

// POST /api/ai/enhance — enhance a single sticky note
router.post('/enhance', verifyToken, aiRateLimit, async (req, res) => {
  try {
    const { content, stickyNoteId } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });

    const enhanced = await gemini.enhanceStickyNote(content);

    // Optionally save back to the sticky note
    if (stickyNoteId) {
      await StickyNote.findOneAndUpdate(
        { _id: stickyNoteId, userId: req.user.uid },
        { enhanced: true, enhancedContent: enhanced }
      );
    }

    res.json({ enhanced, aiUsage: req.aiUsage });
  } catch (err) {
    console.error('Enhance error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/combine — combine multiple sticky notes
router.post('/combine', verifyToken, aiRateLimit, async (req, res) => {
  try {
    const { noteContents } = req.body;
    if (!noteContents || !Array.isArray(noteContents) || noteContents.length === 0) {
      return res.status(400).json({ error: 'noteContents array is required' });
    }

    const summary = await gemini.combineStickyNotes(noteContents);
    res.json({ summary, aiUsage: req.aiUsage });
  } catch (err) {
    console.error('Combine error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/chat — chat with notes context
router.post('/chat', verifyToken, aiRateLimit, async (req, res) => {
  try {
    const { question, noteIds } = req.body;
    if (!question) return res.status(400).json({ error: 'Question is required' });

    let notesContext = '';

    if (noteIds && noteIds.length > 0) {
      const notes = await Note.find({ _id: { $in: noteIds }, userId: req.user.uid });
      notesContext = notes
        .map((n) => `Title: ${n.title}\nContent: ${n.originalContent}\nSummary: ${n.summary || ''}`)
        .join('\n\n---\n\n');
    } else {
      // Use all recent notes as context
      const notes = await Note.find({ userId: req.user.uid }).sort({ createdAt: -1 }).limit(5);
      notesContext = notes
        .map((n) => `Title: ${n.title}\nContent: ${n.originalContent}\nSummary: ${n.summary || ''}`)
        .join('\n\n---\n\n');
    }

    if (!notesContext) {
      notesContext = 'No notes available. Answer based on general knowledge.';
    }

    const answer = await gemini.chatWithNotes(question, notesContext);
    res.json({ answer, aiUsage: req.aiUsage });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ai/usage — get current AI usage for user
router.get('/usage', verifyToken, async (req, res) => {
  try {
    const User = require('../models/User');
    const limit = parseInt(process.env.AI_DAILY_LIMIT) || 20;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let user = await User.findOne({ uid: req.user.uid });
    let used = 0;

    if (user && user.lastRequestDate && user.lastRequestDate >= today) {
      used = user.dailyAiRequests;
    }

    res.json({ used, limit, remaining: Math.max(0, limit - used) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
