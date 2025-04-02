const OpenAI = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function generateQuestions(subject, difficulty, topics) {
  try {
    // Definir plantilla para generación de preguntas
    const prompt = `Crea 5 preguntas de evaluación sobre ${subject} (${topics.join(', ')}) con dificultad ${difficulty}.

Cada pregunta debe incluir:
1. Texto de la pregunta
2. Tipo (multiple_choice, true_false, open_ended, matching, order)
3. Opciones (para preguntas de selección múltiple, matching u orden)
4. Respuesta correcta
5. Explicación de la respuesta
6. Tema específico
7. Puntos (entre 5 y 15)

Formatea la respuesta como un array JSON de objetos con las propiedades: id, text, type, options, matches (solo para matching), correctAnswer, explanation, topic, difficulty, points.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {role: "system", content: "Eres un profesor experto en historia y geografía que crea evaluaciones educativas de alta calidad."},
        {role: "user", content: prompt}
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    // Parsear respuesta de OpenAI
    let questions = [];
    try {
      const content = response.choices[0].message.content;
      questions = JSON.parse(content);
      
      // Asegurar que cada pregunta tiene un ID único
      questions = questions.map((q, index) => ({
        ...q,
        id: `q${index + 1}`
      }));
    } catch (error) {
      console.error('Error parseando respuesta de OpenAI:', error);
      // Usar preguntas de respaldo
      questions = getBackupQuestions(subject, difficulty, topics);
    }

    return questions;
  } catch (error) {
    console.error('Error en OpenAI:', error);
    // Usar preguntas de respaldo en caso de error
    return getBackupQuestions(subject, difficulty, topics);
  }
}

// Función para evaluar respuestas de estudiantes
function evaluateAnswers(questions, answers) {
  let correctAnswers = 0;
  let totalPoints = 0;
  let earnedPoints = 0;
  
  // Analizar por temas
  const topicsAnalysis = {};
  
  questions.forEach((question, index) => {
    const answer = answers[index];
    const correct = isAnswerCorrect(question, answer);
    
    // Sumar puntos y conteo
    if (correct) {
      correctAnswers++;
      earnedPoints += question.points;
    }
    totalPoints += question.points;
    
    // Analizar por tema
    if (!topicsAnalysis[question.topic]) {
      topicsAnalysis[question.topic] = {
        total: 1,
        correct: correct ? 1 : 0,
        score: correct ? 100 : 0
      };
    } else {
      topicsAnalysis[question.topic].total++;
      if (correct) {
        topicsAnalysis[question.topic].correct++;
      }
      topicsAnalysis[question.topic].score = 
        (topicsAnalysis[question.topic].correct / topicsAnalysis[question.topic].total) * 100;
    }
  });
  
  // Calcular fortalezas y debilidades
  const strengths = [];
  const weaknesses = [];
  
  Object.entries(topicsAnalysis).forEach(([topic, analysis]) => {
    if (analysis.score >= 70) {
      strengths.push(topic);
    } else {
      weaknesses.push(topic);
    }
  });
  
  // Calcular puntaje general
  const score = Math.round((earnedPoints / totalPoints) * 100);
  
  return {
    correctAnswers,
    totalQuestions: questions.length,
    score,
    earnedPoints,
    totalPoints,
    topicsAnalysis,
    strengths,
    weaknesses
  };
}

// Función auxiliar para verificar si una respuesta es correcta
function isAnswerCorrect(question, answer) {
  if (!answer) return false;
  
  switch (question.type) {
    case 'multiple_choice':
    case 'true_false':
      return question.correctAnswer === answer;
      
    case 'matching':
      // Verificar que cada par coincide
      if (typeof answer !== 'object' || answer === null) return false;
      
      const correctMatches = Object.entries(question.correctAnswer);
      return correctMatches.every(([key, value]) => answer[key] === value);
      
    case 'order':
      // Verificar que el orden es correcto
      if (!Array.isArray(answer) || answer.length !== question.correctAnswer.length) return false;
      
      return answer.every((item, index) => item === question.correctAnswer[index]);
      
    case 'open_ended':
      // La evaluación de preguntas abiertas requiere análisis de IA
      // En esta implementación simplificada, retornamos false
      // y evaluamos estas respuestas en un proceso separado
      return false;
    
    default:
      return false;
  }
}

// Función para obtener preguntas de respaldo en caso de error
function getBackupQuestions(subject, difficulty, topics) {
  // Preguntas predeterminadas según el tema
  if (subject === 'historia') {
    return [
      {
        id: 'q1',
        text: '¿Cuál de las siguientes civilizaciones se desarrolló primero?',
        type: 'multiple_choice',
        options: [
          { id: 'a', text: 'Imperio Romano' },
          { id: 'b', text: 'Antigua Grecia' },
          { id: 'c', text: 'Egipto' },
          { id: 'd', text: 'Mesopotamia' }
        ],
        correctAnswer: 'd',
        explanation: 'Mesopotamia es considerada la cuna de la civilización, desarrollándose antes que las demás opciones mencionadas.',
        topic: 'Historia Antigua',
        difficulty: difficulty,
        points: 10
      },
      {
        id: 'q2',
        text: '¿En qué año comenzó la Segunda Guerra Mundial?',
        type: 'multiple_choice',
        options: [
          { id: 'a', text: '1914' },
          { id: 'b', text: '1939' },
          { id: 'c', text: '1941' },
          { id: 'd', text: '1945' }
        ],
        correctAnswer: 'b',
        explanation: 'La Segunda Guerra Mundial comenzó el 1 de septiembre de 1939 con la invasión alemana a Polonia.',
        topic: 'Guerras Mundiales',
        difficulty: difficulty,
        points: 10
      },
      {
        id: 'q3',
        text: 'Los mayas desarrollaron avanzados sistemas de escritura y matemáticas.',
        type: 'true_false',
        options: [
          { id: 'a', text: 'Verdadero' },
          { id: 'b', text: 'Falso' }
        ],
        correctAnswer: 'a',
        explanation: 'Los mayas desarrollaron un complejo sistema de escritura jeroglífica y un avanzado sistema matemático que incluía el concepto del cero.',
        topic: 'Civilizaciones Mesoamericanas',
        difficulty: difficulty,
        points: 10
      },
      {
        id: 'q4',
        text: 'Explique los principales factores que contribuyeron al colapso de la civilización maya clásica.',
        type: 'open_ended',
        model_answer: 'El colapso de la civilización maya clásica (800-950 d.C.) fue provocado por una combinación de factores: sequías prolongadas y cambio climático; presión demográfica y agotamiento de recursos; conflictos internos y guerras entre ciudades-estado; colapso de las redes comerciales; y crisis en los sistemas políticos y religiosos. Estos factores se retroalimentaron, generando un efecto dominó que resultó en el abandono de grandes centros urbanos del período Clásico.',
        explanation: 'Una respuesta completa debe mencionar factores ambientales, sociopolíticos y económicos.',
        topic: 'Civilizaciones Mesoamericanas',
        difficulty: difficulty,
        points: 15
      },
      {
        id: 'q5',
        text: 'Ordene cronológicamente los siguientes eventos de la Revolución Industrial:',
        type: 'order',
        options: [
          { id: 'a', text: 'Invención de la máquina de vapor de Watt' },
          { id: 'b', text: 'Primera línea de ferrocarril público' },
          { id: 'c', text: 'Invención del telar mecánico' },
          { id: 'd', text: 'Primera fábrica con línea de montaje' }
        ],
        correctAnswer: ['a', 'c', 'b', 'd'],
        explanation: 'El orden correcto es: máquina de vapor de Watt (1769), telar mecánico (1785), primera línea de ferrocarril público (1825), y las líneas de montaje que se popularizaron a principios del siglo XX.',
        topic: 'Revolución Industrial',
        difficulty: difficulty,
        points: 15
      }
    ];
  } else { // geografía
    return [
      {
        id: 'q1',
        text: '¿Cuál es el río más largo de América del Sur?',
        type: 'multiple_choice',
        options: [
          { id: 'a', text: 'Amazonas' },
          { id: 'b', text: 'Paraná' },
          { id: 'c', text: 'Orinoco' },
          { id: 'd', text: 'Magdalena' }
        ],
        correctAnswer: 'a',
        explanation: 'El río Amazonas es el río más largo y caudaloso de América del Sur, y el segundo más largo del mundo después del Nilo.',
        topic: 'Hidrografía',
        difficulty: difficulty,
        points: 10
      },
      {
        id: 'q2',
        text: 'La Cordillera de los Andes recorre toda la costa occidental de América del Sur.',
        type: 'true_false',
        options: [
          { id: 'a', text: 'Verdadero' },
          { id: 'b', text: 'Falso' }
        ],
        correctAnswer: 'a',
        explanation: 'La Cordillera de los Andes recorre la costa occidental de América del Sur a través de Venezuela, Colombia, Ecuador, Perú, Bolivia, Chile y Argentina.',
        topic: 'Geografía de América',
        difficulty: difficulty,
        points: 10
      },
      {
        id: 'q3',
        text: 'Relacione cada país con su capital:',
        type: 'matching',
        options: [
          { id: 'a', text: 'Brasil' },
          { id: 'b', text: 'Argentina' },
          { id: 'c', text: 'Colombia' },
          { id: 'd', text: 'Perú' }
        ],
        matches: [
          { id: '1', text: 'Buenos Aires' },
          { id: '2', text: 'Brasilia' },
          { id: '3', text: 'Bogotá' },
          { id: '4', text: 'Lima' }
        ],
        correctAnswer: { 'a': '2', 'b': '1', 'c': '3', 'd': '4' },
        explanation: 'Las capitales correctas son: Brasil - Brasilia, Argentina - Buenos Aires, Colombia - Bogotá, Perú - Lima.',
        topic: 'Geografía Política',
        difficulty: difficulty,
        points: 10
      },
      {
        id: 'q4',
        text: 'Explique la importancia del Canal de Panamá para el comercio mundial y la geopolítica regional.',
        type: 'open_ended',
        model_answer: 'El Canal de Panamá es una vía artificial de navegación que conecta los océanos Atlántico y Pacífico, reduciendo significativamente el tiempo y los costos de transporte marítimo global al evitar la ruta por el extremo sur de América. Su importancia radica en: 1) Impacto económico: facilita aproximadamente el 6% del comercio marítimo mundial; 2) Influencia geopolítica: ha sido históricamente un punto de interés estratégico para potencias como Estados Unidos; 3) Desarrollo regional: es vital para la economía panameña y representa un nodo logístico para toda América Latina; 4) Conectividad global: permite el tránsito de más de 14,000 embarcaciones anuales entre los principales mercados mundiales.',
        explanation: 'Una respuesta completa debe abordar aspectos económicos, geopolíticos y de conectividad global.',
        topic: 'Geografía de América',
        difficulty: difficulty,
        points: 15
      },
      {
        id: 'q5',
        text: 'Ordene los siguientes países de América Latina de mayor a menor población:',
        type: 'order',
        options: [
          { id: 'a', text: 'México' },
          { id: 'b', text: 'Brasil' },
          { id: 'c', text: 'Colombia' },
          { id: 'd', text: 'Argentina' }
        ],
        correctAnswer: ['b', 'a', 'c', 'd'],
        explanation: 'El orden correcto por población es: Brasil (1° lugar), México (2° lugar), Colombia (3° lugar) y Argentina (4° lugar).',
        topic: 'Demografía',
        difficulty: difficulty,
        points: 15
      }
    ];
  }
}

module.exports = {
  generateQuestions,
  evaluateAnswers
}; 