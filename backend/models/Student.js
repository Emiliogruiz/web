const mongoose = require('mongoose');

const KnowledgeAreaSchema = new mongoose.Schema({
  area: {
    type: String,
    required: true,
    enum: ['Historia', 'Geografía']
  },
  level: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  strengths: [String],
  weaknesses: [String],
  lastAssessment: {
    type: Date,
    default: Date.now
  }
});

const CompletedLessonSchema = new mongoose.Schema({
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource'
  },
  title: String,
  completedAt: {
    type: Date,
    default: Date.now
  },
  score: {
    type: Number,
    min: 0,
    max: 100
  }
});

const CompletedAssessmentSchema = new mongoose.Schema({
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment'
  },
  title: String,
  subject: {
    type: String,
    enum: ['historia', 'geografia']
  },
  topics: [String],
  completedAt: {
    type: Date,
    default: Date.now
  },
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  correctAnswers: Number,
  totalQuestions: Number,
  strengths: [String],
  weaknesses: [String]
});

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    select: false
  },
  program: String,
  knowledgeAreas: [KnowledgeAreaSchema],
  completedLessons: [CompletedLessonSchema],
  completedAssessments: [CompletedAssessmentSchema],
  points: {
    type: Number,
    default: 0
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema); 