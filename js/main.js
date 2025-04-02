// Main JavaScript file for HistoGeo Adaptativo

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });
    
    // AI Recommendation text rotation (for student dashboard)
    const aiRecommendations = []; // Vaciar el array de recomendaciones predefinidas
    
    const aiRecommendationElement = document.getElementById('ai-recommendation');
    if (aiRecommendationElement) {
        // Establecer mensaje inicial de placeholder
        aiRecommendationElement.textContent = "Esperando recomendaciones personalizadas...";
        
        // Desactivar la rotación automática de mensajes
        // El contenido será actualizado dinámicamente por la IA
    }
    
    // Quiz countdown timer
    const countdownElement = document.getElementById('countdown');
    if (countdownElement) {
        // Establecer placeholder inicial
        countdownElement.textContent = "--:--";
        
        // El timer real se iniciará cuando la IA proporcione los datos de la evaluación
        // Código comentado para evitar funcionamiento con datos estáticos
        /*
        let timeLeft = 15 * 60; // 15 minutes in seconds
        
        const countdownInterval = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            
            countdownElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            
            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                // Show timeout modal or submit quiz automatically
                alert('¡Tiempo terminado! La evaluación se enviará automáticamente.');
            } else {
                timeLeft--;
            }
        }, 1000);
        */
    }
    
    // Handle AI Question in lesson
    const askAiButton = document.getElementById('ask-ai');
    if (askAiButton) {
        askAiButton.addEventListener('click', function() {
            const question = document.getElementById('ai-question').value;
            const responseArea = document.getElementById('ai-response-area');
            const aiAnswer = document.getElementById('ai-answer');
            
            if (question.trim() !== '') {
                // Show loading state
                responseArea.style.display = 'block';
                aiAnswer.innerHTML = '<i class="spinner-border spinner-border-sm"></i> Analizando tu pregunta...';
                
                // En vez de simular respuestas hardcodeadas, mostramos un mensaje genérico
                // Aquí se conectaría con la IA real
                setTimeout(() => {
                    aiAnswer.textContent = "El sistema de IA procesará esta consulta en tiempo real cuando esté implementado.";
                }, 1500);
                
                // Clear input after sending
                document.getElementById('ai-question').value = '';
            }
        });
        
        // Also trigger on Enter key
        document.getElementById('ai-question').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                askAiButton.click();
                e.preventDefault();
            }
        });
    }
    
    // Helper function to suggest section based on question keywords
    function getSectionFromQuestion(question) {
        const q = question.toLowerCase();
        if (q.includes('origen') || q.includes('desarrollo') || q.includes('historia')) {
            return 'Orígenes y Desarrollo';
        } else if (q.includes('civilización') || q.includes('cultura') || q.includes('sociedad')) {
            return 'Principales Civilizaciones';
        } else if (q.includes('arte') || q.includes('arquitectura') || q.includes('legado') || q.includes('influencia')) {
            return 'Legado Cultural';
        } else {
            return 'Resumen';
        }
    }
    
    // Quiz interaction
    const checkAnswersButton = document.getElementById('checkAnswers');
    if (checkAnswersButton) {
        checkAnswersButton.addEventListener('click', function() {
            // En lugar de verificar respuestas específicas, mostrar un mensaje de estado
            document.getElementById('quiz-results').classList.remove('d-none');
            document.getElementById('score').textContent = "--";
            
            const suggestionList = document.getElementById('suggestions');
            suggestionList.innerHTML = '';
            
            const li = document.createElement('li');
            li.textContent = 'El sistema de IA evaluará tus respuestas y proporcionará retroalimentación personalizada.';
            suggestionList.appendChild(li);
            
            // Scroll to results
            document.getElementById('quiz-results').scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // Handle next and previous buttons in quiz
    const prevQuestionButton = document.getElementById('prev-question');
    const nextQuestionButton = document.getElementById('next-question');
    
    if (prevQuestionButton) {
        prevQuestionButton.addEventListener('click', function() {
            // In a real app, this would navigate to the previous question
            alert('Navegando a la pregunta anterior...');
        });
    }
    
    if (nextQuestionButton) {
        nextQuestionButton.addEventListener('click', function() {
            // In a real app, this would navigate to the next question
            alert('Respuesta guardada. Navegando a la siguiente pregunta...');
        });
    }
    
    // Initialize charts if they exist
    initializeCharts();
    
    // Filter functionality for library
    const filterButtons = document.querySelectorAll('.filter-btn');
    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // In a real app, this would filter content
                const filterType = this.getAttribute('data-filter');
                alert('Filtrando contenido por: ' + filterType);
            });
        });
    }
});

