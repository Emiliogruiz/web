const OpenAI = require('openai');
const Student = require('../models/Student');
const Assessment = require('../models/Assessment');
const Resource = require('../models/Resource');

// Inicializar cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

class AIAnalyticsService {
  /**
   * Analiza los resultados de una evaluación y actualiza el perfil del estudiante
   */
  async analyzeAssessmentResults(assessmentId) {
    try {
      const assessment = await Assessment.findById(assessmentId)
        .populate('questions')
        .populate('student');
      
      if (!assessment || !assessment.responses || !assessment.student) {
        throw new Error('Evaluación incompleta o estudiante no encontrado');
      }

      // Agrupar respuestas por tema
      const topicPerformance = {};
      
      assessment.questions.forEach((question, index) => {
        const response = assessment.responses.find(r => 
          r.questionId.toString() === question._id.toString()
        );
        
        if (!response) return;
        
        const topic = question.topic;
        if (!topicPerformance[topic]) {
          topicPerformance[topic] = {
            correct: 0,
            total: 0,
            timeSpent: 0
          };
        }
        
        topicPerformance[topic].total += 1;
        if (response.isCorrect) {
          topicPerformance[topic].correct += 1;
        }
        topicPerformance[topic].timeSpent += response.timeSpent || 0;
      });
      
      // Actualizar conocimientos del estudiante
      const student = assessment.student;
      
      for (const [topic, performance] of Object.entries(topicPerformance)) {
        const score = (performance.correct / performance.total) * 100;
        const avgTime = performance.timeSpent / performance.total;
        
        // Buscar si ya existe el área de conocimiento
        const knowledgeAreaIndex = student.knowledgeAreas.findIndex(
          area => area.topic === topic
        );
        
        if (knowledgeAreaIndex >= 0) {
          // Actualizar área existente con nueva proficiencia
          // La proficiencia se actualiza con una ponderación: 70% histórico + 30% nueva evaluación
          const currentProficiency = student.knowledgeAreas[knowledgeAreaIndex].proficiency;
          const newProficiency = (currentProficiency * 0.7) + (score * 0.3);
          
          student.knowledgeAreas[knowledgeAreaIndex].proficiency = newProficiency;
          student.knowledgeAreas[knowledgeAreaIndex].lastAssessment = new Date();
        } else {
          // Crear nueva área de conocimiento
          student.knowledgeAreas.push({
            topic,
            proficiency: score,
            lastAssessment: new Date()
          });
        }
      }
      
      // Añadir evaluación al historial
      if (!student.assessmentHistory.includes(assessment._id)) {
        student.assessmentHistory.push(assessment._id);
      }
      
      await student.save();
      
      // Generar feedback personalizado
      const feedback = await this.generatePersonalizedFeedback(assessment, topicPerformance);
      assessment.feedback = feedback;
      await assessment.save();
      
      return {
        studentId: student._id,
        assessmentId: assessment._id,
        topicPerformance,
        overallScore: assessment.score,
        feedback
      };
    } catch (error) {
      console.error('Error analizando resultados:', error);
      throw error;
    }
  }
  
  /**
   * Genera feedback personalizado basado en los resultados
   */
  async generatePersonalizedFeedback(assessment, topicPerformance) {
    try {
      const strengthTopics = [];
      const weaknessTopics = [];
      
      for (const [topic, performance] of Object.entries(topicPerformance)) {
        const score = (performance.correct / performance.total) * 100;
        if (score >= 70) {
          strengthTopics.push(topic);
        } else {
          weaknessTopics.push(topic);
        }
      }
      
      const prompt = `
        El estudiante ha realizado una evaluación con un puntaje general de ${assessment.score.toFixed(1)}%.
        
        Fortalezas: ${strengthTopics.join(', ') || 'Ninguna identificada'}
        Áreas de mejora: ${weaknessTopics.join(', ') || 'Ninguna identificada'}
        
        Por favor, genera una retroalimentación personalizada, motivadora y constructiva que:
        1. Felicite al estudiante por sus fortalezas
        2. Ofrezca consejos específicos para mejorar en las áreas débiles
        3. Proporcione estrategias generales de estudio
        4. Sea positiva y motivadora
      `;
      
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-1106",
        messages: [
          {
            role: "system",
            content: "Eres un tutor educativo experto que proporciona retroalimentación personalizada y motivadora."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 600,
        response_format: { type: "text" }
      });
      
      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error generando feedback:', error);
      return "No se pudo generar retroalimentación personalizada. Revisa tus resultados para identificar áreas de mejora.";
    }
  }
  
  /**
   * Detecta áreas para reforzar basado en el perfil del estudiante
   */
  async identifyAreasToReinforce(studentId) {
    try {
      const student = await Student.findById(studentId);
      if (!student) throw new Error('Estudiante no encontrado');
      
      // Identificar áreas con baja proficiencia (<70%)
      const weakAreas = student.knowledgeAreas
        .filter(area => area.proficiency < 70)
        .sort((a, b) => a.proficiency - b.proficiency); // Ordenar de menor a mayor proficiencia
      
      return weakAreas;
    } catch (error) {
      console.error('Error identificando áreas a reforzar:', error);
      throw error;
    }
  }
}

module.exports = new AIAnalyticsService(); 