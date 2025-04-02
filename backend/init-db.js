const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Student = require('./models/Student');
const Resource = require('./models/Resource');

// Cargar variables de entorno
dotenv.config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado a MongoDB para inicialización'))
  .catch(err => {
    console.error('Error conectando a MongoDB:', err);
    process.exit(1);
  });

// Crear estudiante de prueba
async function createTestStudent() {
  try {
    // Eliminar estudiante existente si existe
    await Student.deleteOne({ email: 'demo@example.com' });
    
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash('password', 10);
    
    // Crear estudiante
    const student = new Student({
      name: 'Estudiante Demo',
      email: 'demo@example.com',
      password: hashedPassword,
      program: 'Ingeniería en Ciencias y Sistemas',
      knowledgeAreas: [
        {
          area: 'Historia',
          level: 65,
          strengths: ['Revolución Industrial', 'Guerras Mundiales'],
          weaknesses: ['Historia Antigua', 'Civilizaciones Mesoamericanas'],
          lastAssessment: new Date()
        },
        {
          area: 'Geografía',
          level: 78,
          strengths: ['Geografía de América', 'Hidrografía'],
          weaknesses: ['Geografía Política', 'Demografía'],
          lastAssessment: new Date()
        }
      ],
      completedLessons: [],
      completedAssessments: [
        {
          title: 'Evaluación: Historia de Mesoamérica',
          subject: 'historia',
          topics: ['Civilizaciones Mesoamericanas', 'Culturas Precolombinas'],
          completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 días atrás
          score: 65,
          correctAnswers: 13,
          totalQuestions: 20
        },
        {
          title: 'Evaluación: Geografía de América',
          subject: 'geografia',
          topics: ['Geografía de América', 'Hidrografía'],
          completedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 días atrás
          score: 80,
          correctAnswers: 16,
          totalQuestions: 20
        },
        {
          title: 'Evaluación: Historia Moderna',
          subject: 'historia',
          topics: ['Revolución Industrial', 'Guerras Mundiales'],
          completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 días atrás
          score: 75,
          correctAnswers: 15,
          totalQuestions: 20
        }
      ],
      points: 220
    });
    
    await student.save();
    console.log('Estudiante de prueba creado con éxito');
  } catch (error) {
    console.error('Error creando estudiante de prueba:', error);
  }
}

