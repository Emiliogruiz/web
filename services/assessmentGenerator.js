const Student = require('../models/Student');
const Assessment = require('../models/Assessment');
const OpenAI = require('openai');
const Question = require('../models/Question');

// Initialize OpenAI client with proper configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID, // Optional: Add organization ID if needed
  dangerouslyAllowBrowser: false // Ensure this is false for server-side usage
});

// Topics - basados en el plan de estudios
const historyTopics = [
  'Civilizaciones Mesoamericanas', 'Conquista de América',
  'Período Colonial', 'Independencia de América Latina',
  'Revolución Industrial', 'Guerras Mundiales',
  'Guerra Fría', 'Historia Contemporánea'
];

const geographyTopics = [
  'Geografía Física de América', 'Geografía Política de América',
  'Hidrografía', 'Orografía', 'Demografía',
  'Recursos Naturales', 'Geografía Económica', 'Cambio Climático'
];

/**
 * Genera una evaluación adaptativa basada en el perfil del estudiante
 */
exports.generateAdaptiveAssessment = async (studentId, subject, difficulty = 'auto') => {
  try {
    // Obtener perfil del estudiante
    const student = await Student.findById(studentId);
    if (!student) throw new Error('Estudiante no encontrado');
    
    // Determinar áreas a evaluar basado en las debilidades o plan de estudios
    let topicsToEvaluate = [];
    let actualDifficulty = difficulty;
    
    if (difficulty === 'auto') {
      // Analizar el historial del estudiante para determinar la dificultad adecuada
      const knowledgeArea = student.knowledgeAreas.find(area => 
        area.area.toLowerCase() === subject.toLowerCase()
      );
      
      if (knowledgeArea) {
        actualDifficulty = calculateDifficulty(knowledgeArea.level);
        // Priorizar debilidades detectadas
        topicsToEvaluate = knowledgeArea.weaknesses;
      }
    }
    
    // Si no hay temas específicos, usar el plan general
    if (topicsToEvaluate.length === 0) {
      topicsToEvaluate = subject.toLowerCase() === 'historia' ? 
        historyTopics : geographyTopics;
    }
    
    // Seleccionar aleatoriamente 3-5 temas para esta evaluación
    const selectedTopics = selectRandomTopics(topicsToEvaluate, 3);
    
    // Generar preguntas para cada tema usando IA
    const questions = await generateQuestionsForTopics(selectedTopics, actualDifficulty);
    
    // Crear la evaluación
    const assessment = {
      studentId,
      subject,
      difficulty: actualDifficulty,
      topics: selectedTopics,
      questions,
      generatedAt: new Date()
    };
    
    return assessment;
  } catch (error) {
    console.error('Error generando evaluación:', error);
    throw error;
  }
};

/**
 * Genera preguntas para los temas seleccionados usando IA
 */
async function generateQuestionsForTopics(topics, difficulty) {
  const questions = [];
  
  for (const topic of topics) {
    // Determinar cuántas preguntas generar por tema según dificultad
    const questionsPerTopic = difficulty === 'basic' ? 2 :
                             difficulty === 'intermediate' ? 3 : 4;
    
    // Generar preguntas de diferentes tipos
    const questionTypes = ['multiple_choice', 'true_false', 'short_answer'];
    
    for (let i = 0; i < questionsPerTopic; i++) {
      // Rotar entre tipos de preguntas
      const questionType = questionTypes[i % questionTypes.length];
      
      // Prompt para GPT para generar la pregunta
      const prompt = createPromptForQuestion(topic, questionType, difficulty);
      
      try {
        const completion = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [
            {role: "system", content: "Eres un profesor experto en historia y geografía que crea evaluaciones educativas de alta calidad."},
            {role: "user", content: prompt}
          ],
          temperature: 0.7,
          max_tokens: 500,
        });
        
        // Procesar la respuesta de GPT para extraer la pregunta formateada
        const questionData = JSON.parse(completion.data.choices[0].message.content);
        questions.push({
          topic,
          type: questionType,
          difficulty,
          ...questionData
        });
      } catch (error) {
        console.error(`Error generando pregunta para ${topic}:`, error);
        // Usar pregunta de respaldo para no bloquear la generación completa
        questions.push(getFallbackQuestion(topic, questionType, difficulty));
      }
    }
  }
  
  return questions;
}

/**
 * Crea el prompt para GPT para generar una pregunta específica
 */
function createPromptForQuestion(topic, type, difficulty) {
  let prompt = `Crea una pregunta de ${difficulty === 'basic' ? 'nivel básico' : 
                                        difficulty === 'intermediate' ? 'nivel intermedio' : 
                                        'nivel avanzado'} sobre "${topic}" en formato ${
                                          type === 'multiple_choice' ? 'opción múltiple con 4 opciones' : 
                                          type === 'true_false' ? 'verdadero/falso' : 
                                          'respuesta corta'
                                        }.`;
  
  prompt += ` La respuesta debe incluir una explicación educativa.`;
  prompt += ` Devuelve el resultado en formato JSON con las siguientes propiedades: 
              { "question": "texto de la pregunta", 
                "options": ["opción 1", "opción 2", ...] (solo para opción múltiple), 
                "correctAnswer": "la respuesta correcta", 
                "explanation": "explicación detallada de la respuesta" }`;
  
  return prompt;
}

// Funciones auxiliares omitidas por brevedad 