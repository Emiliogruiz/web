const express = require('express');
const router = express.Router();
const Assessment = require('../models/Assessment');
const Question = require('../models/Question');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Generar evaluación
router.post('/generate', async (req, res) => {
  try {
    const { studentId, topics, difficulty } = req.body;
    
    // Solicitud a OpenAI para generar preguntas
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [
        {
          role: "system",
          content: "Eres un experto en educación que genera preguntas para evaluaciones académicas."
        },
        {
          role: "user",
          content: `Genera 5 preguntas de opción múltiple sobre ${topics.join(', ')} con dificultad ${difficulty}.`
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });
    
    const questionsData = JSON.parse(response.choices[0].message.content);
    
    // Crear preguntas en la base de datos
    const questions = [];
    for (const q of questionsData.questions) {
      const question = new Question({
        text: q.text,
        type: 'multiple_choice',
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        topic: q.topic,
        difficulty
      });
      
      await question.save();
      questions.push(question._id);
    }
    
    // Crear la evaluación
    const assessment = new Assessment({
      student: studentId,
      title: `Evaluación de ${topics.join(', ')}`,
      description: `Evaluación adaptativa de nivel ${difficulty}`,
      questions,
      topics,
      difficulty
    });
    
    await assessment.save();
    
    res.status(201).json({ 
      success: true, 
      assessment 
    });
  } catch (error) {
    console.error('Error generando evaluación:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error generando evaluación', 
      error: error.message 
    });
  }
});

// Obtener evaluación por ID
router.get('/:id', async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate('questions')
      .populate('student', 'name email');
    
    if (!assessment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Evaluación no encontrada' 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      assessment 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error obteniendo evaluación', 
      error: error.message 
    });
  }
});

// Enviar respuestas de evaluación
router.post('/:id/submit', async (req, res) => {
  try {
    const { responses } = req.body;
    const assessment = await Assessment.findById(req.params.id)
      .populate('questions');
    
    if (!assessment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Evaluación no encontrada' 
      });
    }
    
    // Calcular puntuación
    let correctCount = 0;
    const processedResponses = [];
    
    for (const response of responses) {
      const question = assessment.questions.find(q => 
        q._id.toString() === response.questionId
      );
      
      const isCorrect = question.correctAnswer === response.answer;
      if (isCorrect) correctCount++;
      
      processedResponses.push({
        questionId: response.questionId,
        answer: response.answer,
        isCorrect,
        timeSpent: response.timeSpent || 0
      });
    }
    
    const score = (correctCount / assessment.questions.length) * 100;
    
    // Actualizar la evaluación
    assessment.responses = processedResponses;
    assessment.score = score;
    assessment.completedAt = new Date();
    
    await assessment.save();
    
    res.status(200).json({ 
      success: true, 
      score,
      assessment 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error enviando respuestas', 
      error: error.message 
    });
  }
});

module.exports = router; 