// Initialize charts for dashboard
function initializeCharts() {
    // Progreso Chart - mostrar solo estructura vacía
    const progressChartElement = document.getElementById('progressChart');
    if (progressChartElement) {
        // Ocultar canvas hasta que tengamos datos reales
        progressChartElement.style.display = 'none';
        
        // Mostrar mensaje de placeholder
        const chartContainer = progressChartElement.closest('.chart-container');
        if (chartContainer) {
            const placeholderDiv = document.createElement('div');
            placeholderDiv.className = 'chart-placeholder text-center text-muted pt-5';
            placeholderDiv.innerHTML = `
                <i class="bi bi-graph-up fs-1"></i>
                <p>Los gráficos de progreso se generarán con tus datos personalizados</p>
                <p><small>Se actualizarán automáticamente con tu avance</small></p>
            `;
            chartContainer.appendChild(placeholderDiv);
        }
    }
    
    // Activity Distribution Chart - mostrar solo estructura vacía
    const activityChartElement = document.getElementById('activityChart');
    if (activityChartElement) {
        // Ocultar canvas hasta que tengamos datos reales
        activityChartElement.style.display = 'none';
        
        // El placeholder ya se ha agregado en el HTML
    }
    
    // Admin Dashboard Charts - mostrar solo estructura vacía
    const performanceChartElement = document.getElementById('performanceChart');
    if (performanceChartElement) {
        // Ocultar canvas hasta que tengamos datos reales
        performanceChartElement.style.display = 'none';
        
        // El placeholder ya se ha agregado en el HTML
    }
}

// Función para actualizar elementos de progreso
function updateProgressElements(data) {
    // Actualizar barras de progreso
    const progressBars = document.querySelectorAll('.data-progress');
    progressBars.forEach(bar => {
        const field = bar.getAttribute('data-ai-field');
        if (data[field]) {
            bar.style.width = `${data[field]}%`;
            bar.setAttribute('aria-valuenow', data[field]);
            
            // Si hay texto dentro de la barra de progreso
            if (bar.textContent) {
                bar.textContent = `${data[field]}%`;
            }
        }
    });
    
    // Actualizar placeholders de texto
    const placeholders = document.querySelectorAll('.data-placeholder');
    placeholders.forEach(placeholder => {
        const field = placeholder.getAttribute('data-ai-field');
        if (data[field]) {
            placeholder.textContent = data[field];
            placeholder.classList.remove('data-placeholder');
        }
    });
}

// Función para inicializar gráficos con datos reales
function initializeChartsWithData(chartData) {
    // Progreso Chart
    const progressChartElement = document.getElementById('progressChart');
    if (progressChartElement && chartData.progress) {
        // Mostrar el canvas y ocultar el placeholder
        progressChartElement.style.display = 'block';
        const chartPlaceholder = progressChartElement.closest('.chart-container').querySelector('.chart-placeholder');
        if (chartPlaceholder) {
            chartPlaceholder.style.display = 'none';
        }
        
        // Inicializar el gráfico con datos reales
        const ctx = progressChartElement.getContext('2d');
        const progressChart = new Chart(ctx, {
            type: 'line',
            data: chartData.progress,
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
                            text: 'Mes'
                        }
                    }
                }
            }
        });
    }
    
    // Inicializar otros gráficos de manera similar...
}

