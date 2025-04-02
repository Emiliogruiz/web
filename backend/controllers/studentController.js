const Student = require('../models/Student');
const Assessment = require('../models/Assessment');
const Resource = require('../models/Resource');
const OpenAI = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Obtener información del estudiante por ID
exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await Student.findById(id).select('-password');
    
    if (!student) {
      return res.status(404).json({
        error: 'Estudiante no encontrado'
      });
    }
    
    // Calcular estadísticas
    const stats = {
      completedLessons: student.completedLessons.length,
      totalLessons: await Resource.countDocuments({ type: 'lesson' }),
      passedAssessments: student.completedAssessments.filter(a => a.score >= 70).length,
      totalAssessments: student.completedAssessments.length,
      points: student.points || 0
    };
    
    res.json({
      success: true,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        program: student.program,
        knowledgeAreas: student.knowledgeAreas,
        stats
      }
    });
  } catch (error) {
    console.error('Error obteniendo estudiante:', error);
    res.status(500).json({
      error: 'Error obteniendo estudiante'
    });
  }
};

// Obtener gráficos para el dashboard del estudiante
exports.getStudentCharts = async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await Student.findById(id);
    
    if (!student) {
      return res.status(404).json({
        error: 'Estudiante no encontrado'
      });
    }
    
    // Datos para el gráfico de progreso
    const progressLabels = [];
    const historyDataset = [];
    const geographyDataset = [];
    
    // Obtener últimas 5 evaluaciones
    const lastAssessments = student.completedAssessments
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, 5)
      .reverse();
    
    lastAssessments.forEach(assessment => {
      const date = new Date(assessment.completedAt);
      const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      
      progressLabels.push(formattedDate);
      
      if (assessment.subject === 'historia') {
        historyDataset.push(assessment.score);
        // Si no hay valor para geografía en esa fecha, poner null
        if (geographyDataset.length < progressLabels.length - 1) {
          geographyDataset.push(null);
        }
      } else {
        geographyDataset.push(assessment.score);
        // Si no hay valor para historia en esa fecha, poner null
        if (historyDataset.length < progressLabels.length - 1) {
          historyDataset.push(null);
        }
      }
    });
    
    const progressData = {
      labels: progressLabels,
      datasets: [
        {
          label: 'Historia',
          data: historyDataset,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Geografía',
          data: geographyDataset,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };
    
    // Datos para el gráfico de radar de habilidades
    const historyArea = student.knowledgeAreas.find(area => area.area === 'Historia') || { level: 0 };
    const geographyArea = student.knowledgeAreas.find(area => area.area === 'Geografía') || { level: 0 };
    
    const skillsData = {
      skills: ['Comprensión de lectura', 'Análisis histórico', 'Interpretación de mapas', 'Memorización de fechas', 'Relaciones geopolíticas', 'Demografía'],
      currentLevels: [
        75, // Ejemplo - en producción se calcularía
        historyArea.level,
        geographyArea.level,
        historyArea.level * 0.8, // Simplificación para demo
        geographyArea.level * 0.9, // Simplificación para demo
        geographyArea.level * 0.7  // Simplificación para demo
      ],
      optimalLevels: [80, 80, 80, 80, 80, 80]
    };
    
    // Datos para el historial de evaluaciones
    const evaluationHistory = {
      dates: lastAssessments.map(assessment => {
        const date = new Date(assessment.completedAt);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      }),
      scores: lastAssessments.map(assessment => assessment.score),
      evaluations: lastAssessments.map(assessment => ({
        id: assessment.assessmentId,
        date: new Date(assessment.completedAt).toLocaleDateString(),
        subject: assessment.subject === 'historia' ? 'Historia' : 'Geografía',
        topic: assessment.topics.join(', '),
        score: assessment.score,
        correctAnswers: assessment.correctAnswers,
        totalQuestions: assessment.totalQuestions
      }))
    };
    
    res.json({
      progressData,
      skillsData,
      evaluationHistory
    });
  } catch (error) {
    console.error('Error generando gráficos:', error);
    res.status(500).json({
      error: 'Error generando gráficos'
    });
  }
};

// Obtener análisis de fortalezas y debilidades
exports.getStudentAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await Student.findById(id);
    
    if (!student) {
      return res.status(404).json({
        error: 'Estudiante no encontrado'
      });
    }
    
    // Obtener fortalezas y debilidades de cada área
    const strengths = [];
    const weaknesses = [];
    
    student.knowledgeAreas.forEach(area => {
      strengths.push(...area.strengths.map(topic => ({
        topic,
        level: Math.floor(Math.random() * 20) + 70 // Simulación para demo
      })));
      
      weaknesses.push(...area.weaknesses.map(topic => ({
        topic,
        level: Math.floor(Math.random() * 20) + 40 // Simulación para demo
      })));
    });
    
    // Generar recomendaciones usando IA
    const strengthsRecommendation = await generateRecommendation(
      student.name,
      strengths,
      true
    );
    
    const weaknessesRecommendation = await generateRecommendation(
      student.name,
      weaknesses,
      false
    );
    
    res.json({
      strengths,
      weaknesses,
      strengthsRecommendation,
      weaknessesRecommendation
    });
  } catch (error) {
    console.error('Error generando análisis:', error);
    res.status(500).json({
      error: 'Error generando análisis'
    });
  }
};

