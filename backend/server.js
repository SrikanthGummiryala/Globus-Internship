const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai'); 
const mongoose = require('mongoose');
const cors = require('cors');



// MongoDB Model
const Question = mongoose.model('Question', {
  text: String,
  options: [String],
  correctOption: Number,
});

// App Initialization

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Multer Configuration for PDF Upload
const upload = multer({ dest: 'uploads/' });

// MongoDB Connection
mongoose
  .connect('http://localhost:27017/quizApp')
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

// OpenAI Configuration
const openai = new OpenAI({
    apiKey: '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',
  });

// PDF Parsing Endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const pdfData = await pdfParse(req.file);
    const questions = pdfData.text
      .split('\n')
      .filter((line) => line.trim().length)
      .slice(0, 10); // Limit to 10 questions for simplicity

    res.json({ questions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to parse PDF' });
  }
});

// AI Question Generation
app.post('/generate', async (req, res) => {
  try {
    const { question } = req.body;

    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `Generate a similar question based on this: "${question}"`,
      max_tokens: 100,
    });

    res.json({ question: response.data.choices[0].text.trim() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate question' });
  }
});

// Save Questions to Database
app.post('/questions', async (req, res) => {
  try {
    const { text, options, correctOption } = req.body;

    const question = new Question({ text, options, correctOption });
    await question.save();

    res.json(question);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save question' });
  }
});

// Fetch Questions for Quiz
app.get('/questions', async (req, res) => {
  try {
    const questions = await Question.aggregate([{ $sample: { size: 10 } }]); // Randomize questions
    questions.forEach((question) => {
      question.options = question.options.sort(() => Math.random() - 0.5); // Shuffle options
    });
    res.json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Start the Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