// Función para cargar datos de IA después de la inicialización de la página
function loadAIData() {
    const userId = getCurrentUserId(); // Función para obtener el ID del usuario actual
    
    // Cargar recomendaciones personalizadas
    fetch(`/api/ai/recommendations?userId=${userId}`)
        .then(response => response.json())
        .then(data => {
            // Actualizar recomendación principal
            const aiRecommendationElement = document.getElementById('ai-recommendation');
            if (aiRecommendationElement) {
                aiRecommendationElement.textContent = data.mainRecommendation;
                aiRecommendationElement.classList.remove('data-placeholder');
            }
            
            // Actualizar contenedor de actividades recomendadas
            const activitiesContainer = document.getElementById('recommended-activities-container');
            if (activitiesContainer && data.recommendedActivities.length > 0) {
                activitiesContainer.innerHTML = ''; // Limpiar placeholder
                
                // Renderizar cada actividad recomendada
                data.recommendedActivities.forEach(activity => {
                    const activityElement = createActivityElement(activity);
                    activitiesContainer.appendChild(activityElement);
                });
            }
        })
        .catch(error => {
            console.error('Error al cargar recomendaciones:', error);
            handleDataLoadError(document.getElementById('recommended-activities-container'), 'Error al cargar recomendaciones');
        });
    
    // Cargar datos de progreso
    fetch(`/api/ai/progress?userId=${userId}`)
        .then(response => response.json())
        .then(data => {
            // Actualizar barras de progreso y estadísticas
            updateProgressElements(data);
            
            // Inicializar gráficos con datos reales
            initializeChartsWithData(data.charts);
        })
        .catch(error => {
            console.error('Error al cargar datos de progreso:', error);
            handleDataLoadError(document.getElementById('recommended-activities-container'), 'Error al cargar datos de progreso');
        });
}

// Función para crear elementos de actividad recomendada
function createActivityElement(activity) {
    const element = document.createElement('a');
    element.href = activity.url;
    element.className = 'list-group-item list-group-item-action';
    
    element.innerHTML = `
        <div class="d-flex w-100 justify-content-between">
            <h6 class="mb-1">${activity.title}</h6>
            <small class="text-primary">${activity.category}</small>
        </div>
        <p class="mb-1">${activity.description}</p>
        <div class="d-flex justify-content-between align-items-center">
            <small class="text-muted">${activity.duration}</small>
            <span class="badge ${activity.badgeClass}">${activity.badgeText}</span>
        </div>
    `;
    
    return element;
}

// Llamar a esta función después de cargar la página
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar interfaz con placeholders
    initializePlaceholders();
    
    // Cargar datos reales de IA (con un pequeño retraso para mostrar loading state)
    setTimeout(loadAIData, 1500);
});

// Función para manejar errores de carga de datos
function handleDataLoadError(container, errorMessage) {
    container.innerHTML = `
        <div class="data-error">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            <span>${errorMessage || 'No se pudieron cargar los datos. Por favor, intenta más tarde.'}</span>
            <button class="btn btn-sm btn-outline-danger ms-3 retry-button">
                <i class="bi bi-arrow-clockwise"></i> Reintentar
            </button>
        </div>
    `;
    
    // Añadir funcionalidad al botón de reintentar
    const retryButton = container.querySelector('.retry-button');
    if (retryButton) {
        retryButton.addEventListener('click', function() {
            // Mostrar estado de carga nuevamente
            container.innerHTML = `
                <div class="text-center py-4 text-muted">
                    <i class="bi bi-hourglass fs-1"></i>
                    <p>Cargando datos...</p>
                    <div class="spinner-border text-primary mt-2" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                </div>
            `;
            
            // Reintentar cargar los datos
            loadAIData();
        });
    }
}

// Función para inicializar la interfaz de administrador
function initializeAdminDashboard() {
    // Mostrar estado de carga para todos los componentes dinámicos
    showLoadingStates();
    
    // Establecer listeners para elementos interactivos
    setupAdminInteractions();
}

