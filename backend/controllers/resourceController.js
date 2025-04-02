const Resource = require('../models/Resource');

// Obtener todos los recursos
exports.getAllResources = async (req, res) => {
  try {
    const { subject, type, difficulty, limit } = req.query;
    
    // Construir filtros
    const filters = {};
    
    if (subject) {
      filters.subject = subject;
    }
    
    if (type) {
      filters.type = type;
    }
    
    if (difficulty) {
      filters.difficulty = difficulty;
    }
    
    // Limitar resultados
    const resultsLimit = limit ? parseInt(limit) : 20;
    
    const resources = await Resource.find(filters)
      .sort({ createdAt: -1 })
      .limit(resultsLimit);
    
    res.json({
      success: true,
      resources
    });
  } catch (error) {
    console.error('Error obteniendo recursos:', error);
    res.status(500).json({
      error: 'Error obteniendo recursos'
    });
  }
};

// Obtener recurso por ID
exports.getResourceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const resource = await Resource.findById(id);
    
    if (!resource) {
      return res.status(404).json({
        error: 'Recurso no encontrado'
      });
    }
    
    res.json({
      success: true,
      resource
    });
  } catch (error) {
    console.error('Error obteniendo recurso:', error);
    res.status(500).json({
      error: 'Error obteniendo recurso'
    });
  }
};

// Buscar recursos
exports.searchResources = async (req, res) => {
  try {
    const { query, subject, type, difficulty, limit } = req.query;
    
    if (!query) {
      return res.status(400).json({
        error: 'Se requiere término de búsqueda'
      });
    }
    
    // Construir filtros
    const filters = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { topics: { $in: [new RegExp(query, 'i')] } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    };
    
    if (subject) {
      filters.subject = subject;
    }
    
    if (type) {
      filters.type = type;
    }
    
    if (difficulty) {
      filters.difficulty = difficulty;
    }
    
    // Limitar resultados
    const resultsLimit = limit ? parseInt(limit) : 10;
    
    const resources = await Resource.find(filters)
      .sort({ createdAt: -1 })
      .limit(resultsLimit);
    
    res.json({
      success: true,
      resources
    });
  } catch (error) {
    console.error('Error buscando recursos:', error);
    res.status(500).json({
      error: 'Error buscando recursos'
    });
  }
};

module.exports = {
  getAllResources,
  getResourceById,
  searchResources
}; 