const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ['lesson', 'video', 'document', 'exercise', 'link'],
    required: true
  },
  subject: {
    type: String,
    enum: ['historia', 'geografia', 'general'],
    required: true
  },
  topics: [String],
  content: String, // HTML contenido o descripción extendida
  url: String, // Para recursos externos
  difficulty: {
    type: String,
    enum: ['basic', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  duration: Number, // En minutos
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Resource', ResourceSchema); 