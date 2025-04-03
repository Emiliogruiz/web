const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Registrar nuevo usuario
exports.register = async (req, res) => {
  try {
    const { username, email, password, program } = req.body;
    
    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'El email o nombre de usuario ya está registrado'
      });
    }
    
    // Crear usuario inicial con áreas de conocimiento básicas
    const user = new User({
      username,
      email,
      password,
      program,
      knowledgeAreas: [
        {
          area: 'Historia',
          level: 10,
          strengths: [],
          weaknesses: ['Conocimiento básico']
        },
        {
          area: 'Geografía',
          level: 10,
          strengths: [],
          weaknesses: ['Conocimiento básico']
        }
      ]
    });
    
    await user.save();
    
    // Crear token JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        program: user.program
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

// Iniciar sesión
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Buscar usuario
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }
    
    // Verificar contraseña
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }
    
    // Crear token JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        program: user.program
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

// Obtener usuario actual
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
}; 