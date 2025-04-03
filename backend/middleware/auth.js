const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Obtener token del header
  const token = req.header('x-auth-token');
  
  // Verificar si no hay token
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token, acceso denegado'
    });
  }
  
  try {
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Agregar usuario al request
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
}; 