// Obtener recomendaciones personalizadas
exports.getRecommendations = async (req, res) => {
  try {
    const { studentId } = req.query;
    
    if (!studentId) {
      return res.status(400).json({
        error: 'Se requiere ID de estudiante'
      });
    }
    
    const student = await Student.findById(studentId);
    
    if (!student) {
      return res.status(404).json({
        error: 'Estudiante no encontrado'
      });
    }
    
    // Obtener temas débiles
    const weakTopics = [];
    student.knowledgeAreas.forEach(area => {
      weakTopics.push(...area.weaknesses);
    });
    
    // Buscar recursos recomendados
    const recommendedResources = await Resource.find({
      topics: { $in: weakTopics }
    }).limit(4);
    
    // Formatear actividades recomendadas
    const recommendedActivities = recommendedResources.map(resource => {
      let badgeClass = 'bg-info';
      let badgeText = 'Recomendado';
      
      // Si el recurso aborda una debilidad específica, resaltarlo
      if (student.knowledgeAreas.some(area => 
        area.weaknesses.some(topic => 
          resource.topics.includes(topic)))) {
        badgeClass = 'bg-warning text-dark';
        badgeText = 'Área de mejora';
      }
      
      // Si es una prioridad alta (primer tema débil), resaltarlo más
      if (weakTopics.length > 0 && resource.topics.includes(weakTopics[0])) {
        badgeClass = 'bg-danger';
        badgeText = 'Prioritario';
      }
      
      return {
        title: resource.title,
        description: resource.description,
        category: resource.subject === 'historia' ? 'Historia' : 'Geografía',
        url: `${resource.type}.html?id=${resource._id}`,
        duration: `${resource.duration} minutos`,
        badgeClass,
        badgeText
      };
    });
    
    // Generar recomendación principal
    const mainRecommendation = await generateMainRecommendation(student);
    
    res.json({
      mainRecommendation,
      recommendedActivities
    });
  } catch (error) {
    console.error('Error generando recomendaciones:', error);
    res.status(500).json({
      error: 'Error generando recomendaciones'
    });
  }
};

// Función para generar recomendación con IA
async function generateRecommendation(studentName, topics, isStrength) {
  try {
    const topicsText = topics.map(t => t.topic).join(', ');
    
    const prompt = isStrength ?
      `El estudiante ${studentName} muestra fortalezas en: ${topicsText}. Genera una recomendación breve (máximo 2 oraciones) sobre cómo puede aprovechar estas fortalezas.` :
      `El estudiante ${studentName} necesita mejorar en: ${topicsText}. Genera una recomendación breve (máximo 2 oraciones) con estrategias específicas para mejorar en estas áreas.`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {role: "system", content: "Eres un tutor educativo que proporciona recomendaciones breves y efectivas para estudiantes."},
        {role: "user", content: prompt}
      ],
      temperature: 0.7,
      max_tokens: 150,
    });
    
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generando recomendación:', error);
    return isStrength ?
      "Aprovecha tus fortalezas para ayudar a otros estudiantes y profundizar en temas relacionados." :
      "Enfócate en los temas donde necesitas mejorar, utilizando recursos multimedia y ejercicios prácticos.";
  }
}

// Función para generar recomendación principal
async function generateMainRecommendation(student) {
  try {
    // Obtener áreas de conocimiento y estadísticas
    const knowledgeAreas = student.knowledgeAreas.map(area => 
      `${area.area} (nivel: ${area.level}%, fortalezas: ${area.strengths.join(', ')}, debilidades: ${area.weaknesses.join(', ')})`
    ).join('\n');
    
    const completedAssessments = student.completedAssessments.length;
    const averageScore = student.completedAssessments.length > 0 ?
      student.completedAssessments.reduce((sum, assessment) => sum + assessment.score, 0) / student.completedAssessments.length :
      0;
    
    const prompt = `Generar una recomendación educativa personalizada para el estudiante ${student.name} basada en:
    
Áreas de conocimiento:
${knowledgeAreas}

Estadísticas:
- Evaluaciones completadas: ${completedAssessments}
- Puntaje promedio: ${averageScore.toFixed(1)}%

La recomendación debe ser específica para historia y geografía, con un tono motivador y longitud de 2-3 oraciones.`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {role: "system", content: "Eres un tutor educativo que proporciona recomendaciones personalizadas y motivadoras para estudiantes."},
        {role: "user", content: prompt}
      ],
      temperature: 0.7,
      max_tokens: 150,
    });
    
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generando recomendación principal:', error);
    return "Concentra tus esfuerzos en las áreas donde has mostrado mayor dificultad, dedicando tiempo adicional a los temas con puntajes más bajos. Utiliza los recursos recomendados para reforzar tus conocimientos y realiza evaluaciones frecuentes para medir tu progreso.";
  }
}

module.exports = {
  getStudentById,
  getStudentCharts,
  getStudentAnalysis,
  getRecommendations
}; 