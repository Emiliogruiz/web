const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Registrar usuario
// @access  Public
router.post('/register', authController.register);

// @route   POST /api/auth/login
// @desc    Iniciar sesión
// @access  Public
router.post('/login', authController.login);

// @route   GET /api/auth/user
// @desc    Obtener usuario actual
// @access  Private
router.get('/user', auth, authController.getCurrentUser);

module.exports = router; 