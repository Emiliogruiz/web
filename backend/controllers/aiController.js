const OpenAI = require('openai');

// Initialize OpenAI client with proper configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID, // Optional: Add organization ID if needed
  dangerouslyAllowBrowser: false // Ensure this is false for server-side usage
});

// ... existing code ...
    actions.push({
      type: 'navigate',
      url: 'quiz.html',
      description: 'Realizar una nueva evaluación'
    });
  }
  
  // Si el mensaje sugiere querer ver lecciones o material de estudio
  if (message.toLowerCase().includes('lección') || 
      message.toLowerCase().includes('material') || 
      message.toLowerCase().includes('aprender') || 
      message.toLowerCase().includes('estudiar')) {
    actions.push({
      type: 'navigate',
      url: 'library.html',
      description: 'Explorar biblioteca de recursos'
    });
  }
  
  // Si el mensaje sugiere querer ver progreso
  if (message.toLowerCase().includes('progreso') || 
      message.toLowerCase().includes('avance') || 
      message.toLowerCase().includes('estadísticas') || 
      message.toLowerCase().includes('nivel')) {
    actions.push({
      type: 'navigate',
      url: 'student-dashboard.html',
      description: 'Ver mi progreso en el dashboard'
    });
  }
  
  return actions;
}

// Función para generar respuesta de IA
async function generateAIResponse(message, studentContext, relatedResources) {
  try {
    // Crear contexto para el sistema
    const systemPrompt = `Eres un asistente educativo especializado en historia y geografía. Tu objetivo es ayudar al estudiante a aprender estos temas proporcionando respuestas claras, precisas y educativas.

Información del estudiante:
- Nombre: ${studentContext.name}
- Programa: ${studentContext.program}
- Áreas de conocimiento: ${studentContext.knowledgeAreas.map(area => 
      `${area.area} (Nivel: ${area.level}%, Fortalezas: ${area.strengths.join(', ')}, Debilidades: ${area.weaknesses.join(', ')})`
    ).join('; ')}
- Evaluaciones completadas: ${studentContext.completedAssessments}
- Puntaje promedio: ${studentContext.averageScore.toFixed(1)}%

Tus respuestas deben ser:
1. Educativas y fomentar el aprendizaje
2. Personalizadas según el nivel y conocimientos del estudiante
3. Amigables y motivadoras
4. Concisas (máximo 3-4 párrafos)
5. Incluir sugerencias relacionadas con los intereses y áreas de mejora del estudiante`;

    // Información de recursos relacionados
    let resourcesInfo = "";
    if (relatedResources.length > 0) {
      resourcesInfo = "Recursos relevantes que puedes mencionar:\n" + 
        relatedResources.map(resource => 
          `- ${resource.title} (${resource.type}): ${resource.description}`
        ).join('\n');
    }

    // Generar respuesta
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {role: "system", content: systemPrompt},
        {role: "system", content: resourcesInfo},
        {role: "user", content: message}
      ],
      temperature: 0.7,
      max_tokens: 400,
    });
    
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generando respuesta de IA:', error);
    return "Lo siento, tuve problemas para procesar tu pregunta. ¿Podrías reformularla o intentar con otra consulta?";
  }
}

// Función para evaluar respuestas abiertas
async function evaluateOpenEndedResponse(studentResponse, modelAnswer) {
  try {
    const prompt = `Evalúa la siguiente respuesta de un estudiante comparándola con la respuesta modelo. Proporciona una puntuación de 0-100 y retroalimentación constructiva.

Respuesta modelo:
"${modelAnswer}"

Respuesta del estudiante:
"${studentResponse}"

Evalúa en base a:
1. Precisión conceptual (50%)
2. Completitud de la respuesta (30%)
3. Claridad de expresión (20%)

Formato de respuesta:
{
  "score": [puntuación numérica],
  "feedback": [retroalimentación detallada],
  "strengths": [puntos fuertes identificados],
  "suggestions": [sugerencias de mejora]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106", // Using the latest stable version
      messages: [
        {
          role: "system",
          content: "Eres un profesor experto que evalúa respuestas educativas de manera justa y constructiva."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: "json_object" }, // Ensure JSON response format
      presence_penalty: 0.6,
      frequency_penalty: 0.5
    });
    
    const result = JSON.parse(response.choices[0].message.content);
    return result;
  } catch (error) {
    console.error('Error evaluando respuesta abierta:', error);
    
    // Add better error handling with specific error types
    if (error.response) {
      console.error('OpenAI API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Request Error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    
    // Respuesta por defecto en caso de error
    return {
      score: 50,
      feedback: "No se pudo realizar una evaluación detallada de tu respuesta. Revisa que tu respuesta aborde los puntos principales del tema y compárala con la respuesta modelo.",
      strengths: ["Respuesta proporcionada"],
      suggestions: ["Revisar el material de estudio y la respuesta modelo"]
    };
  }
}

module.exports = {
  handleChat,
  evaluateResponse
}; 