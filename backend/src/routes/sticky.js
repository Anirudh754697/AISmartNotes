const express = require('express');
const router = express.Router();
const StickyNote = require('../models/StickyNote');
const verifyToken = require('../middleware/auth');

// GET /api/sticky — get all sticky notes for user
router.get('/', verifyToken, async (req, res) => {
  try {
    const notes = await StickyNote.find({ userId: req.user.uid }).sort({ pinned: -1, createdAt: -1 });
    res.json({ notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/sticky — create sticky note
router.post('/', verifyToken, async (req, res) => {
  try {
    const { content, color, position, pinned } = req.body;
    console.log(`[Sticky] Creating note for user ${req.user.uid}`);
    const note = await StickyNote.create({
      userId: req.user.uid,
      content: content || '',
      color: color || 'yellow',
      position: position || { x: 100, y: 100 },
      pinned: pinned || false,
    });
    res.status(201).json({ note });
  } catch (err) {
    console.error('[Sticky] Create error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/sticky/:id — update sticky note
router.patch('/:id', verifyToken, async (req, res) => {
  try {
    const { content, color, position, pinned, enhanced, enhancedContent } = req.body;
    const updates = {};
    if (content !== undefined) updates.content = content;
    if (color !== undefined) updates.color = color;
    if (position !== undefined) updates.position = position;
    if (pinned !== undefined) updates.pinned = pinned;
    if (enhanced !== undefined) updates.enhanced = enhanced;
    if (enhancedContent !== undefined) updates.enhancedContent = enhancedContent;

    const note = await StickyNote.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.uid },
      updates,
      { new: true }
    );
    if (!note) return res.status(404).json({ error: 'Sticky note not found' });
    res.json({ note });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/sticky/:id
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const note = await StickyNote.findOneAndDelete({ _id: req.params.id, userId: req.user.uid });
    if (!note) return res.status(404).json({ error: 'Sticky note not found' });
    res.json({ message: 'Sticky note deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
