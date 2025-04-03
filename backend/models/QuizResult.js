const mongoose = require('mongoose');

const QuizResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  maxScore: {
    type: Number,
    required: true
  },
  answers: [
    {
      question: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      userAnswer: {
        type: String
      },
      isCorrect: {
        type: Boolean
      },
      feedback: {
        type: String
      },
      score: {
        type: Number
      }
    }
  ],
  completedAt: {
    type: Date,
    default: Date.now
  },
  strengths: [String],
  weaknesses: [String],
  recommendations: [
    {
      title: String,
      description: String,
      resourceUrl: String,
      type: String
    }
  ]
});

const QuizResult = mongoose.model('QuizResult', QuizResultSchema);
module.exports = QuizResult; 