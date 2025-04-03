// Variables globales
const API_URL = 'http://localhost:5000/api';
let token = localStorage.getItem('token');
let messageHistory = [];

// Inicializar chat
function initChat() {
  const chatForm = document.getElementById('chat-form');
  if (!chatForm) return;
  
  // Manejar envío de mensajes
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();
    
    if (message) {
      // Limpiar input
      messageInput.value = '';
      
      // Añadir mensaje del usuario al chat
      appendMessage('user', message);
      
      // Enviar mensaje al servidor
      await sendMessage(message);
    }
  });
  
  // Añadir mensaje de bienvenida
  setTimeout(() => {
    appendMessage('assistant', '¡Hola! Soy tu asistente de aprendizaje. ¿En qué puedo ayudarte hoy? Puedes preguntarme sobre temas de historia y geografía, o pedirme que te sugiera recursos de estudio.');
  }, 500);
}

// Enviar mensaje al servidor
async function sendMessage(message) {
  try {
    // Mostrar indicador de carga
    appendMessage('assistant', '...', 'loading-message');
    
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify({ message })
    });
    
    const data = await response.json();
    
    // Eliminar indicador de carga
    const loadingMessage = document.querySelector('.loading-message');
    if (loadingMessage) {
      loadingMessage.remove();
    }
    
    if (data.success) {
      // Añadir respuesta del asistente
      appendMessage('assistant', data.message);
      
      // Mostrar acciones sugeridas
      if (data.actions && data.actions.length > 0) {
        displaySuggestedActions(data.actions);
      }
    } else {
      appendMessage('assistant', 'Lo siento, tuve un problema procesando tu mensaje. ¿Podrías intentarlo de nuevo?');
    }
  } catch (error) {
    console.error('Error enviando mensaje:', error);
    
    // Eliminar indicador de carga
    const loadingMessage = document.querySelector('.loading-message');
    if (loadingMessage) {
      loadingMessage.remove();
    }
    
    appendMessage('assistant', 'Lo siento, parece que hay un problema de conexión. Por favor, intenta de nuevo más tarde.');
  }
}

// Añadir mensaje al chat
function appendMessage(sender, content, className = '') {
  const chatMessages = document.getElementById('chat-messages');
  if (!chatMessages) return;
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}-message ${className}`;
  
  messageDiv.innerHTML = `
    <div class="message-content">
      ${content}
    </div>
  `;
  
  chatMessages.appendChild(messageDiv);
  
  // Scroll al final
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  // Guardar en historial
  messageHistory.push({
    sender,
    content
  });
}

// Mostrar acciones sugeridas
function displaySuggestedActions(actions) {
  const actionsContainer = document.getElementById('suggested-actions');
  if (!actionsContainer) return;
  
  actionsContainer.innerHTML = `
    <h3>Acciones sugeridas</h3>
    <div class="actions-list">
      ${actions.map(action => `
        <div class="action-item">
          <a href="${action.url}" class="btn btn-outline-primary">
            ${action.description}
          </a>
        </div>
      `).join('')}
    </div>
  `;
  
  actionsContainer.style.display = 'block';
}

// Inicializar página
document.addEventListener('DOMContentLoaded', () => {
  initChat();
}); 