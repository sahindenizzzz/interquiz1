const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  answerOptions: [{
    answerText: { type: String, required: true },
    isCorrect: { type: Boolean, required: true }
  }],
  category: { type: String, required: true },
  difficulty: { type: String, required: true }
});

module.exports = mongoose.model('Question', questionSchema, 'questions');
