const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Obtener todos los recursos
router.get('/', async (req, res) => {
  try {
    const { topic, type, difficulty } = req.query;
    const filter = {};
    
    if (topic) filter.topics = { $in: [topic] };
    if (type) filter.type = type;
    if (difficulty) filter.difficulty = difficulty;
    
    const resources = await Resource.find(filter);
    
    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Obtener un recurso por ID
router.get('/:id', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        error: 'Recurso no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: resource
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Crear un nuevo recurso
router.post('/', async (req, res) => {
  try {
    const resource = await Resource.create(req.body);
    
    res.status(201).json({
      success: true,
      data: resource
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Generar contenido educativo usando IA
router.post('/generate', async (req, res) => {
  try {
    const { topic, type, difficulty } = req.body;
    
    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere un tema para generar contenido'
      });
    }
    
    let prompt = `Genera un contenido educativo sobre ${topic}`;
    let contentType = type || 'article';
    
    if (difficulty) {
      prompt += ` con nivel de dificultad ${difficulty}`;
    }
    
    if (contentType === 'article') {
      prompt += `. El artículo debe tener: introducción, desarrollo, ejemplos y conclusión.`;
    } else if (contentType === 'exercise') {
      prompt += `. Crea 5 ejercicios prácticos con sus respuestas.`;
    }
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [
        {
          role: "system",
          content: "Eres un experto en educación que crea contenido didáctico de alta calidad."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });
    
    const content = completion.choices[0].message.content;
    
    // Sugerir título usando IA
    const titleCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [
        {
          role: "system",
          content: "Genera un título educativo conciso y atractivo."
        },
        {
          role: "user",
          content: `Crea un título para un ${contentType} sobre ${topic}.`
        }
      ],
      temperature: 0.7,
      max_tokens: 50
    });
    
    const title = titleCompletion.choices[0].message.content.replace(/^"(.+)"$/, '$1');
    
    // Crear el recurso en la base de datos
    const resource = await Resource.create({
      title,
      description: `Contenido generado por IA sobre ${topic}`,
      type: contentType,
      content,
      topics: [topic],
      difficulty: difficulty || 'intermediate',
      estimatedTime: 30
    });
    
    res.status(201).json({
      success: true,
      data: resource
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router; 