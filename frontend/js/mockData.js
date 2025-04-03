// Datos temporales para desarrollo
const mockData = {
  quizzes: [
    {
      _id: 'quiz1',
      title: 'Historia Medieval',
      description: 'Evaluación sobre la Europa Medieval y sus principales acontecimientos',
      category: 'Historia',
      questions: [
        {
          _id: 'q1',
          question: '¿En qué año comenzó la Edad Media?',
          options: ['476 d.C.', '711 d.C.', '1066 d.C.', '1215 d.C.'],
          correctAnswer: '476 d.C.',
          type: 'multiple-choice',
          points: 10
        },
        {
          _id: 'q2',
          question: '¿Qué evento marca el fin de la Edad Media?',
          options: [
            'La caída de Constantinopla',
            'El descubrimiento de América',
            'La invención de la imprenta',
            'La Revolución Francesa'
          ],
          correctAnswer: 'La caída de Constantinopla',
          type: 'multiple-choice',
          points: 10
        }
      ]
    },
    {
      _id: 'quiz2',
      title: 'Geografía de América',
      description: 'Evalúa tus conocimientos sobre el continente americano',
      category: 'Geografía',
      questions: []
    },
    {
      _id: 'quiz3',
      title: 'Segunda Guerra Mundial',
      description: 'Principales eventos y personajes de la Segunda Guerra Mundial',
      category: 'Historia',
      questions: []
    }
  ],
  
  resources: [
    {
      _id: 'res1',
      title: 'La Edad Media: Un recorrido histórico',
      description: 'Artículo completo sobre los principales aspectos de la Edad Media europea',
      type: 'article',
      category: 'Historia',
      level: 'Intermedio',
      url: '#'
    },
    {
      _id: 'res2',
      title: 'Mapas interactivos: Geografía mundial',
      description: 'Colección de mapas interactivos para aprender geografía',
      type: 'interactive',
      category: 'Geografía',
      level: 'Básico',
      url: '#'
    },
    {
      _id: 'res3',
      title: 'Documental: La Segunda Guerra Mundial',
      description: 'Documental completo sobre las causas y consecuencias de la Segunda Guerra Mundial',
      type: 'video',
      category: 'Historia',
      level: 'Avanzado',
      url: '#'
    }
  ],
  
  results: [
    {
      _id: 'result1',
      quiz: {
        _id: 'quiz1',
        title: 'Historia Medieval',
        category: 'Historia'
      },
      score: 85,
      maxScore: 100,
      completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      strengths: ['Conocimiento de fechas clave', 'Comprensión de eventos políticos'],
      weaknesses: ['Aspectos económicos medievales']
    },
    {
      _id: 'result2',
      quiz: {
        _id: 'quiz2',
        title: 'Geografía de América',
        category: 'Geografía'
      },
      score: 92,
      maxScore: 100,
      completedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      strengths: ['Conocimiento de países y capitales', 'Relieve geográfico'],
      weaknesses: ['Demografía actual']
    }
  ],
  
  // Token JWT simulado
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXIxMjMiLCJpYXQiOjE2MTU0NjQ5NzgsImV4cCI6MTYxNjA2OTc3OH0.simulated-token-signature',
  
  // Datos de usuario
  currentUser: {
    id: 'user123',
    username: 'estudiante_ejemplo',
    email: 'estudiante@ejemplo.com',
    program: 'Historia y Geografía',
    completedAssessments: 3,
    averageScore: 85,
    knowledgeAreas: [
      {
        area: 'Historia',
        level: 72,
        strengths: ['Historia Antigua', 'Historia Medieval'],
        weaknesses: ['Historia Contemporánea']
      },
      {
        area: 'Geografía',
        level: 64,
        strengths: ['Geografía Física'],
        weaknesses: ['Geografía Humana']
      }
    ]
  }
};

// Funciones para simular llamadas a la API
async function mockFetch(url, options = {}) {
  console.log(`[Mock API] Llamada a: ${url}`, options);
  await new Promise(resolve => setTimeout(resolve, 800)); // Simular latencia
  
  // Extraer endpoint
  const endpoint = url.split('/api/')[1];
  
  // Manejar diferentes endpoints
  if (endpoint.startsWith('auth/login')) {
    return {
      json: async () => {
        const body = JSON.parse(options.body);
        
        if (body.email && body.password) {
          return {
            token: 'mock-jwt-token',
            student: {
              id: 'student1',
              name: body.email.split('@')[0],
              email: body.email,
              program: 'Historia y Geografía'
            }
          };
        } else {
          return { error: 'Credenciales inválidas' };
        }
      }
    };
  }
  
  if (endpoint.startsWith('auth/register')) {
    return {
      json: async () => {
        const body = JSON.parse(options.body);
        
        if (body.username && body.email && body.password) {
          return {
            success: true,
            token: 'mock-jwt-token',
            user: {
              id: 'user1',
              username: body.username,
              email: body.email,
              program: body.program
            }
          };
        } else {
          return { 
            success: false, 
            message: 'Datos incompletos' 
          };
        }
      }
    };
  }
  
  if (endpoint.startsWith('quizzes') && !endpoint.includes('/')) {
    return {
      json: async () => {
        return {
          success: true,
          count: mockData.quizzes.length,
          data: mockData.quizzes
        };
      }
    };
  }
  
  if (endpoint.startsWith('quizzes/results')) {
    return {
      json: async () => {
        return {
          success: true,
          count: mockData.results.length,
          data: mockData.results
        };
      }
    };
  }
  
  if (endpoint.startsWith('resources')) {
    return {
      json: async () => {
        return {
          success: true,
          count: mockData.resources.length,
          data: mockData.resources
        };
      }
    };
  }
  
  // Si no coincide con ningún endpoint
  return {
    json: async () => {
      return {
        success: false,
        message: 'Endpoint no implementado'
      };
    }
  };
}

// Sobreescribir fetch en GitHub Pages o desarrollo local
if (window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' || 
    window.location.hostname === 'emiliogruiz.github.io') {
  
  console.log(`[${window.location.hostname}] Usando API mock`);
  window.originalFetch = window.fetch;
  window.fetch = mockFetch;
} 