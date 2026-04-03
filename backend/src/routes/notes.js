const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Note = require('../models/Note');
const verifyToken = require('../middleware/auth');
const aiRateLimit = require('../middleware/rateLimit');
const gemini = require('../services/gemini');
const { extractTextFromPDF, imageToBase64, getMimeType } = require('../services/textExtract');

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|pdf/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext || mime) cb(null, true);
    else cb(new Error('Only images and PDFs are allowed'));
  },
});

// GET /api/notes — get all notes for user
router.get('/', verifyToken, async (req, res) => {
  try {
    const { search } = req.query;
    let query = { userId: req.user.uid };

    if (search) {
      query.$text = { $search: search };
    }

    const notes = await Note.find(query).sort({ createdAt: -1 }).lean();
    res.json({ notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/notes/:id — get single note
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.uid });
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json({ note });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notes/text — upload text note
router.post('/text', verifyToken, aiRateLimit, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });

    const aiResult = await gemini.processTextContent(content);

    const note = await Note.create({
      userId: req.user.uid,
      title: title || 'Text Note',
      type: 'text',
      originalContent: content,
      summary: aiResult.summary,
      keyPoints: aiResult.keyPoints,
      flashcards: aiResult.flashcards,
      quizQuestions: aiResult.quizQuestions,
      aiProcessed: true,
      aiProcessedAt: new Date(),
    });

    res.status(201).json({ note, aiUsage: req.aiUsage });
  } catch (err) {
    console.error('Text note error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notes/upload — upload PDF or image
router.post('/upload', verifyToken, aiRateLimit, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'File is required' });

    const { title } = req.body;
    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const ext = path.extname(fileName).toLowerCase();

    let content = '';
    let type = 'text';
    let aiResult;

    if (ext === '.pdf') {
      type = 'pdf';
      content = await extractTextFromPDF(filePath);
      aiResult = await gemini.processTextContent(content);
    } else {
      // Image
      type = 'image';
      const base64Data = imageToBase64(filePath);
      const mimeType = getMimeType(fileName);
      aiResult = await gemini.processImageContent(base64Data, mimeType);
      // Store base64 summary as content for image notes
      content = aiResult.summary;
    }

    const note = await Note.create({
      userId: req.user.uid,
      title: title || fileName,
      type,
      originalContent: content,
      fileName,
      summary: aiResult.summary,
      keyPoints: aiResult.keyPoints,
      flashcards: aiResult.flashcards,
      quizQuestions: aiResult.quizQuestions,
      aiProcessed: true,
      aiProcessedAt: new Date(),
    });

    // Clean up uploaded file
    fs.unlink(filePath, () => {});

    res.status(201).json({ note, aiUsage: req.aiUsage });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/notes/:id
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.uid });
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
