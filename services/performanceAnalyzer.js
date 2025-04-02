const Student = require('../models/Student');
const Assessment = require('../models/Assessment');
const OpenAI = require('openai');
const aiAnalyticsService = require('./aiAnalyticsService');

// Initialize OpenAI client with proper configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID, // Optional: Add organization ID if needed
  dangerouslyAllowBrowser: false // Ensure this is false for server-side usage
});

/**
 * Analiza el desempeño de un estudiante en una evaluación específica
 */
exports.analyzeAssessmentPerformance = async (studentId, assessmentId) => {
  try {
    // Obtener datos del estudiante y la evaluación
    const student = await Student.findById(studentId);
    const assessment = await Assessment.findById(assessmentId).populate('questions');
    
    if (!student || !assessment) {
      throw new Error('Estudiante o evaluación no encontrados');
    }
    
    // Obtener las respuestas del estudiante
    const studentResponses = assessment.responses || [];
    
    // Analizar respuestas por tema
    const topicAnalysis = {};
    const strengthTopics = [];
    const weaknessTopics = [];
    
    assessment.questions.forEach((question, index) => {
      const topic = question.topic;
      const studentResponse = studentResponses[index] || {};
      const isCorrect = studentResponse.answer === question.correctAnswer;
      
      // Inicializar análisis del tema si no existe
      if (!topicAnalysis[topic]) {
        topicAnalysis[topic] = {
          total: 0,
          correct: 0,
          incorrect: 0,
          score: 0
        };
      }
      
      // Actualizar contadores
      topicAnalysis[topic].total += 1;
      if (isCorrect) {
        topicAnalysis[topic].correct += 1;
      } else {
        topicAnalysis[topic].incorrect += 1;
      }
    });
    
    // Calcular puntuaciones por tema
    for (const topic in topicAnalysis) {
      const analysis = topicAnalysis[topic];
      analysis.score = (analysis.correct / analysis.total) * 100;
      
      // Clasificar como fortaleza o debilidad
      if (analysis.score >= 70) {
        strengthTopics.push(topic);
      } else {
        weaknessTopics.push(topic);
      }
    }
    
    // Calcular puntuación general con ponderación por dificultad
    let weightedScore = 0;
    let totalWeight = 0;
    
    studentResponses.forEach((response, index) => {
      const question = assessment.questions[index];
      if (question) {
        const weight = getQuestionWeight(question.difficulty);
        totalWeight += weight;
        if (response.answer === question.correctAnswer) {
          weightedScore += weight;
        }
      }
    });
    
    const overallScore = (weightedScore / totalWeight) * 100;
    
    // Análisis de tiempo de respuesta y patrones
    const responseAnalysis = analyzeResponsePatterns(studentResponses, assessment.questions);
    
    // Análisis de tiempo de respuesta
    const averageResponseTime = calculateAverageResponseTime(studentResponses);
    
    // Generar feedback personalizado usando IA
    const feedback = await generatePersonalizedFeedback(
      student.name,
      assessment.subject,
      topicAnalysis,
      strengthTopics,
      weaknessTopics,
      overallScore
    );
    
    // Actualizar el perfil del estudiante con los resultados
    await updateStudentProfile(student, assessment.subject, strengthTopics, weaknessTopics, overallScore);
    
    // Actualizar perfil de análisis AI
    await aiAnalyticsService.analyzeStudentProfile(studentId);
    
    return {
      studentId,
      assessmentId,
      overallScore,
      weightedScore: (weightedScore / totalWeight) * 100,
      topicAnalysis,
      strengthTopics,
      weaknessTopics,
      averageResponseTime,
      responsePatterns: responseAnalysis,
      feedback,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Error analizando desempeño:', error);
    throw error;
  }
};

/**
 * Obtiene el peso de una pregunta según su dificultad
 */
function getQuestionWeight(difficulty) {
  switch (difficulty.toLowerCase()) {
    case 'basic': return 1;
    case 'intermediate': return 1.5;
    case 'advanced': return 2;
    default: return 1;
  }
}

/**
 * Analiza patrones en las respuestas del estudiante
 */
function analyzeResponsePatterns(responses, questions) {
  const patterns = {
    quickAnswers: 0,
    slowAnswers: 0,
    consistentErrors: {},
    improvementAreas: new Set()
  };

  responses.forEach((response, index) => {
    const question = questions[index];
    if (!question) return;

    // Analizar tiempo de respuesta
    if (response.timeSpent < 15) patterns.quickAnswers++;
    if (response.timeSpent > 120) patterns.slowAnswers++;

    // Analizar errores consistentes
    if (response.answer !== question.correctAnswer) {
      if (!patterns.consistentErrors[question.topic]) {
        patterns.consistentErrors[question.topic] = 1;
      } else {
        patterns.consistentErrors[question.topic]++;
      }

      if (patterns.consistentErrors[question.topic] >= 2) {
        patterns.improvementAreas.add(question.topic);
      }
    }
  });

  return {
    ...patterns,
    improvementAreas: Array.from(patterns.improvementAreas)
  };
}

/**
 * Genera retroalimentación personalizada usando GPT
 */
async function generatePersonalizedFeedback(studentName, subject, topicAnalysis, strengths, weaknesses, overallScore) {
  try {
    // Crear un resumen de desempeño para el prompt
    let performanceSummary = `Estudiante: ${studentName}\n`;
    performanceSummary += `Materia: ${subject}\n`;
    performanceSummary += `Puntuación general: ${overallScore.toFixed(1)}%\n\n`;
    performanceSummary += `Fortalezas: ${strengths.join(', ')}\n`;
    performanceSummary += `Áreas de mejora: ${weaknesses.join(', ')}\n\n`;
    performanceSummary += "Desempeño por tema:\n";
    
    for (const topic in topicAnalysis) {
      const analysis = topicAnalysis[topic];
      performanceSummary += `- ${topic}: ${analysis.score.toFixed(1)}% (${analysis.correct}/${analysis.total} correctas)\n`;
    }
    
    const prompt = `Como profesor experto en ${subject}, proporciona retroalimentación educativa constructiva y motivadora basada en este desempeño:\n\n${performanceSummary}\n\nInluye: 1) Un análisis breve del desempeño, 2) Recomendaciones específicas para mejorar en las áreas débiles, y 3) Sugerencias de estrategias de estudio.`;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106", // Using the latest stable version
      messages: [
        {
          role: "system",
          content: "Eres un profesor experto que proporciona retroalimentación educativa personalizada, constructiva y motivadora."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 600,
      response_format: { type: "text" }, // Ensure text response format
      presence_penalty: 0.6, // Add presence penalty to encourage diverse responses
      frequency_penalty: 0.5 // Add frequency penalty to reduce repetition
    });
    
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generando feedback personalizado:', error);
    // Add better error handling with specific error types
    if (error.response) {
      console.error('OpenAI API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Request Error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return "No se pudo generar retroalimentación personalizada. Por favor, revisa tu desempeño en cada tema y enfócate en las áreas que necesitan mejora.";
  }
}

/**
 * Actualiza el perfil del estudiante con los resultados del análisis
 */
async function updateStudentProfile(student, subject, strengths, weaknesses, score) {
  // Buscar si ya existe el área de conocimiento
  let knowledgeArea = student.knowledgeAreas.find(area => 
    area.area.toLowerCase() === subject.toLowerCase()
  );
  
  if (!knowledgeArea) {
    // Crear nueva área si no existe
    knowledgeArea = {
      area: subject,
      level: 0,
      strengths: [],
      weaknesses: [],
      lastAssessment: new Date()
    };
    student.knowledgeAreas.push(knowledgeArea);
  } else {
    // Actualizar área existente
    knowledgeArea.lastAssessment = new Date();
  }
  
  // Actualizar nivel (con ponderación para que no cambie drásticamente)
  const currentLevel = knowledgeArea.level;
  knowledgeArea.level = Math.round(currentLevel * 0.7 + score * 0.3);
  
  // Actualizar fortalezas y debilidades
  knowledgeArea.strengths = [...new Set([...knowledgeArea.strengths, ...strengths])];
  knowledgeArea.weaknesses = [...new Set([...weaknesses])]; // Reemplazar debilidades, no acumular
  
  await student.save();
}

// Funciones auxiliares omitidas por brevedad 