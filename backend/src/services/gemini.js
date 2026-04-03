const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getModel = () => genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

/**
 * Parse Gemini JSON output, handling markdown code fences
 */
function parseGeminiJson(text) {
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}

/**
 * Process text/PDF content: return summary, keyPoints, flashcards, quizQuestions
 */
async function processTextContent(content) {
  const model = getModel();
  const prompt = `Analyze the following study content and return a JSON response with exactly this structure:
{
  "summary": "A comprehensive 3-5 sentence summary",
  "keyPoints": ["point 1", "point 2", "point 3", "point 4", "point 5"],
  "flashcards": [
    {"question": "Question 1?", "answer": "Answer 1"},
    {"question": "Question 2?", "answer": "Answer 2"},
    {"question": "Question 3?", "answer": "Answer 3"}
  ],
  "quizQuestions": [
    {
      "question": "Quiz question 1?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option A"
    },
    {
      "question": "Quiz question 2?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option B"
    }
  ]
}

Return ONLY valid JSON, no extra text.

Content to analyze:
${content.substring(0, 12000)}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseGeminiJson(text);
}

/**
 * Process image content (base64)
 */
async function processImageContent(base64Data, mimeType = 'image/jpeg') {
  const model = getModel();
  const prompt = `Analyze this image and provide a structured response as JSON with exactly this format:
{
  "summary": "Comprehensive summary of what this image contains",
  "keyPoints": ["key concept 1", "key concept 2", "key concept 3", "key concept 4", "key concept 5"],
  "flashcards": [
    {"question": "Question about the image?", "answer": "Answer"},
    {"question": "Another question?", "answer": "Answer"}
  ],
  "quizQuestions": [
    {
      "question": "Question based on image content?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Correct option"
    }
  ]
}

Return ONLY valid JSON.`;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    },
  ]);

  const text = result.response.text();
  return parseGeminiJson(text);
}

/**
 * Enhance a sticky note (expand short note into detailed study notes)
 */
async function enhanceStickyNote(content) {
  const model = getModel();
  const prompt = `Convert this short note into detailed, well-structured study notes with explanations. 
Add context, examples, and elaborations. Keep it organized with clear sections.
Format your response as plain text with clear structure (not JSON).

Short note: "${content}"`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * Combine multiple sticky notes into a structured summary
 */
async function combineStickyNotes(notes) {
  const model = getModel();
  const combined = notes.map((n, i) => `Note ${i + 1}: ${n}`).join('\n\n');
  const prompt = `Combine and synthesize these sticky notes into a comprehensive, structured study summary. 
Identify themes, connections, and create a coherent narrative.
Use clear headings and bullet points.

Notes to combine:
${combined}`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * Chat with notes context
 */
async function chatWithNotes(question, notesContext) {
  const model = getModel();
  const context = notesContext.substring(0, 15000);
  const prompt = `You are a helpful study assistant. Answer the user's question based on the provided notes context.
Be specific, cite relevant information from the notes, and be educational in your response.

Notes Context:
${context}

User Question: ${question}

Provide a clear, helpful answer:`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

module.exports = {
  processTextContent,
  processImageContent,
  enhanceStickyNote,
  combineStickyNotes,
  chatWithNotes,
};
