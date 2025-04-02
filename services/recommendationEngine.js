const Student = require('../models/Student');
const Lesson = require('../models/Lesson');
const Resource = require('../models/Resource');
const OpenAI = require('openai');
const axios = require('axios');
const aiAnalyticsService = require('./aiAnalyticsService');

// Initialize OpenAI client with proper configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID, // Optional: Add organization ID if needed
  dangerouslyAllowBrowser: false // Ensure this is false for server-side usage
});

class RecommendationEngine {
  /**
   * Genera recomendaciones personalizadas basadas en el perfil del estudiante
   */
  async generateRecommendations(studentId) {
    try {
      const student = await Student.findById(studentId)
        .populate('assessmentHistory');
      
      if (!student) throw new Error('Estudiante no encontrado');
      
      // Identificar áreas a reforzar
      const areasToReinforce = await aiAnalyticsService.identifyAreasToReinforce(studentId);
      
      if (areasToReinforce.length === 0) {
        return {
          message: "¡Excelente! Tienes un buen nivel en todas las áreas evaluadas.",
          recommendations: []
        };
      }
      
      // Limitar a las 3 áreas más débiles para enfocar el aprendizaje
      const priorityAreas = areasToReinforce.slice(0, 3);
      
      // Buscar recursos para estas áreas
      const recommendedResources = await this.findResourcesForTopics(
        priorityAreas.map(area => area.topic)
      );
      
      // Generar recomendaciones de estudio personalizadas
      const personalizedStrategy = await this.generateStudyStrategy(student, priorityAreas);
      
      return {
        weakAreas: priorityAreas,
        recommendedResources,
        studyStrategy: personalizedStrategy
      };
    } catch (error) {
      console.error('Error generando recomendaciones:', error);
      throw error;
    }
  }
  
  /**
   * Busca recursos educativos para temas específicos
   */
  async findResourcesForTopics(topics) {
    try {
      // Buscar recursos para cada tema, con límite de 2 por tema
      const resources = [];
      
      for (const topic of topics) {
        const topicResources = await Resource.find({ 
          topics: { $in: [topic] } 
        }).limit(2);
        
        resources.push(...topicResources);
      }
      
      // Si no hay suficientes recursos en la base de datos, generar sugerencias
      if (resources.length < topics.length) {
        const additionalSuggestions = await this.generateResourceSuggestions(topics);
        return [...resources, ...additionalSuggestions];
      }
      
      return resources;
    } catch (error) {
      console.error('Error buscando recursos:', error);
      return [];
    }
  }
  
  /**
   * Genera sugerencias de recursos usando IA cuando no hay suficientes en la base de datos
   */
  async generateResourceSuggestions(topics) {
    try {
      const prompt = `
        Genera sugerencias de recursos educativos para los siguientes temas:
        ${topics.join(', ')}
        
        Para cada tema, sugiere un recurso en formato JSON con:
        - título
        - descripción breve
        - tipo (artículo, video, ejercicio)
        - una URL ficticia (ejemplo.com)
      `;
      
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-1106",
        messages: [
          {
            role: "system",
            content: "Eres un experto educativo que sugiere recursos de aprendizaje de alta calidad."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      });
      
      const suggestions = JSON.parse(completion.choices[0].message.content);
      
      // Transformar sugerencias al formato de nuestro modelo Resource
      return suggestions.resources.map(suggestion => ({
        title: suggestion.título,
        description: suggestion.descripción,
        type: suggestion.tipo,
        url: suggestion.url,
        topics: [suggestion.tema],
        difficulty: 'intermediate',
        estimatedTime: 30,
        isAIGenerated: true
      }));
    } catch (error) {
      console.error('Error generando sugerencias de recursos:', error);
      return [];
    }
  }
  
  /**
   * Genera una estrategia de estudio personalizada para el estudiante
   */
  async generateStudyStrategy(student, weakAreas) {
    try {
      // Extraer datos relevantes del estudiante para personalizar la estrategia
      const studentData = {
        knowledgeAreas: student.knowledgeAreas,
        completedLessons: student.completedLessons.length,
        assessmentCount: student.assessmentHistory.length,
        weakAreas: weakAreas.map(area => ({
          topic: area.topic,
          proficiency: area.proficiency
        }))
      };
      
      const prompt = `
        Genera una estrategia de estudio personalizada para un estudiante con el siguiente perfil:
        ${JSON.stringify(studentData, null, 2)}
        
        La estrategia debe incluir:
        1. Un plan de estudio de 1 semana
        2. Técnicas de estudio recomendadas
        3. Consejos para mejorar en las áreas débiles
        4. Un calendario sugerido con tiempos de estudio
      `;
      
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-1106",
        messages: [
          {
            role: "system",
            content: "Eres un experto en estrategias de aprendizaje que crea planes de estudio personalizados."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800,
        response_format: { type: "text" }
      });
      
      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error generando estrategia de estudio:', error);
      return "No se pudo generar una estrategia personalizada. Te recomendamos estudiar los temas identificados como áreas de mejora.";
    }
  }
}

module.exports = new RecommendationEngine(); 