// Crear recursos de prueba
async function createTestResources() {
  try {
    // Eliminar recursos existentes
    await Resource.deleteMany({});
    
    // Definir recursos
    const resources = [
      // Recursos de Historia
      {
        title: 'Civilizaciones Mesoamericanas: Un panorama general',
        description: 'Lección sobre las principales culturas mesoamericanas y sus características distintivas.',
        type: 'lesson',
        subject: 'historia',
        topics: ['Civilizaciones Mesoamericanas', 'Culturas Precolombinas'],
        content: `<h2>Civilizaciones Mesoamericanas</h2>
                  <p>Las civilizaciones mesoamericanas florecieron en una región que abarca desde el centro de México hasta el norte de Centroamérica. Entre las más importantes se encuentran:</p>
                  <ul>
                    <li><strong>Olmecas:</strong> Considerados la cultura madre de Mesoamérica (1200-400 a.C.)</li>
                    <li><strong>Mayas:</strong> Conocidos por sus avances en matemáticas, astronomía y escritura (2000 a.C.-1500 d.C.)</li>
                    <li><strong>Toltecas:</strong> Influenciaron fuertemente a otras culturas de la región (900-1150 d.C.)</li>
                    <li><strong>Aztecas:</strong> Crearon un vasto imperio en el centro de México (1300-1521 d.C.)</li>
                  </ul>
                  <p>Estas civilizaciones compartían rasgos culturales como el uso de calendarios, juegos de pelota, agricultura de maíz y sistemas jerárquicos de gobierno.</p>`,
        difficulty: 'intermediate',
        duration: 25,
        tags: ['mesoamérica', 'culturas precolombinas', 'aztecas', 'mayas']
      },
      {
        title: 'Historia Antigua: Mesopotamia y Egipto',
        description: 'Estudio comparativo de las primeras grandes civilizaciones y su legado.',
        type: 'lesson',
        subject: 'historia',
        topics: ['Historia Antigua', 'Civilizaciones Antiguas'],
        content: `<h2>Primeras Civilizaciones: Mesopotamia y Egipto</h2>
                  <p>Mesopotamia y Egipto representan las primeras grandes civilizaciones de la humanidad, surgidas cerca de grandes ríos.</p>
                  <h3>Mesopotamia (Actual Irak)</h3>
                  <ul>
                    <li>Desarrollada entre los ríos Tigris y Éufrates</li>
                    <li>Primeras ciudades-estado: Ur, Uruk, Lagash</li>
                    <li>Aportaciones: escritura cuneiforme, código de Hammurabi, matemáticas</li>
                    <li>Culturas principales: sumerios, acadios, babilonios, asirios</li>
                  </ul>
                  <h3>Egipto</h3>
                  <ul>
                    <li>Civilización desarrollada a lo largo del río Nilo</li>
                    <li>Sistema político-religioso centrado en el faraón</li>
                    <li>Aportaciones: escritura jeroglífica, arquitectura monumental, medicina</li>
                    <li>Periodos: Predinástico, Imperio Antiguo, Medio y Nuevo</li>
                  </ul>`,
        difficulty: 'basic',
        duration: 30,
        tags: ['historia antigua', 'mesopotamia', 'egipto', 'primeras civilizaciones']
      },
      {
        title: 'La Revolución Industrial: Transformación Social y Económica',
        description: 'Análisis de los factores y consecuencias de la industrialización.',
        type: 'lesson',
        subject: 'historia',
        topics: ['Revolución Industrial', 'Historia Moderna'],
        content: `<h2>La Revolución Industrial</h2>
                  <p>La Revolución Industrial marcó una transformación radical en los métodos de producción, iniciando en Gran Bretaña en el siglo XVIII.</p>
                  <h3>Factores Clave</h3>
                  <ul>
                    <li>Innovaciones técnicas: máquina de vapor, telar mecánico</li>
                    <li>Revolución agrícola previa</li>
                    <li>Disponibilidad de capital y recursos</li>
                    <li>Crecimiento demográfico</li>
                  </ul>
                  <h3>Consecuencias</h3>
                  <ul>
                    <li>Urbanización acelerada</li>
                    <li>Surgimiento del proletariado industrial</li>
                    <li>Nuevas clases sociales</li>
                    <li>Transformación del transporte y comunicaciones</li>
                    <li>Impacto ambiental significativo</li>
                  </ul>`,
        difficulty: 'intermediate',
        duration: 35,
        tags: ['revolución industrial', 'industrialización', 'historia moderna']
      },
      
      // Recursos de Geografía
      {
        title: 'Hidrografía Mundial: Principales Sistemas Fluviales',
        description: 'Estudio de los grandes ríos y sistemas hidrográficos del mundo.',
        type: 'lesson',
        subject: 'geografia',
        topics: ['Hidrografía', 'Geografía Física'],
        content: `<h2>Principales Sistemas Fluviales del Mundo</h2>
                  <p>Los ríos son elementos fundamentales de los paisajes terrestres y fuentes vitales para las civilizaciones humanas.</p>
                  <h3>Principales Ríos por Continente</h3>
                  <h4>América</h4>
                  <ul>
                    <li><strong>Amazonas:</strong> El más caudaloso del mundo, recorre Brasil, Perú y Colombia</li>
                    <li><strong>Mississippi-Missouri:</strong> Extenso sistema fluvial de Norteamérica</li>
                  </ul>
                  <h4>Asia</h4>
                  <ul>
                    <li><strong>Yangtsé:</strong> El río más largo de Asia, vital para China</li>
                    <li><strong>Ganges:</strong> Río sagrado de la India</li>
                  </ul>
                  <h4>África</h4>
                  <ul>
                    <li><strong>Nilo:</strong> El río más largo del mundo, cuna de la civilización egipcia</li>
                    <li><strong>Congo:</strong> Segundo río más caudaloso después del Amazonas</li>
                  </ul>`,
        difficulty: 'basic',
        duration: 25,
        tags: ['hidrografía', 'ríos', 'cuencas hidrográficas', 'agua dulce']
      },
      {
        title: 'Geografía Política de América Latina',
        description: 'Análisis de las fronteras, divisiones políticas y relaciones entre los países latinoamericanos.',
        type: 'lesson',
        subject: 'geografia',
        topics: ['Geografía Política', 'Geografía de América'],
        content: `<h2>Geografía Política de América Latina</h2>
                  <p>América Latina comprende los territorios continentales e insulares americanos donde se hablan lenguas romances.</p>
                  <h3>Divisiones Principales</h3>
                  <ul>
                    <li><strong>México y América Central:</strong> 8 países desde México hasta Panamá</li>
                    <li><strong>Caribe:</strong> Cuba, República Dominicana, Puerto Rico y otras islas</li>
                    <li><strong>América del Sur:</strong> 12 países, desde Colombia hasta Argentina y Chile</li>
                  </ul>
                  <h3>Fronteras y Conflictos</h3>
                  <p>A lo largo de la historia, diversos conflictos fronterizos han modelado el mapa político actual:</p>
                  <ul>
                    <li>Guerra del Pacífico (1879-1883): Chile vs. Perú y Bolivia</li>
                    <li>Guerra del Chaco (1932-1935): Bolivia vs. Paraguay</li>
                    <li>Conflictos contemporáneos: disputas marítimas y terrestres</li>
                  </ul>`,
        difficulty: 'intermediate',
        duration: 30,
        tags: ['geografía política', 'fronteras', 'américa latina', 'conflictos territoriales']
      },
      {
        title: 'Demografía Mundial: Tendencias Actuales',
        description: 'Análisis de la distribución poblacional, tendencias demográficas y desafíos poblacionales globales.',
        type: 'lesson',
        subject: 'geografia',
        topics: ['Demografía', 'Geografía Humana'],
        content: `<h2>Tendencias Demográficas Globales</h2>
                  <p>La población mundial ha experimentado cambios significativos en su tamaño, distribución y composición.</p>
                  <h3>Distribución Poblacional</h3>
                  <ul>
                    <li>Asia concentra aproximadamente el 60% de la población mundial</li>
                    <li>China e India: los dos países más poblados (más de 1300 millones cada uno)</li>
                    <li>Contraste entre regiones densamente pobladas y áreas prácticamente deshabitadas</li>
                  </ul>
                  <h3>Tendencias Actuales</h3>
                  <ul>
                    <li><strong>Envejecimiento poblacional:</strong> Especialmente en países desarrollados</li>
                    <li><strong>Migraciones:</strong> Flujos de sur a norte y del campo a la ciudad</li>
                    <li><strong>Transición demográfica:</strong> Disminución de tasas de natalidad y mortalidad</li>
                    <li><strong>Urbanización acelerada:</strong> Crecimiento de megaciudades</li>
                  </ul>`,
        difficulty: 'advanced',
        duration: 40,
        tags: ['demografía', 'población', 'migraciones', 'urbanización']
      },
      
      // Videos externos
      {
        title: 'Civilizaciones Mesoamericanas: Mayas y Aztecas',
        description: 'Video documental sobre los avances científicos y culturales de mayas y aztecas.',
        type: 'video',
        subject: 'historia',
        topics: ['Civilizaciones Mesoamericanas', 'Culturas Precolombinas'],
        url: 'https://www.example.com/videos/civilizaciones-mesoamericanas',
        difficulty: 'basic',
        duration: 15,
        tags: ['mayas', 'aztecas', 'mesoamérica', 'video educativo']
      },
      {
        title: 'Geografía Física de América del Sur',
        description: 'Video explicativo sobre las principales características geográficas de Sudamérica.',
        type: 'video',
        subject: 'geografia',
        topics: ['Geografía de América', 'Geografía Física'],
        url: 'https://www.example.com/videos/geografia-sudamerica',
        difficulty: 'basic',
        duration: 12,
        tags: ['cordillera de los andes', 'amazonas', 'sudamérica', 'relieve']
      }
    ];
    
    // Insertar recursos
    await Resource.insertMany(resources);
    console.log(`${resources.length} recursos de prueba creados con éxito`);
  } catch (error) {
    console.error('Error creando recursos de prueba:', error);
  }
}

// Ejecutar inicialización
async function initializeDatabase() {
  try {
    await createTestStudent();
    await createTestResources();
    
    console.log('Inicialización de la base de datos completada');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error en la inicialización de la base de datos:', error);
    mongoose.disconnect();
    process.exit(1);
  }
}

// Iniciar proceso
initializeDatabase(); 