// Mostrar estados de carga para todos los componentes que esperan datos
function showLoadingStates() {
    // Asegurar que los canvas de gráficos están ocultos inicialmente
    const chartCanvases = document.querySelectorAll('.chart-container canvas');
    chartCanvases.forEach(canvas => {
        canvas.style.display = 'none';
    });
    
    // Asegurar que los placeholders de gráficos están visibles
    const chartPlaceholders = document.querySelectorAll('.chart-placeholder');
    chartPlaceholders.forEach(placeholder => {
        placeholder.style.display = 'flex';
    });
    
    // Añadir clase de animación a los placeholders de datos
    const dataPlaceholders = document.querySelectorAll('.data-placeholder');
    dataPlaceholders.forEach(placeholder => {
        placeholder.classList.add('waiting-for-data');
    });
}

// Configurar interacciones para elementos del dashboard de admin
function setupAdminInteractions() {
    // Dropdowns de filtros de tiempo para gráficos
    const filterDropdowns = document.querySelectorAll('.dropdown-item');
    filterDropdowns.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Actualizar texto del botón
            const dropdownButton = this.closest('.dropdown').querySelector('.dropdown-toggle');
            if (dropdownButton) {
                dropdownButton.textContent = this.textContent;
            }
            
            // Mostrar estado de carga del gráfico relacionado
            const chartContainer = this.closest('.card').querySelector('.chart-container');
            if (chartContainer) {
                const chart = chartContainer.querySelector('canvas');
                const placeholder = chartContainer.querySelector('.chart-placeholder');
                
                if (chart && placeholder) {
                    chart.style.display = 'none';
                    placeholder.style.display = 'flex';
                    
                    // Simular solicitud de nuevos datos (en una implementación real, esto llamaría a la API)
                    const timeRange = this.textContent.trim();
                    console.log(`Solicitando datos para rango: ${timeRange}`);
                    
                    // Mensaje en el placeholder indicando que se están cargando datos para este período
                    const loadingMessage = placeholder.querySelector('p');
                    if (loadingMessage) {
                        loadingMessage.textContent = `Cargando datos para: ${timeRange}`;
                    }
                }
            }
        });
    });
    
    // Botones para ver todas las actividades o estudiantes
    const viewAllButtons = document.querySelectorAll('.btn-outline-primary, .btn-outline-secondary');
    viewAllButtons.forEach(button => {
        if (button.textContent.includes('Ver todos') || button.textContent.includes('Ver todas')) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                alert('Esta función cargará una vista completa con datos generados dinámicamente por la IA.');
            });
        }
    });
}

// Función para simular la carga de datos de IA en el dashboard de administrador
function simulateAdminDataLoad() {
    // En una implementación real, esta función haría solicitudes a la API de IA
    console.log('Simulando carga de datos para el dashboard de administrador...');
    
    // Simular carga después de un tiempo para mostrar los estados de carga
    setTimeout(() => {
        // Aquí se llamaría a funciones específicas para cada sección del dashboard
        // loadAdminOverviewData();
        // loadAdminChartData();
        // loadAdminInsightsData();
        // loadAdminActivityData();
        // loadAdminTopStudentsData();
        
        // Por ahora, solo mostramos un mensaje en la consola
        console.log('Los datos del dashboard se cargarían dinámicamente desde la API de IA');
    }, 2000);
}

// Inicializar el dashboard de administrador si estamos en esa página
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si estamos en la página de administrador
    if (document.querySelector('.admin-dashboard') || 
        document.location.pathname.includes('admin-dashboard.html')) {
        console.log('Inicializando dashboard de administrador...');
        initializeAdminDashboard();
        simulateAdminDataLoad();
    }
});

