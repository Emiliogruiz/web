const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const aiAnalyticsService = require('../services/aiAnalyticsService');
const recommendationEngine = require('../services/recommendationEngine');

// Obtener todos los estudiantes
router.get('/', async (req, res) => {
  try {
    const students = await Student.find();
    
    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Obtener un estudiante por ID
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('assessmentHistory')
      .populate('completedLessons');
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Estudiante no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Crear un nuevo estudiante
router.post('/', async (req, res) => {
  try {
    const student = await Student.create(req.body);
    
    res.status(201).json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Obtener recomendaciones para un estudiante
router.get('/:id/recommendations', async (req, res) => {
  try {
    const studentId = req.params.id;
    
    // Verificar que el estudiante existe
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Estudiante no encontrado'
      });
    }
    
    // Generar recomendaciones personalizadas
    const recommendations = await recommendationEngine.generateRecommendations(studentId);
    
    res.status(200).json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Análisis de perfil de estudiante
router.get('/:id/analysis', async (req, res) => {
  try {
    const studentId = req.params.id;
    
    // Verificar que el estudiante existe
    const student = await Student.findById(studentId)
      .populate('assessmentHistory');
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Estudiante no encontrado'
      });
    }
    
    // Si no hay evaluaciones, no se puede hacer análisis
    if (student.assessmentHistory.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'El estudiante no tiene evaluaciones para analizar'
      });
    }
    
    // Obtener la evaluación más reciente para análisis
    const latestAssessment = student.assessmentHistory
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    
    // Analizar resultados
    const analysis = await aiAnalyticsService.analyzeAssessmentResults(latestAssessment._id);
    
    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router; 