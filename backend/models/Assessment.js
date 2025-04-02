const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
  id: String,
  text: String
});

const QuestionSchema = new mongoose.Schema({
  id: String,
  text: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['multiple_choice', 'true_false', 'open_ended', 'matching', 'order'],
    required: true
  },
  options: [OptionSchema],
  matches: [OptionSchema], // Para preguntas de tipo matching
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed, // Puede ser String, Array, o Object según el tipo
    required: true
  },
  model_answer: String, // Para preguntas abiertas
  explanation: String,
  topic: String,
  difficulty: {
    type: String,
    enum: ['basic', 'intermediate', 'advanced']
  },
  points: {
    type: Number,
    default: 10
  }
});

const AssessmentSchema = new mongoose.Schema({
  subject: {
    type: String,
    enum: ['historia', 'geografia'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['basic', 'intermediate', 'advanced'],
    required: true
  },
  topics: [String],
  totalPoints: {
    type: Number,
    default: 100
  },
  questions: [QuestionSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 7 * 24 * 60 * 60 * 1000) // 7 días
  },
  createdFor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }
}, { timestamps: true });

module.exports = mongoose.model('Assessment', AssessmentSchema); 