const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const User = require('../models/User');
const { evaluateOpenEndedResponse } = require('./aiController');

// Get all quizzes
exports.getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().select('title description category');
    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes
    });
  } catch (error) {
    console.error('Error al obtener quizzes:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

// Get single quiz
exports.getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Error al obtener quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

// Submit quiz
exports.submitQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body;
    const userId = req.user.id;
    
    // Find quiz
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz no encontrado'
      });
    }
    
    // Process answers and calculate score
    let totalScore = 0;
    let maxScore = 0;
    const processedAnswers = [];
    const strengths = [];
    const weaknesses = [];
    
    // Process each answer
    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];
      const question = quiz.questions[i];
      maxScore += question.points;
      
      let isCorrect = false;
      let score = 0;
      let feedback = '';
      
      // For multiple choice questions
      if (question.type === 'multiple-choice') {
        isCorrect = answer.userAnswer === question.correctAnswer;
        score = isCorrect ? question.points : 0;
        feedback = isCorrect ? 
          '¡Correcto!' : 
          `Respuesta incorrecta. La respuesta correcta es: ${question.correctAnswer}`;
      } 
      // For open-ended questions
      else if (question.type === 'open-ended') {
        const evaluation = await evaluateOpenEndedResponse(
          answer.userAnswer, 
          question.correctAnswer
        );
        
        score = Math.round((evaluation.score / 100) * question.points);
        feedback = evaluation.feedback;
        
        // Add to strengths/weaknesses
        if (evaluation.strengths && evaluation.strengths.length > 0) {
          strengths.push(...evaluation.strengths);
        }
        if (evaluation.suggestions && evaluation.suggestions.length > 0) {
          weaknesses.push(...evaluation.suggestions);
        }
      }
      
      totalScore += score;
      
      // Add to processed answers
      processedAnswers.push({
        question: question._id,
        userAnswer: answer.userAnswer,
        isCorrect,
        feedback,
        score
      });
    }
    
    // Generate recommendations based on weaknesses
    const recommendations = weaknesses.map(weakness => {
      return {
        title: `Mejora en: ${weakness.substring(0, 30)}...`,
        description: weakness,
        resourceUrl: '/library.html',
        type: 'article'
      };
    });
    
    // Create quiz result
    const quizResult = new QuizResult({
      user: userId,
      quiz: quizId,
      score: totalScore,
      maxScore,
      answers: processedAnswers,
      strengths,
      weaknesses,
      recommendations
    });
    
    await quizResult.save();
    
    res.status(201).json({
      success: true,
      data: quizResult
    });
  } catch (error) {
    console.error('Error al enviar quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

// Get user quiz results
exports.getUserQuizResults = async (req, res) => {
  try {
    const results = await QuizResult.find({ user: req.user.id })
      .populate('quiz', 'title category')
      .sort('-completedAt');
    
    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('Error al obtener resultados:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

// Get single quiz result
exports.getQuizResult = async (req, res) => {
  try {
    const result = await QuizResult.findById(req.params.id)
      .populate('quiz')
      .populate('user', 'username email');
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Resultado no encontrado'
      });
    }
    
    // Ensure user can only access their own results
    if (result.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para ver este resultado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error al obtener resultado:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
}; 