// Renderizar lista de quizzes
function renderQuizList(quizzes) {
  const quizzesContainer = document.getElementById('quizzes-container');
  if (!quizzesContainer) return;
  
  quizzesContainer.innerHTML = `
    <h2>Evaluaciones disponibles</h2>
    <div class="quiz-grid">
      ${quizzes.map(quiz => `
        <div class="quiz-card">
          <h3>${quiz.title}</h3>
          <p>${quiz.description}</p>
          <div class="category">${quiz.category}</div>
          <a href="quiz.html?id=${quiz._id}" class="btn btn-primary">Iniciar</a>
        </div>
      `).join('')}
    </div>
  `;
}

// Cargar progreso del estudiante
async function loadStudentProgress() {
  if (!token) {
    showAlert('Debes iniciar sesión para ver tu progreso', 'warning');
    window.location.href = 'login.html';
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/quizzes/results`, {
      headers: {
        'x-auth-token': token
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      renderStudentProgress(data.data);
    } else {
      showAlert(data.message, 'error');
    }
  } catch (error) {
    console.error('Error cargando progreso:', error);
    showAlert('Error de conexión', 'error');
  }
}

// Renderizar progreso del estudiante
function renderStudentProgress(results) {
  const progressContainer = document.getElementById('progress-container');
  if (!progressContainer) return;
  
  // Calcular estadísticas
  const totalQuizzes = results.length;
  const totalScore = results.reduce((acc, result) => acc + result.score, 0);
  const totalMaxScore = results.reduce((acc, result) => acc + result.maxScore, 0);
  const averagePercentage = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;
  
  // Categorizar por área
  const areaStats = {};
  results.forEach(result => {
    const category = result.quiz.category;
    if (!areaStats[category]) {
      areaStats[category] = {
        count: 0,
        score: 0,
        maxScore: 0
      };
    }
    
    areaStats[category].count++;
    areaStats[category].score += result.score;
    areaStats[category].maxScore += result.maxScore;
  });
  
  // Convertir a array para renderizar
  const areasData = Object.keys(areaStats).map(area => {
    const data = areaStats[area];
    const percentage = data.maxScore > 0 ? Math.round((data.score / data.maxScore) * 100) : 0;
    return {
      area,
      count: data.count,
      percentage
    };
  });
  
  progressContainer.innerHTML = `
    <div class="progress-header">
      <h2>Tu progreso</h2>
      <div class="progress-summary">
        <div class="stat">
          <div class="stat-value">${totalQuizzes}</div>
          <div class="stat-label">Evaluaciones completadas</div>
        </div>
        <div class="stat">
          <div class="stat-value">${averagePercentage}%</div>
          <div class="stat-label">Promedio general</div>
        </div>
      </div>
    </div>
    
    <div class="progress-areas">
      <h3>Progreso por área</h3>
      <div class="areas-grid">
        ${areasData.map(area => `
          <div class="area-card">
            <h4>${area.area}</h4>
            <div class="area-stat">
              <div class="progress-bar">
                <div class="progress" style="width: ${area.percentage}%"></div>
              </div>
              <div class="percentage">${area.percentage}%</div>
            </div>
            <div class="count">${area.count} evaluación(es)</div>
          </div>
        `).join('')}
      </div>
    </div>
    
    <div class="recent-results">
      <h3>Evaluaciones recientes</h3>
      <div class="results-list">
        ${results.slice(0, 5).map(result => `
          <div class="result-item">
            <div class="result-title">${result.quiz.title}</div>
            <div class="result-score">${result.score}/${result.maxScore} (${Math.round((result.score / result.maxScore) * 100)}%)</div>
            <div class="result-date">${new Date(result.completedAt).toLocaleDateString()}</div>
            <a href="quiz-result.html?id=${result._id}" class="btn btn-sm btn-secondary">Ver detalles</a>
          </div>
        `).join('')}
      </div>
      <a href="quiz-history.html" class="btn btn-primary">Ver historial completo</a>
    </div>
  `;
}

// Inicializar página basado en URL
document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname.split('/').pop();
  
  // Verificar autenticación para páginas que lo requieren
  if (currentPage !== 'index.html' && 
      currentPage !== 'login.html' && 
      currentPage !== 'register.html') {
    checkAuth();
  }
  
  // Inicializar según la página
  if (currentPage === 'quizzes.html') {
    loadQuizzes();
  } else if (currentPage === 'quiz.html') {
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('id');
    if (quizId) {
      loadQuiz(quizId);
    } else {
      showAlert('ID de quiz no especificado', 'error');
      window.location.href = 'quizzes.html';
    }
  } else if (currentPage === 'quiz-result.html') {
    const urlParams = new URLSearchParams(window.location.search);
    const resultId = urlParams.get('id');
    if (resultId) {
      loadQuizResult(resultId);
    } else {
      showAlert('ID de resultado no especificado', 'error');
      window.location.href = 'student-dashboard.html';
    }
  } else if (currentPage === 'student-dashboard.html') {
    loadStudentProgress();
  }
}); 