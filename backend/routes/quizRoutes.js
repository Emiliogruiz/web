const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const auth = require('../middleware/auth');

// @route   GET /api/quizzes
// @desc    Get all quizzes
// @access  Public
router.get('/', quizController.getQuizzes);

// @route   GET /api/quizzes/:id
// @desc    Get single quiz
// @access  Public
router.get('/:id', quizController.getQuiz);

// @route   POST /api/quizzes/submit
// @desc    Submit quiz
// @access  Private
router.post('/submit', auth, quizController.submitQuiz);

// @route   GET /api/quizzes/results
// @desc    Get user quiz results
// @access  Private
router.get('/results', auth, quizController.getUserQuizResults);

// @route   GET /api/quizzes/results/:id
// @desc    Get single quiz result
// @access  Private
router.get('/results/:id', auth, quizController.getQuizResult);

module.exports = router; 