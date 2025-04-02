const mongoose = require('mongoose');

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
  grade: {
    type: String,
    required: true
  },
  knowledgeAreas: [{
    topic: String,
    proficiency: {
      type: Number,
      default: 0
    },
    lastAssessment: Date
  }],
  completedLessons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource'
  }],
  assessmentHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Student', StudentSchema); 