// Función para añadir mensaje de la IA al chat (continuación)
function addAIMessage(message) {
    const chatContainer = document.getElementById('ai-chat-container');
    
    if (chatContainer) {
        // Añadir indicador de escritura
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'ai-message typing-indicator';
        typingIndicator.innerHTML = `
            <div class="d-flex align-items-center">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        `;
        chatContainer.appendChild(typingIndicator);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        // Simular tiempo de respuesta y luego mostrar el mensaje real
        setTimeout(() => {
            // Reemplazar el indicador con el mensaje real
            chatContainer.removeChild(typingIndicator);
            
            const messageElement = document.createElement('div');
            messageElement.className = 'ai-message';
            messageElement.innerHTML = `
                <p class="mb-0">${message}</p>
                <small class="text-muted">IA, ahora</small>
            `;
            
            chatContainer.appendChild(messageElement);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }, 1000);
    }
}

// Inicializar gráfico de habilidades (radar)
function initializeSkillsRadarChart() {
    const radarChartElement = document.getElementById('skillsRadarChart');
    if (radarChartElement) {
        // Ocultar canvas hasta que tengamos datos reales
        radarChartElement.style.display = 'none';
        
        // El placeholder ya debería estar añadido en el HTML
    }
}

// Inicializar gráfico de historial de evaluaciones
function initializeEvaluationHistoryChart() {
    const historyChartElement = document.getElementById('evaluationHistoryChart');
    if (historyChartElement) {
        // Ocultar canvas hasta que tengamos datos reales
        historyChartElement.style.display = 'none';
        
        // El placeholder ya debería estar añadido en el HTML
    }
}

// Función para manejar el sistema de retroalimentación inmediata
function initializeFeedbackSystem() {
    const feedbackContainer = document.getElementById('feedback-container');
    const closeFeedbackButton = document.getElementById('close-feedback');
    const nextAfterFeedbackButton = document.getElementById('next-after-feedback');
    
    if (feedbackContainer && closeFeedbackButton && nextAfterFeedbackButton) {
        // Añadir event listener para cerrar
        closeFeedbackButton.addEventListener('click', function() {
            feedbackContainer.style.display = 'none';
        });
        
        // Añadir event listener para siguiente pregunta
        nextAfterFeedbackButton.addEventListener('click', function() {
            feedbackContainer.style.display = 'none';
            // Aquí se llamaría a la función para ir a la siguiente pregunta
            alert('Avanzando a la siguiente pregunta tras retroalimentación...');
        });
    }
}

