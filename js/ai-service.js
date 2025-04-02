/**
 * Clase que proporciona servicios de integración con IA para la plataforma educativa
 */
class AIEducationService {
  /**
   * Inicializa el servicio de IA
   */
  constructor() {
    this.apiUrl = '/api';
    this.token = this.getValidatedToken();
    this.studentId = localStorage.getItem('student_id');
    this.studentData = null;
    this.retryAttempts = 3;
    this.retryDelay = 1000;
  }

  getValidatedToken() {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp < Date.now() / 1000) {
        localStorage.removeItem('auth_token');
        return null;
      }
      return token;
    } catch (e) {
      console.error('Error validando token:', e);
      return token;
    }
  }

  /**
   * Realiza una petición con reintentos automáticos
   */
  async fetchWithRetry(url, options, attempts = this.retryAttempts) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      if (attempts > 1) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.fetchWithRetry(url, options, attempts - 1);
      }
      throw error;
    }
  }

  /**
   * Inicializa el servicio con manejo mejorado de errores
   */
  async initialize() {
    try {
      if (!this.token || !this.studentId) {
        throw new Error('No hay autenticación');
      }
      
      await this.loadStudentData();
      await this.initializePageComponents();
      
      // Inicializar sistema de eventos
      this.setupEventListeners();
      
      // Verificar actualizaciones pendientes
      await this.checkPendingUpdates();
    } catch (error) {
      console.error('Error inicializando servicio IA:', error);
      this.handleInitializationError(error);
    }
  }

  /**
   * Maneja errores de inicialización
   */
  handleInitializationError(error) {
    const errorContainer = document.getElementById('error-container') || 
                         this.createErrorContainer();
    
    errorContainer.innerHTML = `
      <div class="alert alert-danger alert-dismissible fade show" role="alert">
        <strong>Error de inicialización:</strong> ${error.message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
  }

  /**
   * Crea un contenedor para mensajes de error
   */
  createErrorContainer() {
    const container = document.createElement('div');
    container.id = 'error-container';
    container.className = 'position-fixed top-0 start-50 translate-middle-x p-3';
    container.style.zIndex = '1050';
    document.body.appendChild(container);
    return container;
  }

  /**
   * Configura listeners de eventos
   */
  setupEventListeners() {
    // Listener para cambios en la conexión
    window.addEventListener('online', () => this.handleConnectionChange(true));
    window.addEventListener('offline', () => this.handleConnectionChange(false));
    
    // Listener para cambios en el almacenamiento
    window.addEventListener('storage', (e) => this.handleStorageChange(e));
  }

  /**
   * Maneja cambios en la conexión
   */
  handleConnectionChange(isOnline) {
    const statusElement = document.getElementById('connection-status');
    if (statusElement) {
      statusElement.className = `connection-status ${isOnline ? 'online' : 'offline'}`;
      statusElement.textContent = isOnline ? 'Conectado' : 'Desconectado';
    }

    if (!isOnline) {
      this.enableOfflineMode();
    } else {
      this.syncOfflineData();
    }
  }

  /**
   * Habilita modo sin conexión
   */
  enableOfflineMode() {
    // Implementar lógica para modo sin conexión
    console.log('Modo sin conexión activado');
  }

  /**
   * Sincroniza datos guardados sin conexión
   */
  async syncOfflineData() {
    try {
      const offlineData = localStorage.getItem('offlineData');
      if (offlineData) {
        const parsedData = JSON.parse(offlineData);
        await this.syncData(parsedData);
        localStorage.removeItem('offlineData');
      }
    } catch (error) {
      console.error('Error sincronizando datos offline:', error);
    }
  }

  /**
   * Carga los datos del estudiante
   */
  async loadStudentData() {
    try {
      const response = await fetch(`${this.apiUrl}/students/${this.studentId}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      
      if (!response.ok) throw new Error('Error cargando datos del estudiante');
      
      const data = await response.json();
      this.studentData = data.student;
    } catch (error) {
      console.error('Error cargando datos del estudiante:', error);
    }
  }
  
  /**
   * Inicializa el dashboard del estudiante
   */
  async initializeStudentDashboard() {
    try {
      // Inicializar chat con IA
      this.initializeAIChat();
      
      // Cargar gráficos
      await this.loadDashboardCharts();
      
      // Cargar recomendaciones
      await this.loadRecommendations();
      
      // Cargar fortalezas y debilidades
      await this.loadStrengthsWeaknesses();
    } catch (error) {
      console.error('Error inicializando dashboard:', error);
    }
  }
  
  /**
   * Inicializa la página de biblioteca
   */
  async initializeLibrary() {
    // Implementación pendiente
  }

  /**
   * Carga los gráficos para el dashboard
   */
  async loadDashboardCharts() {
    try {
      const response = await fetch(`${this.apiUrl}/students/${this.studentId}/charts`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      
      if (!response.ok) throw new Error('Error al cargar datos de gráficos');
      
      const data = await response.json();
      
      // Inicializar gráficos con los datos recibidos
      this.initializeProgressChart(data.progressData);
      this.initializeSkillsRadarChart(data.skillsData);
      this.initializeEvaluationHistoryChart(data.evaluationHistory);
    } catch (error) {
      console.error('Error cargando gráficos:', error);
      // Mostrar mensaje de error en los contenedores de gráficos
      this.showChartError('progressChart');
      this.showChartError('skillsRadarChart');
      this.showChartError('evaluationHistoryChart');
    }
  }

  /**
   * Inicializa el gráfico de progreso con datos reales
   */
  initializeProgressChart(progressData) {
    const progressChartElement = document.getElementById('progressChart');
    if (!progressChartElement) return;
    
    // Mostrar el canvas y ocultar el placeholder
    progressChartElement.style.display = 'block';
    const chartPlaceholder = progressChartElement.closest('.chart-container').querySelector('.chart-placeholder');
    if (chartPlaceholder) {
      chartPlaceholder.style.display = 'none';
    }
    
    // Crear el gráfico
    const ctx = progressChartElement.getContext('2d');
    const progressChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: progressData.labels,
        datasets: progressData.datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Progreso de Aprendizaje'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'Nivel de Comprensión (%)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Fecha'
            }
          }
        }
      }
    });
  }

  /**
   * Inicializa el gráfico de radar de habilidades
   */
  initializeSkillsRadarChart(skillsData) {
    const skillsRadarElement = document.getElementById('skillsRadarChart');
    if (!skillsRadarElement) return;
    
    // Mostrar el canvas y ocultar el placeholder
    skillsRadarElement.style.display = 'block';
    const chartPlaceholder = skillsRadarElement.closest('#skills-radar-container').querySelector('.chart-placeholder');
    if (chartPlaceholder) {
      chartPlaceholder.style.display = 'none';
    }
    
    // Crear el gráfico
    const ctx = skillsRadarElement.getContext('2d');
    const skillsChart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: skillsData.skills,
        datasets: [
          {
            label: 'Tus Habilidades',
            data: skillsData.currentLevels,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            pointBackgroundColor: 'rgba(54, 162, 235, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(54, 162, 235, 1)'
          },
          {
            label: 'Nivel Óptimo',
            data: skillsData.optimalLevels,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            pointBackgroundColor: 'rgba(255, 99, 132, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(255, 99, 132, 1)'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: {
              display: true
            },
            suggestedMin: 0,
            suggestedMax: 100
          }
        }
      }
    });
  }

  /**
   * Inicializa el gráfico de historial de evaluaciones
   */
  initializeEvaluationHistoryChart(historyData) {
    const historyChartElement = document.getElementById('evaluationHistoryChart');
    if (!historyChartElement) return;
    
    // Mostrar el canvas y ocultar el placeholder
    historyChartElement.style.display = 'block';
    const chartPlaceholder = historyChartElement.closest('.chart-placeholder');
    if (chartPlaceholder) {
      chartPlaceholder.style.display = 'none';
    }
    
    // Crear el gráfico
    const ctx = historyChartElement.getContext('2d');
    const historyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: historyData.dates,
        datasets: [
          {
            label: 'Calificaciones',
            data: historyData.scores,
            backgroundColor: historyData.scores.map(score => 
              score >= 80 ? 'rgba(75, 192, 192, 0.7)' : 
              score >= 60 ? 'rgba(255, 206, 86, 0.7)' : 
              'rgba(255, 99, 132, 0.7)'
            ),
            borderColor: historyData.scores.map(score => 
              score >= 80 ? 'rgba(75, 192, 192, 1)' : 
              score >= 60 ? 'rgba(255, 206, 86, 1)' : 
              'rgba(255, 99, 132, 1)'
            ),
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'Calificación (%)'
            }
          }
        }
      }
    });
    
    // Cargar tabla de historial de evaluaciones
    this.populateEvaluationHistoryTable(historyData.evaluations);
  }

  /**
   * Muestra un error en un contenedor de gráfico
   */
  showChartError(chartId) {
    const chartElement = document.getElementById(chartId);
    if (!chartElement) return;
    
    const container = chartElement.closest('.chart-container') || chartElement.parentElement;
    if (container) {
      // Ocultar el canvas
      chartElement.style.display = 'none';
      
      // Eliminar placeholder existente si hay
      const existingPlaceholder = container.querySelector('.chart-placeholder');
      if (existingPlaceholder) {
        existingPlaceholder.remove();
      }
      
      // Agregar mensaje de error
      const errorElement = document.createElement('div');
      errorElement.className = 'chart-error text-center p-4 text-danger';
      errorElement.innerHTML = `
        <i class="bi bi-exclamation-triangle fs-1"></i>
        <p class="mt-3">No se pudieron cargar los datos del gráfico</p>
        <button class="btn btn-sm btn-outline-secondary mt-2 retry-chart-button" data-chart-id="${chartId}">
          <i class="bi bi-arrow-clockwise"></i> Reintentar
        </button>
      `;
      container.appendChild(errorElement);
      
      // Agregar listener para reintentar
      const retryButton = errorElement.querySelector('.retry-chart-button');
      if (retryButton) {
        retryButton.addEventListener('click', () => {
          errorElement.remove();
          this.loadDashboardCharts();
        });
      }
    }
  }

  /**
   * Carga las recomendaciones personalizadas
   */
  async loadRecommendations() {
    try {
      const response = await fetch(`${this.apiUrl}/recommendations?studentId=${this.studentId}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      
      if (!response.ok) throw new Error('Error al cargar recomendaciones');
      
      const data = await response.json();
      
      // Actualizar recomendación principal
      const aiRecommendationElement = document.getElementById('ai-recommendation');
      if (aiRecommendationElement) {
        aiRecommendationElement.textContent = data.mainRecommendation;
        aiRecommendationElement.classList.remove('data-placeholder-ai');
      }
      
      // Actualizar actividades recomendadas
      const activitiesContainer = document.getElementById('recommended-activities-container');
      if (activitiesContainer && data.recommendedActivities.length > 0) {
        activitiesContainer.innerHTML = ''; // Limpiar placeholder
        
        // Renderizar cada actividad recomendada
        data.recommendedActivities.forEach(activity => {
          const activityElement = document.createElement('a');
          activityElement.href = activity.url || "#";
          activityElement.className = 'list-group-item list-group-item-action';
          
          activityElement.innerHTML = `
            <div class="d-flex w-100 justify-content-between">
              <h6 class="mb-1">${activity.title}</h6>
              <small class="text-primary">${activity.category}</small>
            </div>
            <p class="mb-1">${activity.description}</p>
            <div class="d-flex justify-content-between align-items-center">
              <small class="text-muted"><i class="bi bi-clock"></i> ${activity.duration}</small>
              <span class="badge ${activity.badgeClass}">${activity.badgeText}</span>
            </div>
          `;
          
          activitiesContainer.appendChild(activityElement);
        });
      } else if (activitiesContainer) {
        activitiesContainer.innerHTML = `
          <div class="alert alert-info">
            <i class="bi bi-info-circle me-2"></i>
            <span>Aún no tenemos recomendaciones personalizadas para ti.</span>
            <p class="mt-2 mb-0">Para recibir recomendaciones, completa algunas evaluaciones y actividades.</p>
          </div>
          <div class="mt-3">
            <a href="quiz.html" class="btn btn-primary">
              <i class="bi bi-journal-check me-2"></i>Realizar una evaluación
            </a>
          </div>
        `;
      }
    } catch (error) {
      console.error('Error cargando recomendaciones:', error);
      this.showRecommendationsError();
    }
  }

  /**
   * Muestra un error al cargar recomendaciones
   */
  showRecommendationsError() {
    const activitiesContainer = document.getElementById('recommended-activities-container');
    if (activitiesContainer) {
      activitiesContainer.innerHTML = `
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-circle-fill me-2"></i>
          <span>No se pudieron cargar las recomendaciones. Por favor, intenta más tarde.</span>
        </div>
      `;
    }
    
    const aiRecommendationElement = document.getElementById('ai-recommendation');
    if (aiRecommendationElement) {
      aiRecommendationElement.textContent = "No se pudo cargar la recomendación personalizada. Por favor, intenta más tarde.";
      aiRecommendationElement.classList.remove('data-placeholder-ai');
    }
  }

  /**
   * Carga fortalezas y debilidades del estudiante
   */
  async loadStrengthsWeaknesses() {
    try {
      const response = await fetch(`${this.apiUrl}/students/${this.studentId}/analysis`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      
      if (!response.ok) throw new Error('Error al cargar análisis de fortalezas y debilidades');
      
      const data = await response.json();
      
      // Actualizar container de fortalezas
      const strengthsContainer = document.getElementById('strengths-container');
      if (strengthsContainer && data.strengths && data.strengths.length > 0) {
        strengthsContainer.innerHTML = '';
        
        const strengthsList = document.createElement('ul');
        strengthsList.className = 'list-group';
        
        data.strengths.forEach(strength => {
          const item = document.createElement('li');
          item.className = 'list-group-item d-flex justify-content-between align-items-center';
          item.innerHTML = `
            ${strength.topic}
            <span class="badge bg-success rounded-pill">${strength.level}%</span>
          `;
          strengthsList.appendChild(item);
        });
        
        strengthsContainer.appendChild(strengthsList);
      } else if (strengthsContainer) {
        strengthsContainer.innerHTML = `
          <div class="text-center py-3">
            <p class="text-muted">No hay suficientes datos para determinar fortalezas</p>
          </div>
        `;
      }
      
      // Actualizar container de debilidades
      const weaknessesContainer = document.getElementById('weaknesses-container');
      if (weaknessesContainer && data.weaknesses && data.weaknesses.length > 0) {
        weaknessesContainer.innerHTML = '';
        
        const weaknessesList = document.createElement('ul');
        weaknessesList.className = 'list-group';
        
        data.weaknesses.forEach(weakness => {
          const item = document.createElement('li');
          item.className = 'list-group-item d-flex justify-content-between align-items-center';
          item.innerHTML = `
            ${weakness.topic}
            <span class="badge bg-warning text-dark rounded-pill">${weakness.level}%</span>
          `;
          weaknessesList.appendChild(item);
        });
        
        weaknessesContainer.appendChild(weaknessesList);
      } else if (weaknessesContainer) {
        weaknessesContainer.innerHTML = `
          <div class="text-center py-3">
            <p class="text-muted">No hay suficientes datos para determinar áreas de mejora</p>
          </div>
        `;
      }
      
      // Actualizar recomendaciones para fortalezas y debilidades
      const strengthsRecommendation = document.querySelector('[data-ai-field="strengths-recommendation"]');
      if (strengthsRecommendation) {
        strengthsRecommendation.textContent = data.strengthsRecommendation;
        strengthsRecommendation.classList.remove('data-placeholder');
      }
      
      const weaknessesRecommendation = document.querySelector('[data-ai-field="weaknesses-recommendation"]');
      if (weaknessesRecommendation) {
        weaknessesRecommendation.textContent = data.weaknessesRecommendation;
        weaknessesRecommendation.classList.remove('data-placeholder');
      }
    } catch (error) {
      console.error('Error cargando análisis:', error);
      this.showAnalysisError();
    }
  }

  /**
   * Muestra error al cargar análisis de fortalezas y debilidades
   */
  showAnalysisError() {
    const strengthsContainer = document.getElementById('strengths-container');
    if (strengthsContainer) {
      strengthsContainer.innerHTML = `
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-circle-fill me-2"></i>
          <span>No se pudo cargar el análisis de fortalezas. Por favor, intenta más tarde.</span>
        </div>
      `;
    }
    
    const weaknessesContainer = document.getElementById('weaknesses-container');
    if (weaknessesContainer) {
      weaknessesContainer.innerHTML = `
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-circle-fill me-2"></i>
          <span>No se pudo cargar el análisis de debilidades. Por favor, intenta más tarde.</span>
        </div>
      `;
    }
  }

  /**
   * Inicializa y configura el chat con IA
   */
  initializeAIChat() {
    const sendButton = document.getElementById('send-ai-message');
    const suggestionButtons = document.querySelectorAll('.suggestion-btn');
    const chatContainer = document.getElementById('ai-chat-container');
    const aiInput = document.getElementById('ai-input');
    
    if (sendButton && chatContainer && aiInput) {
      // Limpiar el contenedor de chat inicial
      chatContainer.innerHTML = '';
      
      // Añadir mensaje de bienvenida de la IA
      this.addAIMessage("Hola, soy tu asistente de aprendizaje. ¿En qué puedo ayudarte hoy?");
      
      // Manejar envío de mensaje por botón
      sendButton.addEventListener('click', () => {
        this.sendMessageToAI(aiInput.value);
      });
      
      // Manejar envío de mensaje con Enter
      aiInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.sendMessageToAI(aiInput.value);
          e.preventDefault();
        }
      });
      
      // Manejar sugerencias predefinidas
      suggestionButtons.forEach(button => {
        button.addEventListener('click', () => {
          const suggestionText = button.textContent;
          aiInput.value = suggestionText;
          this.sendMessageToAI(suggestionText);
        });
      });
    }
  }

  /**
   * Envía un mensaje al servicio de IA y muestra la respuesta
   */
  async sendMessageToAI(message) {
    const aiInput = document.getElementById('ai-input');
    const chatContainer = document.getElementById('ai-chat-container');
    
    if (!message || !message.trim() || !chatContainer) return;
    
    // Añadir mensaje del usuario
    this.addUserMessage(message);
    
    // Limpiar el input
    if (aiInput) aiInput.value = '';
    
    try {
      // Mostrar indicador de escritura
      this.showTypingIndicator();
      
      // Llamar a la API para obtener respuesta de IA
      const response = await fetch(`${this.apiUrl}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          message,
          studentId: this.studentId,
          context: {
            currentPage: window.location.pathname,
            userProfile: this.studentData || {}
          }
        })
      });
      
      if (!response.ok) throw new Error('Error en la comunicación con el servicio de IA');
      
      const data = await response.json();
      
      // Eliminar indicador de escritura
      this.removeTypingIndicator();
      
      // Añadir respuesta de la IA
      this.addAIMessage(data.message);
      
      // Si hay acciones recomendadas, ejecutarlas
      if (data.actions && Array.isArray(data.actions) && data.actions.length > 0) {
        this.processAIActions(data.actions);
      }
    } catch (error) {
      console.error('Error en comunicación con IA:', error);
      
      // Eliminar indicador de escritura
      this.removeTypingIndicator();
      
      // Mostrar mensaje de error
      this.addAIMessage("Lo siento, he tenido un problema al procesar tu solicitud. Por favor, intenta de nuevo más tarde.");
    }
  }

  /**
   * Añade un mensaje del usuario al chat
   */
  addUserMessage(message) {
    const chatContainer = document.getElementById('ai-chat-container');
    if (!chatContainer) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = 'user-message';
    messageElement.innerHTML = `
      <p class="mb-0">${this.escapeHtml(message)}</p>
      <small class="text-muted">tú, ahora</small>
    `;
    
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  /**
   * Añade un mensaje de la IA al chat
   */
  addAIMessage(message) {
    const chatContainer = document.getElementById('ai-chat-container');
    if (!chatContainer) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = 'ai-message';
    messageElement.innerHTML = `
      <p class="mb-0">${this.formatAIMessage(message)}</p>
      <small class="text-muted">IA, ahora</small>
    `;
    
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  /**
   * Muestra el indicador de escritura de la IA
   */
  showTypingIndicator() {
    const chatContainer = document.getElementById('ai-chat-container');
    if (!chatContainer) return;
    
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'ai-message typing-indicator';
    typingIndicator.id = 'typing-indicator';
    typingIndicator.innerHTML = `
      <div class="d-flex align-items-center">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
    
    chatContainer.appendChild(typingIndicator);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  /**
   * Elimina el indicador de escritura
   */
  removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  /**
   * Formatea el mensaje de la IA (convierte URLs en enlaces, etc)
   */
  formatAIMessage(message) {
    if (!message) return '';
    
    // Escapar HTML primero
    let formattedMessage = this.escapeHtml(message);
    
    // Convertir URLs en links
    formattedMessage = formattedMessage.replace(
      /(https?:\/\/[^\s]+)/g, 
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    
    // Convertir markdown básico (negrita)
    formattedMessage = formattedMessage.replace(
      /\*\*(.*?)\*\*/g, 
      '<strong>$1</strong>'
    );
    
    // Convertir markdown básico (itálica)
    formattedMessage = formattedMessage.replace(
      /\*(.*?)\*/g, 
      '<em>$1</em>'
    );
    
    // Convertir saltos de línea
    formattedMessage = formattedMessage.replace(/\n/g, '<br>');
    
    return formattedMessage;
  }

  /**
   * Escapa caracteres HTML para evitar XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Procesa acciones sugeridas por la IA
   */
  processAIActions(actions) {
    if (!Array.isArray(actions)) return;
    
    actions.forEach(action => {
      switch (action.type) {
        case 'navigate':
          if (action.url) {
            // Mostrar confirmación antes de navegar
            if (confirm(`¿Deseas ir a ${action.description || action.url}?`)) {
              window.location.href = action.url;
            }
          }
          break;
          
        case 'show_resource':
          if (action.resourceId) {
            // Aquí se podría mostrar un modal con el recurso
            this.showResource(action.resourceId, action.resourceType);
          }
          break;
          
        case 'update_ui':
          if (action.elementId && action.content) {
            const element = document.getElementById(action.elementId);
            if (element) {
              element.innerHTML = action.content;
            }
          }
          break;
      }
    });
  }

  /**
   * Inicializa la página de evaluación
   */
  async initializeAssessment() {
    try {
      // Obtener ID de la evaluación de la URL
      const urlParams = new URLSearchParams(window.location.search);
      const assessmentId = urlParams.get('id');
      
      if (!assessmentId) {
        // Si no hay ID, mostrar generador de evaluación
        this.showAssessmentGenerator();
        return;
      }
      
      // Cargar evaluación existente
      await this.loadAssessment(assessmentId);
      
      // Inicializar sistema de retroalimentación
      this.initializeFeedbackSystem();
      
      // Configurar navegación de preguntas
      this.setupQuestionNavigation();
    } catch (error) {
      console.error('Error inicializando evaluación:', error);
    }
  }

  /**
   * Muestra el generador de evaluaciones
   */
  showAssessmentGenerator() {
    const mainContent = document.querySelector('.container > .row');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
      <div class="col-lg-8 mx-auto">
        <div class="card">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0"><i class="bi bi-journal-check"></i> Generar Nueva Evaluación</h5>
          </div>
          <div class="card-body">
            <p>Genera una evaluación adaptativa basada en tu perfil de aprendizaje.</p>
            
            <form id="assessment-generator-form">
              <div class="mb-3">
                <label for="subject" class="form-label">Materia</label>
                <select class="form-select" id="subject" required>
                  <option value="" selected disabled>Selecciona una materia</option>
                  <option value="historia">Historia</option>
                  <option value="geografia">Geografía</option>
                </select>
              </div>
              
              <div class="mb-3">
                <label for="difficulty" class="form-label">Dificultad</label>
                <select class="form-select" id="difficulty">
                  <option value="auto" selected>Automática (basada en tu nivel)</option>
                  <option value="basic">Básica</option>
                  <option value="intermediate">Intermedia</option>
                  <option value="advanced">Avanzada</option>
                </select>
              </div>
              
              <div class="form-check mb-3">
                <input class="form-check-input" type="checkbox" value="" id="focus-weaknesses" checked>
                <label class="form-check-label" for="focus-weaknesses">
                  Enfocarse en mis áreas de mejora
                </label>
              </div>
              
              <div class="d-grid gap-2">
                <button type="submit" class="btn btn-primary">
                  <i class="bi bi-play-fill"></i> Generar Evaluación
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
    
    // Agregar listener para el formulario
    const form = document.getElementById('assessment-generator-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const subject = document.getElementById('subject').value;
        const difficulty = document.getElementById('difficulty').value;
        const focusWeaknesses = document.getElementById('focus-weaknesses').checked;
        
        try {
          // Mostrar estado de carga
          form.innerHTML = `
            <div class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Generando evaluación...</span>
              </div>
              <p class="mt-3">Generando evaluación adaptativa basada en tu perfil...</p>
              <p class="small text-muted">Esto puede tomar unos momentos mientras la IA analiza tu historial y crea preguntas personalizadas.</p>
            </div>
          `;
          
          // Llamar a la API para generar evaluación
          const response = await fetch(`${this.apiUrl}/assessments/generate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify({
              studentId: this.studentId,
              subject,
              difficulty,
              focusWeaknesses
            })
          });
          
          if (!response.ok) throw new Error('Error al generar evaluación');
          
          const data = await response.json();
          
          // Redireccionar a la evaluación generada
          window.location.href = `quiz.html?id=${data.assessment.id}`;
        } catch (error) {
          console.error('Error generando evaluación:', error);
          
          // Mostrar error
          form.innerHTML = `
            <div class="alert alert-danger">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              <span>Error al generar la evaluación. Por favor, intenta nuevamente.</span>
            </div>
            <div class="d-grid gap-2 mt-3">
              <button type="button" class="btn btn-outline-primary" onclick="window.location.reload()">
                <i class="bi bi-arrow-clockwise"></i> Reintentar
              </button>
            </div>
          `;
        }
      });
    }
  }

  /**
   * Carga una evaluación existente
   */
  async loadAssessment(assessmentId) {
    try {
      const response = await fetch(`${this.apiUrl}/assessments/${assessmentId}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      
      if (!response.ok) throw new Error('Error al cargar evaluación');
      
      const data = await response.json();
      
      // Guardar evaluación en memoria
      this.currentAssessment = data.assessment;
      this.currentQuestionIndex = 0;
      this.userAnswers = [];
      
      // Actualizar información de la evaluación
      document.querySelectorAll('[data-ai-field="quiz-title"]').forEach(el => {
        el.textContent = data.assessment.subject === 'historia' ? 
                        'Evaluación: Historia' : 'Evaluación: Geografía';
        el.classList.remove('data-placeholder');
      });
      
      document.querySelectorAll('[data-ai-field="quiz-description"]').forEach(el => {
        el.textContent = `Evaluación adaptativa de ${data.assessment.difficulty === 'basic' ? 'nivel básico' : 
                                                      data.assessment.difficulty === 'intermediate' ? 'nivel intermedio' : 
                                                      'nivel avanzado'} sobre ${data.assessment.topics.join(', ')}.`;
        el.classList.remove('data-placeholder');
      });
      
      document.querySelectorAll('[data-ai-field="quiz-progress"]').forEach(el => {
        el.textContent = `0/${data.assessment.questions.length}`;
        el.classList.remove('data-placeholder');
      });
      
      // Mostrar primera pregunta
      this.showQuestion(0);
      
      // Iniciar temporizador
      this.startAssessmentTimer(30 * 60); // 30 minutos
      
      // Configurar navegación
      this.setupQuestionNavigation();
      
      // Generar botones de navegación
      this.generateQuestionNavigationButtons(data.assessment.questions.length);
    } catch (error) {
      console.error('Error cargando evaluación:', error);
      
      // Mostrar error
      const mainContent = document.querySelector('.container > .row');
      if (mainContent) {
        mainContent.innerHTML = `
          <div class="col-12 text-center py-5">
            <i class="bi bi-exclamation-triangle-fill fs-1 text-danger"></i>
            <h4 class="mt-3">Error al cargar la evaluación</h4>
            <p>No se pudo cargar la evaluación solicitada.</p>
            <div class="d-grid gap-2 col-md-6 mx-auto mt-4">
              <button type="button" class="btn btn-outline-primary" onclick="window.location.href='quiz.html'">
                <i class="bi bi-plus-circle"></i> Crear nueva evaluación
              </button>
              <button type="button" class="btn btn-outline-secondary" onclick="window.location.href='student-dashboard.html'">
                <i class="bi bi-house"></i> Volver al panel
              </button>
            </div>
          </div>
        `;
      }
    }
  }

  /**
   * Muestra un recurso educativo en un modal
   */
  showResource(resourceId, resourceType) {
    try {
      const modalId = 'resourceModal';
      let modalElement = document.getElementById(modalId);
      
      if (!modalElement) {
        modalElement = document.createElement('div');
        modalElement.className = 'modal fade';
        modalElement.id = modalId;
        modalElement.setAttribute('tabindex', '-1');
        modalElement.setAttribute('aria-hidden', 'true');
        
        modalElement.innerHTML = `
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Recurso</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body" id="resourceModalBody">
                <div class="text-center">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando recurso...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
        
        document.body.appendChild(modalElement);
      }
      
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
      
      this.loadResourceContent(resourceId, resourceType);
      
    } catch (error) {
      console.error('Error mostrando recurso:', error);
      alert('No se pudo mostrar el recurso solicitado.');
    }
  }

  /**
   * Carga el contenido de un recurso educativo
   */
  async loadResourceContent(resourceId, resourceType) {
    try {
      const modalBody = document.getElementById('resourceModalBody');
      if (!modalBody) return;
      
      const response = await fetch(`${this.apiUrl}/resources/${resourceId}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      
      if (!response.ok) throw new Error('Error cargando recurso');
      
      const data = await response.json();
      
      // Mostrar contenido según tipo de recurso
      if (data.resource) {
        let contentHtml = '';
        
        switch (data.resource.type) {
          case 'lesson':
            contentHtml = `
              <h4>${data.resource.title}</h4>
              <p class="text-muted">${data.resource.description}</p>
              <div class="lesson-content mt-4">
                ${data.resource.content}
              </div>
            `;
            break;
            
          case 'video':
            contentHtml = `
              <h4>${data.resource.title}</h4>
              <p class="text-muted">${data.resource.description}</p>
              <div class="ratio ratio-16x9 mt-3">
                <iframe src="${data.resource.url}" title="${data.resource.title}" allowfullscreen></iframe>
              </div>
            `;
            break;
            
          default:
            contentHtml = `
              <h4>${data.resource.title}</h4>
              <p>${data.resource.description}</p>
              <div class="alert alert-info">
                <i class="bi bi-info-circle-fill me-2"></i>
                <span>Este tipo de recurso se abrirá en otra página</span>
              </div>
              <a href="${data.resource.url}" target="_blank" class="btn btn-primary">
                <i class="bi bi-box-arrow-up-right me-2"></i>
                Abrir recurso
              </a>
            `;
        }
        
        modalBody.innerHTML = contentHtml;
      } else {
        modalBody.innerHTML = `
          <div class="alert alert-warning">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            <span>Recurso no encontrado</span>
          </div>
        `;
      }
    } catch (error) {
      console.error('Error cargando contenido del recurso:', error);
      
      const modalBody = document.getElementById('resourceModalBody');
      if (modalBody) {
        modalBody.innerHTML = `
          <div class="alert alert-danger">
            <i class="bi bi-exclamation-circle-fill me-2"></i>
            <span>Error cargando el recurso. Por favor, intenta más tarde.</span>
          </div>
        `;
      }
    }
  }

  // Método mejorado para cargar sólo lo necesario
  async initializePageComponents() {
    const currentPath = window.location.pathname.toLowerCase();
    
    // Componentes comunes (autenticación, etc.)
    this.setupCommonComponents();
    
    // Componentes específicos por página
    if (currentPath.includes('student-dashboard')) {
      await this.initializeStudentDashboard();
    } else if (currentPath.includes('quiz')) {
      await this.initializeAssessment();
    } else if (currentPath.includes('library')) {
      await this.initializeLibrary();
    } else if (currentPath.includes('admin')) {
      await this.initializeAdminDashboard();
    }
  }
}

// Inicializar el servicio cuando se cargue la página
document.addEventListener('DOMContentLoaded', () => {
  // Verificar si hay autenticación
  const token = localStorage.getItem('auth_token');
  const studentId = localStorage.getItem('student_id');
  
  if (!token || !studentId) {
    // Si no hay autenticación, mostrar mensaje informativo en placeholders
    document.querySelectorAll('.data-placeholder').forEach(el => {
      el.textContent = "Inicie sesión para ver datos";
    });
    
    // Si estamos en una página que requiere autenticación, redirigir al login
    const currentPath = window.location.pathname.toLowerCase();
    if (currentPath.includes('student-dashboard') || 
        currentPath.includes('quiz') || 
        currentPath.includes('lesson')) {
      alert('Por favor inicie sesión para acceder a esta página');
      window.location.href = 'index.html';
    }
    
    return;
  }
  
  // Inicializar el servicio
  const aiService = new AIEducationService();
  aiService.initialize();
  
  // Guardar referencia global (útil para debug)
  window.aiService = aiService;
}); 