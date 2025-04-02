/**
 * Servicio Mock para simular respuestas de la API de IA
 * Para desarrollo y pruebas
 */
class AIMockService {
  /**
   * Constructor del servicio mock
   */
  constructor() {
    // Inicializar datos mock
    this.initializeMockData();
    
    // Interceptar fetch para responder con datos mock
    this.setupFetchIntercept();
    this.setupMockEventListeners();
  }
  
  /**
   * Inicializa datos mock para simular respuestas
   */
  initializeMockData() {
    // Datos del estudiante
    this.studentData = {
      id: "student123",
      name: "Carlos Pérez",
      email: "carlos@example.com",
      program: "Ingeniería en Ciencias y Sistemas",
      knowledgeAreas: [
        {
          area: "Historia",
          level: 65,
          strengths: ["Revolución Industrial", "Guerras Mundiales"],
          weaknesses: ["Historia Antigua", "Civilizaciones Mesoamericanas"],
          lastAssessment: new Date().toISOString()
        },
        {
          area: "Geografía",
          level: 78,
          strengths: ["Geografía de América", "Hidrografía"],
          weaknesses: ["Geografía Política", "Demografía"],
          lastAssessment: new Date().toISOString()
        }
      ]
    };
    
    // Estadísticas del estudiante
    this.statsData = {
      completedLessons: 8,
      totalLessons: 25,
      passedQuizzes: 5,
      totalQuizzes: 7,
      points: 650
    };
    
    // Datos para gráficos
    this.chartsData = {
      progressData: {
        labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'],
        datasets: [
          {
            label: 'Historia',
            data: [30, 45, 50, 60, 65],
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Geografía',
            data: [40, 55, 65, 70, 78],
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      skillsData: {
        skills: ['Comprensión de lectura', 'Análisis histórico', 'Interpretación de mapas', 'Memorización de fechas', 'Relaciones geopolíticas', 'Demografía'],
        currentLevels: [75, 65, 80, 55, 70, 45],
        optimalLevels: [80, 80, 80, 80, 80, 80]
      },
      evaluationHistory: {
        dates: ['15/03/2023', '28/03/2023', '10/04/2023', '25/04/2023', '08/05/2023'],
        scores: [65, 72, 68, 75, 80],
        evaluations: [
          {
            id: 'eval1',
            date: '15/03/2023',
            subject: 'Historia',
            topic: 'Revolución Industrial',
            score: 65,
            correctAnswers: 13,
            totalQuestions: 20
          },
          {
            id: 'eval2',
            date: '28/03/2023',
            subject: 'Geografía',
            topic: 'Hidrografía Mundial',
            score: 72,
            correctAnswers: 18,
            totalQuestions: 25
          },
          {
            id: 'eval3',
            date: '10/04/2023',
            subject: 'Historia',
            topic: 'Guerras Mundiales',
            score: 68,
            correctAnswers: 17,
            totalQuestions: 25
          },
          {
            id: 'eval4',
            date: '25/04/2023',
            subject: 'Geografía',
            topic: 'Geografía de América',
            score: 75,
            correctAnswers: 15,
            totalQuestions: 20
          },
          {
            id: 'eval5',
            date: '08/05/2023',
            subject: 'Historia',
            topic: 'Civilizaciones Antiguas',
            score: 80,
            correctAnswers: 16,
            totalQuestions: 20
          }
        ]
      }
    };
    
    // Recomendaciones
    this.recommendationsData = {
      mainRecommendation: "Concentra tus esfuerzos en mejorar tu comprensión de la Historia Antigua y las Civilizaciones Mesoamericanas. Tus conocimientos sobre la Revolución Industrial son sólidos, pero podrías reforzar el contexto histórico general.",
      recommendedActivities: [
        {
          title: "Civilizaciones Mesoamericanas: Un panorama general",
          description: "Lección sobre las principales culturas mesoamericanas y sus características distintivas.",
          category: "Historia",
          url: "lesson.html?id=lesson123",
          duration: "20 minutos",
          badgeClass: "bg-info",
          badgeText: "Recomendado"
        },
        {
          title: "Ejercicios de geografía política",
          description: "Serie de actividades para reforzar conocimientos sobre fronteras y regiones geopolíticas.",
          category: "Geografía",
          url: "activity.html?id=act456",
          duration: "15 minutos",
          badgeClass: "bg-warning text-dark",
          badgeText: "Área de mejora"
        },
        {
          title: "Historia Antigua: Mesopotamia",
          description: "Video explicativo sobre las primeras civilizaciones y su importancia histórica.",
          category: "Historia",
          url: "video.html?id=vid789",
          duration: "10 minutos",
          badgeClass: "bg-danger",
          badgeText: "Prioritario"
        },
        {
          title: "Quiz de repaso: Demografía mundial",
          description: "Evaluación breve para practicar conceptos demográficos y estadísticas poblacionales.",
          category: "Geografía",
          url: "quiz.html?id=quiz321",
          duration: "10 minutos",
          badgeClass: "bg-warning text-dark",
          badgeText: "Área de mejora"
        }
      ]
    };
    
    // Análisis de fortalezas y debilidades
    this.analysisData = {
      strengths: [
        { topic: "Revolución Industrial", level: 85 },
        { topic: "Guerras Mundiales", level: 78 },
        { topic: "Geografía de América", level: 82 },
        { topic: "Hidrografía", level: 80 }
      ],
      weaknesses: [
        { topic: "Historia Antigua", level: 45 },
        { topic: "Civilizaciones Mesoamericanas", level: 52 },
        { topic: "Geografía Política", level: 58 },
        { topic: "Demografía", level: 60 }
      ],
      strengthsRecommendation: "Tus fortalezas en la Revolución Industrial y Guerras Mundiales indican una buena comprensión de la historia moderna. Considera relacionar estos temas con la geografía política para expandir tu conocimiento.",
      weaknessesRecommendation: "Para mejorar en Historia Antigua, te recomiendo comenzar con las civilizaciones de Mesopotamia, luego Egipto, y finalmente Grecia y Roma. Para las civilizaciones mesoamericanas, enfócate primero en los mayas y aztecas."
    };
    
    // Mock de evaluación generada
    this.generatedAssessment = {
      id: "assessment123",
      subject: "historia",
      difficulty: "intermediate",
      topics: ["Historia Antigua", "Civilizaciones Mesoamericanas"],
      totalPoints: 100,
      questions: [
        {
          id: "q1",
          text: "¿Cuál de las siguientes civilizaciones NO se desarrolló en Mesopotamia?",
          type: "multiple_choice",
          options: [
            { id: "a", text: "Sumeria" },
            { id: "b", text: "Asiria" },
            { id: "c", text: "Hitita" },
            { id: "d", text: "Olmeca" }
          ],
          correctAnswer: "d",
          explanation: "La civilización Olmeca se desarrolló en Mesoamérica (actual México), mientras que Sumeria, Asiria y los Hititas surgieron en la región de Mesopotamia (actual Irak y partes de Siria y Turquía).",
          topic: "Historia Antigua",
          difficulty: "intermediate",
          points: 10
        },
        {
          id: "q2",
          text: "¿Qué estructura arquitectónica es más característica de la civilización maya?",
          type: "multiple_choice",
          options: [
            { id: "a", text: "Zigurats" },
            { id: "b", text: "Pirámides escalonadas" },
            { id: "c", text: "Acueductos" },
            { id: "d", text: "Coliseos" }
          ],
          correctAnswer: "b",
          explanation: "Las pirámides escalonadas son estructuras características de la civilización maya, utilizadas como templos ceremoniales y observatorios astronómicos. Los zigurats son mesopotámicos, los acueductos romanos, y los coliseos son propios de la antigua Roma.",
          topic: "Civilizaciones Mesoamericanas",
          difficulty: "basic",
          points: 10
        },
        {
          id: "q3",
          text: "Ordena cronológicamente las siguientes civilizaciones mesoamericanas de la más antigua a la más reciente:",
          type: "order",
          options: [
            { id: "a", text: "Azteca" },
            { id: "b", text: "Olmeca" },
            { id: "c", text: "Maya" },
            { id: "d", text: "Tolteca" }
          ],
          correctAnswer: ["b", "c", "d", "a"],
          explanation: "El orden cronológico correcto es: Olmeca (1200-400 a.C.), Maya (2000 a.C.-1500 d.C.), Tolteca (900-1150 d.C.) y Azteca (1300-1521 d.C.).",
          topic: "Civilizaciones Mesoamericanas",
          difficulty: "advanced",
          points: 15
        },
        {
          id: "q4",
          text: "Explica la importancia del código de Hammurabi y su influencia en el desarrollo del concepto de justicia en la antigüedad.",
          type: "open_ended",
          model_answer: "El Código de Hammurabi, creado en Babilonia alrededor del 1750 a.C., es uno de los primeros conjuntos de leyes escritas de la historia. Su importancia radica en que estableció un principio de justicia basado en reglas claras y públicas, aplicables a todos los ciudadanos. Aunque incluía el principio de 'ojo por ojo', representó un avance al imponer castigos proporcionales al delito y reducir la arbitrariedad. Su influencia se extendió a otras civilizaciones y sistemas legales posteriores, sentando bases para conceptos modernos como la presunción de inocencia y la proporcionalidad de las penas.",
          explanation: "El Código de Hammurabi fue revolucionario al establecer leyes escritas y públicas, creando precedente para futuros sistemas legales y el concepto de estado de derecho.",
          topic: "Historia Antigua",
          difficulty: "advanced",
          points: 15
        },
        {
          id: "q5",
          text: "Relaciona cada deidad con la civilización mesoamericana a la que pertenece:",
          type: "matching",
          options: [
            { id: "a", text: "Quetzalcóatl" },
            { id: "b", text: "Chaac" },
            { id: "c", text: "Huitzilopochtli" },
            { id: "d", text: "Kukulkán" }
          ],
          matches: [
            { id: "1", text: "Azteca (dios de la guerra)" },
            { id: "2", text: "Maya (dios de la lluvia)" },
            { id: "3", text: "Tolteca (serpiente emplumada)" },
            { id: "4", text: "Maya (versión de la serpiente emplumada)" }
          ],
          correctAnswer: { "a": "3", "b": "2", "c": "1", "d": "4" },
          explanation: "Quetzalcóatl es la serpiente emplumada de los toltecas, Chaac es el dios maya de la lluvia, Huitzilopochtli es el dios azteca de la guerra, y Kukulkán es la versión maya de la serpiente emplumada.",
          topic: "Civilizaciones Mesoamericanas",
          difficulty: "intermediate",
          points: 10
        }
      ],
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    // Respuestas de chat de IA
    this.chatResponses = [
      {
        message: "Puedo ayudarte con tus estudios de Historia y Geografía. ¿Qué tema específico te interesa explorar?",
        actions: []
      },
      {
        message: "Las civilizaciones mesoamericanas más importantes fueron los Olmecas, Mayas, Toltecas y Aztecas. Cada una desarrolló características culturales, arquitectónicas y religiosas únicas. ¿Te gustaría aprender más sobre alguna en particular?",
        actions: []
      },
      {
        message: "Veo que has estado estudiando sobre las civilizaciones mesoamericanas. Te recomiendo revisar la lección sobre los Mayas, ya que tus resultados indican que necesitas reforzar ese tema. ¿Quieres acceder a esa lección ahora?",
        actions: [
          {
            type: "navigate",
            url: "lesson.html?id=lesson456",
            description: "Lección: Civilización Maya"
          }
        ]
      },
      {
        message: "Para mejorar en el tema de Historia Antigua, te recomendaría seguir esta secuencia de estudio:\n\n1. **Mesopotamia**: Sumerios, Acadios, Babilonios y Asirios\n2. **Antiguo Egipto**: Periodos antiguo, medio y nuevo\n3. **Civilizaciones del Mediterráneo**: Fenicios, Minoicos y Micénicos\n4. **Grecia y Roma Antiguas**\n\n¿Por cuál te gustaría comenzar?",
        actions: []
      },
      {
        message: "He analizado tus últimas evaluaciones y veo que tienes fortalezas en el tema de Hidrografía, pero podrías mejorar en Demografía. Te sugiero revisar los conceptos clave de crecimiento poblacional y distribución demográfica.",
        actions: []
      }
    ];
  }
  
  /**
   * Configura listeners para simular eventos del sistema
   */
  setupMockEventListeners() {
    // Simular desconexiones aleatorias para pruebas
    if (process.env.NODE_ENV === 'development') {
      setInterval(() => {
        if (Math.random() < 0.1) {
          const event = new Event(Math.random() < 0.5 ? 'online' : 'offline');
          window.dispatchEvent(event);
        }
      }, 30000);
    }
  }
  
  /**
   * Configura la intercepción de fetch para simular respuestas API
   */
  setupFetchIntercept() {
    const originalFetch = window.fetch;
    const self = this;
    
    window.fetch = function(url, options) {
      return new Promise((resolve, reject) => {
        // Simular latencia de red variable
        const latency = Math.random() * 800 + 200;
        
        setTimeout(() => {
          try {
            // Simular errores de red en desarrollo
            if (process.env.NODE_ENV === 'development') {
              if (Math.random() < 0.1) {
                throw new Error('Error de red simulado para pruebas');
              }
            }
            
            const urlStr = url.toString();
            let response = self.handleRequest(urlStr, options);
            
            resolve({
              ok: true,
              status: 200,
              json: async () => response,
              text: async () => JSON.stringify(response)
            });
          } catch (error) {
            reject(error);
          }
        }, latency);
      });
    };
  }
  
  /**
   * Maneja las solicitudes mock con mejor organización
   */
  handleRequest(urlStr, options) {
    if (urlStr.includes('/students/') && urlStr.includes('/charts')) {
      return this.handleChartRequest();
    } else if (urlStr.includes('/recommendations')) {
      return this.handleRecommendationsRequest();
    } else if (urlStr.includes('/students/') && urlStr.includes('/analysis')) {
      return this.handleAnalysisRequest();
    } else if (urlStr.includes('/ai/chat')) {
      return this.handleChatRequest(options);
    } else if (urlStr.includes('/assessments/generate')) {
      return this.handleGenerateAssessmentRequest();
    } else if (urlStr.includes('/assessments/') && options?.method !== 'POST') {
      return this.handleGetAssessmentRequest(urlStr);
    }
    
    throw new Error('Endpoint no implementado en mock');
  }
  
  /**
   * Manejador para solicitudes de gráficos
   */
  handleChartRequest() {
    return this.chartsData;
  }
  
  /**
   * Manejador para solicitudes de recomendaciones
   */
  handleRecommendationsRequest() {
    return this.recommendationsData;
  }
  
  /**
   * Manejador para solicitudes de análisis
   */
  handleAnalysisRequest() {
    return this.analysisData;
  }
  
  /**
   * Manejador para solicitudes de chat con IA
   */
  handleChatRequest(options) {
    // Extraer mensaje del usuario
    let userMessage = "";
    
    if (options && options.body) {
      try {
        const body = JSON.parse(options.body);
        userMessage = body.message;
      } catch (e) {
        console.error("Error parsing request body", e);
      }
    }
    
    // Seleccionar respuesta apropiada basada en el mensaje del usuario
    let response;
    
    if (userMessage.toLowerCase().includes("civilizacion") || 
        userMessage.toLowerCase().includes("mesoamerica")) {
      response = this.chatResponses[1];
    } else if (userMessage.toLowerCase().includes("maya")) {
      response = this.chatResponses[2];
    } else if (userMessage.toLowerCase().includes("historia antigua") || 
               userMessage.toLowerCase().includes("mesopotamia")) {
      response = this.chatResponses[3];
    } else if (userMessage.toLowerCase().includes("evaluacion") || 
               userMessage.toLowerCase().includes("resultados")) {
      response = this.chatResponses[4];
    } else {
      response = this.chatResponses[0];
    }
    
    return response;
  }
  
  /**
   * Manejador para solicitudes de generación de evaluaciones
   */
  handleGenerateAssessmentRequest() {
    // Simular proceso de generación de evaluación
    return {
      success: true,
      message: "Evaluación generada correctamente",
      assessment: this.generatedAssessment
    };
  }
  
  /**
   * Manejador para solicitudes de obtención de evaluación
   */
  handleGetAssessmentRequest(url) {
    // Extraer ID de la evaluación de la URL
    const urlStr = url.toString();
    const assessmentId = urlStr.split('/').pop().split('?')[0];
    
    // Aquí podríamos manejar diferentes IDs, pero por simplicidad siempre devolvemos la misma evaluación
    return {
      success: true,
      assessment: this.generatedAssessment
    };
  }
}

// Inicializar el servicio mock cuando se cargue la página
document.addEventListener('DOMContentLoaded', () => {
  // Solo activar el mock en entorno de desarrollo
  if (window.location.hostname !== 'production-hostname.com') {
    console.info("Utilizando servicio mock para AI. Las respuestas son simuladas para desarrollo.");
    new AIMockService();
  }
}); 