// Función para simular respuesta de la IA a una pregunta específica
function showFeedback(isCorrect, explanation, resources) {
    const feedbackContainer = document.getElementById('feedback-container');
    const feedbackResult = document.querySelector('.feedback-result');
    const feedbackExplanation = document.querySelector('.feedback-explanation');
    const feedbackResourcesContainer = document.getElementById('feedback-resources-container');
    
    if (feedbackContainer && feedbackResult && feedbackExplanation && feedbackResourcesContainer) {
        // Mostrar el contenedor de feedback
        feedbackContainer.style.display = 'block';
        
        // Establecer el resultado (correcto/incorrecto)
        feedbackResult.innerHTML = isCorrect ? 
            `<div class="alert alert-success">
                <i class="bi bi-check-circle-fill me-2"></i> ¡Respuesta correcta!
             </div>` : 
            `<div class="alert alert-danger">
                <i class="bi bi-x-circle-fill me-2"></i> Respuesta incorrecta
             </div>`;
        
        // Establecer la explicación
        feedbackExplanation.innerHTML = `<p>${explanation || 'La explicación detallada aparecerá aquí en la implementación real.'}</p>`;
        
        // Establecer recursos recomendados
        if (resources && resources.length > 0) {
            let resourcesHTML = '<ul class="list-group">';
            resources.forEach(resource => {
                resourcesHTML += `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <span>${resource.title}</span>
                        <a href="${resource.link}" class="btn btn-sm btn-outline-info" target="_blank">
                            <i class="bi bi-box-arrow-up-right"></i> Ver
                        </a>
                    </li>
                `;
            });
            resourcesHTML += '</ul>';
            feedbackResourcesContainer.innerHTML = resourcesHTML;
        } else {
            feedbackResourcesContainer.innerHTML = '<p class="text-muted text-center">No hay recursos específicos disponibles para esta pregunta.</p>';
        }
        
        // Hacer scroll para mostrar el feedback
        feedbackContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

// Función para inicializar el sistema de búsqueda avanzada en la biblioteca
function initializeAdvancedSearch() {
    const advancedSearchForm = document.getElementById('advanced-search-form');
    const searchQuery = document.getElementById('searchQuery');
    
    if (advancedSearchForm && searchQuery) {
        // Event listener para búsqueda
        advancedSearchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obtener valores de filtros
            const query = searchQuery.value;
            const difficulty = document.getElementById('searchDifficulty').value;
            const learningStyle = document.getElementById('searchLearningStyle').value;
            
            // Obtener checkboxes de formatos seleccionados
            const formats = [];
            if (document.getElementById('content-text').checked) formats.push('text');
            if (document.getElementById('content-video').checked) formats.push('video');
            if (document.getElementById('content-interactive').checked) formats.push('interactive');
            if (document.getElementById('content-quiz').checked) formats.push('quiz');
            
            // Mostrar estado de carga en el contenedor de resultados
            const contentGridContainer = document.getElementById('content-grid-container');
            if (contentGridContainer) {
                contentGridContainer.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <i class="bi bi-search fs-1 text-muted"></i>
                        <h4 class="mt-3 text-muted">Buscando contenido...</h4>
                        <p class="text-muted">Filtrando resultados según tus criterios</p>
                        <div class="spinner-border text-primary mt-2" role="status">
                            <span class="visually-hidden">Buscando...</span>
                        </div>
                    </div>
                `;
                
                // En una implementación real, aquí se llamaría a la API para buscar contenido
                // Por ahora solo mostramos un mensaje de placeholder
                setTimeout(() => {
                    contentGridContainer.innerHTML = `
                        <div class="col-12 text-center py-5">
                            <i class="bi bi-info-circle fs-1 text-muted"></i>
                            <h4 class="mt-3 text-muted">Funcionalidad en desarrollo</h4>
                            <p class="text-muted">El sistema de búsqueda inteligente estará disponible cuando se implemente la IA</p>
                        </div>
                    `;
                }, 2000);
            }
        });
        
        // Botón de limpiar filtros
        const clearButton = advancedSearchForm.querySelector('button[type="button"].btn-outline-secondary');
        if (clearButton) {
            clearButton.addEventListener('click', function() {
                // Limpiar campo de búsqueda
                searchQuery.value = '';
                
                // Reiniciar selects
                document.getElementById('searchDifficulty').selectedIndex = 0;
                document.getElementById('searchLearningStyle').selectedIndex = 0;
                
                // Marcar todos los checkboxes
                document.getElementById('content-text').checked = true;
                document.getElementById('content-video').checked = true;
                document.getElementById('content-interactive').checked = true;
                document.getElementById('content-quiz').checked = true;
            });
        }
    }
}

// Función para manejar el sistema de recursos generados por IA
function initializeAIResourceFinder() {
    const requestResourcesBtn = document.getElementById('request-resources-btn');
    const aiResourceRequest = document.getElementById('ai-resource-request');
    const aiResourcesContainer = document.getElementById('ai-resources-container');
    
    if (requestResourcesBtn && aiResourceRequest && aiResourcesContainer) {
        // Event listener para el botón de búsqueda
        requestResourcesBtn.addEventListener('click', function() {
            const query = aiResourceRequest.value.trim();
            
            if (query) {
                // Mostrar estado de búsqueda
                aiResourcesContainer.innerHTML = `
                    <div class="d-flex align-items-center justify-content-center py-5 text-muted">
                        <div class="text-center">
                            <i class="bi bi-search fs-1"></i>
                            <p class="mt-3">Buscando recursos relevantes para: "${query}"</p>
                            <div class="progress mt-3" style="height: 6px;">
                                <div class="progress-bar progress-bar-striped progress-bar-animated bg-info" role="progressbar" style="width: 100%"></div>
                            </div>
                        </div>
                    </div>
                `;
                
                // En una implementación real, aquí se enviaría la consulta a la API de IA
                // Por ahora mostramos un mensaje de placeholder después de un retraso
                setTimeout(() => {
                    aiResourcesContainer.innerHTML = `
                        <div class="alert alert-info">
                            <i class="bi bi-info-circle me-2"></i>
                            La búsqueda de recursos con IA estará disponible cuando se implemente el backend.
                        </div>
                        <div class="text-center text-muted">
                            <p>Tu consulta: "${query}" sería procesada por la IA para encontrar recursos relevantes.</p>
                        </div>
                    `;
                }, 2500);
                
                // Limpiar el campo de búsqueda
                aiResourceRequest.value = '';
            }
        });
        
        // Permitir buscar con Enter
        aiResourceRequest.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                requestResourcesBtn.click();
                e.preventDefault();
            }
        });
    }
}

// Función para manejar categorización inteligente
function initializeAICategorization() {
    const aiCategoriesToggle = document.getElementById('ai-categories-toggle');
    const aiCategoriesContainer = document.getElementById('ai-categories-container');
    
    if (aiCategoriesToggle && aiCategoriesContainer) {
        // Event listener para el toggle
        aiCategoriesToggle.addEventListener('change', function() {
            if (this.checked) {
                // Mostrar categorías personalizadas por IA
                aiCategoriesContainer.innerHTML = `
                    <div class="d-flex align-items-center justify-content-center py-3 text-muted">
                        <div class="text-center">
                            <i class="bi bi-diagram-3 fs-4"></i>
                            <p class="mt-2">Generando categorías personalizadas...</p>
                            <div class="spinner-border spinner-border-sm text-primary" role="status">
                                <span class="visually-hidden">Generando...</span>
                            </div>
                        </div>
                    </div>
                `;
                
                // En una implementación real, aquí se llamaría a la API de IA
                // Por ahora mostramos un mensaje de placeholder después de un retraso
                setTimeout(() => {
                    aiCategoriesContainer.innerHTML = `
                        <div class="alert alert-info">
                            <i class="bi bi-info-circle me-2"></i>
                            La categorización inteligente estará disponible cuando se implemente la IA.
                        </div>
                    `;
                }, 1500);
            } else {
                // Mostrar categorías estándar
                aiCategoriesContainer.innerHTML = `
                    <div class="alert alert-secondary">
                        <i class="bi bi-info-circle me-2"></i>
                        Categorización inteligente desactivada. Se muestran categorías estándar.
                    </div>
                `;
            }
        });
    }
}

// Inicializar todas las nuevas funcionalidades al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    // Código existente...
    
    // Verificar en qué página estamos y cargar las funcionalidades correspondientes
    const currentPath = window.location.pathname.toLowerCase();
    
    // Para la página del dashboard del estudiante
    if (currentPath.includes('student-dashboard')) {
        initializeAIChat();
        initializeSkillsRadarChart();
        initializeEvaluationHistoryChart();
    }
    
    // Para la página de evaluaciones
    if (currentPath.includes('quiz')) {
        initializeFeedbackSystem();
        
        // Agregar listener para los botones de evaluación que mostrarán feedback
        const nextQuestionBtn = document.getElementById('next-question');
        if (nextQuestionBtn) {
            nextQuestionBtn.addEventListener('click', function() {
                // Simulación: 70% probabilidad de respuesta correcta para demostración
                const isCorrect = Math.random() > 0.3;
                
                // Simular recursos
                const demoResources = [
                    { title: "Lección: Fundamentos del tema", link: "#" },
                    { title: "Video explicativo", link: "#" }
                ];
                
                // Mostrar feedback simulado
                showFeedback(
                    isCorrect, 
                    isCorrect ? 
                        "¡Excelente! Has comprendido correctamente el concepto. La respuesta es correcta porque..." : 
                        "Esta respuesta no es correcta. El concepto clave a entender es...",
                    demoResources
                );
            });
        }
    }
    
    // Para la página de biblioteca
    if (currentPath.includes('library')) {
        initializeAdvancedSearch();
        initializeAIResourceFinder();
        initializeAICategorization();
    }
}); 