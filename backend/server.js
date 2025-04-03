const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const OpenAI = require('openai');
const path = require('path');
const jwt = require('jsonwebtoken');

// Cargar variables de entorno
dotenv.config();

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB conectado'))
.catch(err => {
  console.error('Error conectando a MongoDB:', err);
  process.exit(1);
});

// Inicializar OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Middleware para verificar token de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.status(401).json({ error: 'Se requiere autenticación' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido o expirado' });
    req.user = user;
    next();
  });
};

// Importar modelos
const Student = require('./models/Student');
const Assessment = require('./models/Assessment');
const Resource = require('./models/Resource');

// Importar controladores
const assessmentController = require('./controllers/assessmentController');
const studentController = require('./controllers/studentController');
const resourceController = require('./controllers/resourceController');
const aiController = require('./controllers/aiController');

// Rutas públicas
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // En producción, validar credenciales con bcrypt
    // Para demo, aceptamos cualquier email con contraseña "password"
    if (password !== 'password') {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // Buscar estudiante o crear uno nuevo para demo
    let student = await Student.findOne({ email });
    
    if (!student) {
      // Crear estudiante de demo
      student = new Student({
        name: email.split('@')[0],
        email,
        program: 'Ingeniería en Ciencias y Sistemas',
        knowledgeAreas: [
          {
            area: 'Historia',
            level: 65,
            strengths: ['Revolución Industrial', 'Guerras Mundiales'],
            weaknesses: ['Historia Antigua', 'Civilizaciones Mesoamericanas']
          },
          {
            area: 'Geografía',
            level: 78,
            strengths: ['Geografía de América', 'Hidrografía'],
            weaknesses: ['Geografía Política', 'Demografía']
          }
        ]
      });
      
      await student.save();
    }
    
    // Generar token JWT
    const token = jwt.sign(
      { id: student._id, email: student.email }, 
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        program: student.program
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Rutas para estudiantes
app.get('/api/students/:id', authenticateToken, studentController.getStudentById);
app.get('/api/students/:id/charts', authenticateToken, studentController.getStudentCharts);
app.get('/api/students/:id/analysis', authenticateToken, studentController.getStudentAnalysis);

// Rutas para recomendaciones
app.get('/api/recommendations', authenticateToken, studentController.getRecommendations);

// Rutas para evaluaciones
app.post('/api/assessments/generate', authenticateToken, assessmentController.generateAssessment);
app.get('/api/assessments/:id', authenticateToken, assessmentController.getAssessmentById);
app.post('/api/assessments/:id/submit', authenticateToken, assessmentController.submitAssessment);

// Rutas para recursos
app.get('/api/resources', authenticateToken, resourceController.getAllResources);
app.get('/api/resources/:id', authenticateToken, resourceController.getResourceById);
app.get('/api/resources/search', authenticateToken, resourceController.searchResources);

// Rutas para IA
app.post('/api/ai/chat', authenticateToken, aiController.handleChat);
app.post('/api/ai/evaluate-response', authenticateToken, aiController.evaluateResponse);

// Ruta para estatus de la API
app.get('/api/status', (req, res) => {
  res.json({ status: 'online', version: '1.0.0' });
});

// Definir rutas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

// Servir archivos estáticos en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'index.html'));
  });
}

// Manejar errores 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Recurso no encontrado'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado en puerto ${PORT}`);
}); 