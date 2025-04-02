const mongoose = require('mongoose');

const LearningStyleSchema = new mongoose.Schema({
  visual: { type: Number, default: 0 }, // 0-100 preference for visual learning
  auditory: { type: Number, default: 0 },
  kinesthetic: { type: Number, default: 0 },
  reading: { type: Number, default: 0 }
});

const TopicProgressSchema = new mongoose.Schema({
  name: String,
  currentLevel: { type: Number, default: 0 }, // 0-100
  attemptsCount: { type: Number, default: 0 },
  successRate: { type: Number, default: 0 },
  lastAttempt: Date,
  misconceptions: [String],
  strengths: [String],
  recommendedResources: [{
    resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource' },
    status: { type: String, enum: ['pending', 'started', 'completed'] },
    recommendedAt: Date
  }]
});

const StudentProfileSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  learningStyle: LearningStyleSchema,
  topicProgress: [TopicProgressSchema],
  interactionHistory: [{
    timestamp: { type: Date, default: Date.now },
    activityType: String,
    topic: String,
    performance: Number,
    timeSpent: Number,
    difficulty: String
  }],
  adaptiveSettings: {
    preferredDifficulty: { type: String, default: 'auto' },
    topicOrder: { type: String, default: 'adaptive' },
    pacePreference: { type: String, default: 'medium' }
  },
  analyticsData: {
    averageSessionDuration: Number,
    totalStudyTime: Number,
    completionRate: Number,
    engagementScore: Number,
    lastActive: Date
  }
}, { timestamps: true });

// Índices para optimizar consultas frecuentes
StudentProfileSchema.index({ studentId: 1 });
StudentProfileSchema.index({ 'topicProgress.name': 1 });
StudentProfileSchema.index({ 'interactionHistory.timestamp': -1 });

module.exports = mongoose.model('StudentProfile', StudentProfileSchema); 