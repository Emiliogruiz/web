const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  program: {
    type: String,
    default: 'Historia y Geografía'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAssessments: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  knowledgeAreas: [
    {
      area: {
        type: String
      },
      level: {
        type: Number,
        default: 0
      },
      strengths: [String],
      weaknesses: [String]
    }
  ]
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);
module.exports = User; 