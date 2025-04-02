const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Importar rutas
const assessmentRoutes = require('./routes/assessments');
const studentRoutes = require('./routes/students');
const resourceRoutes = require('./routes/resources');

// Inicializar la aplicación
const app = express();

// Configurar middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configurar vista
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error de conexión a MongoDB:', err));

// Rutas API
app.use('/api/assessments', assessmentRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/resources', resourceRoutes);

// Ruta principal
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Plataforma Educativa Adaptativa'
  });
});

// Ruta del dashboard del estudiante
app.get('/student-dashboard', (req, res) => {
  res.render('student-dashboard', {
    title: 'Dashboard del Estudiante'
  });
});

// Ruta de evaluación
app.get('/assessment/:id', (req, res) => {
  res.render('assessment', {
    title: 'Evaluación',
    assessmentId: req.params.id
  });
});

// Ruta para recursos educativos
app.get('/resources', (req, res) => {
  res.render('resources', {
    title: 'Recursos Educativos'
  });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor'
  });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

// Exportar app para pruebas
module.exports = app; 