const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  questions: [
    {
      question: {
        type: String,
        required: true
      },
      options: [String],
      correctAnswer: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['multiple-choice', 'open-ended'],
        default: 'multiple-choice'
      },
      points: {
        type: Number,
        default: 10
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Quiz = mongoose.model('Quiz', QuizSchema);
module.exports = Quiz; 