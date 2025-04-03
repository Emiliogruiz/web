// Variables globales
const API_URL = 'http://localhost:5000/api';
let token = localStorage.getItem('token');
let currentUser = null;

// Comprobar si el usuario ya está autenticado
async function checkAuth() {
  if (token) {
    try {
      const response = await fetch(`${API_URL}/auth/user`, {
        headers: {
          'x-auth-token': token
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        currentUser = data.user;
        updateUI();
        return true;
      } else {
        logout();
        return false;
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      logout();
      return false;
    }
  }
  return false;
}

// Registro de usuario
async function register(username, email, password, program) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        email,
        password,
        program
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Almacenar token y redirigir
      localStorage.setItem('token', data.token);
      token = data.token;
      currentUser = data.user;
      updateUI();
      return { success: true };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.error('Error en registro:', error);
    return { success: false, message: 'Error de conexión' };
  }
}

// Inicio de sesión
async function login(email, password) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Almacenar token y redirigir
      localStorage.setItem('token', data.token);
      token = data.token;
      currentUser = data.user;
      updateUI();
      return { success: true };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.error('Error en login:', error);
    return { success: false, message: 'Error de conexión' };
  }
}

// Cerrar sesión
function logout() {
  localStorage.removeItem('token');
  token = null;
  currentUser = null;
  updateUI();
  
  // Redirigir a página de inicio
  window.location.href = 'index.html';
}

// Actualizar interfaz según estado de autenticación
function updateUI() {
  const authLinks = document.querySelectorAll('.auth-link');
  const userLinks = document.querySelectorAll('.user-link');
  const userNameElements = document.querySelectorAll('.user-name');
  
  if (currentUser) {
    // Usuario autenticado
    authLinks.forEach(link => link.style.display = 'none');
    userLinks.forEach(link => link.style.display = 'block');
    userNameElements.forEach(el => el.textContent = currentUser.username);
  } else {
    // Usuario no autenticado
    authLinks.forEach(link => link.style.display = 'block');
    userLinks.forEach(link => link.style.display = 'none');
  }
}

// Eventos para formularios
document.addEventListener('DOMContentLoaded', () => {
  // Verificar autenticación
  checkAuth();
  
  // Form de registro
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const program = document.getElementById('program').value;
      
      const result = await register(username, email, password, program);
      
      if (result.success) {
        window.location.href = 'student-dashboard.html';
      } else {
        showAlert(result.message, 'error');
      }
    });
  }
  
  // Form de login
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      const result = await login(email, password);
      
      if (result.success) {
        window.location.href = 'student-dashboard.html';
      } else {
        showAlert(result.message, 'error');
      }
    });
  }
  
  // Botón de logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }
});

// Mostrar alertas
function showAlert(message, type = 'info') {
  const alertContainer = document.getElementById('alert-container') || createAlertContainer();
  
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  
  alertContainer.appendChild(alert);
  
  // Auto eliminar después de 3 segundos
  setTimeout(() => {
    alert.remove();
    if (alertContainer.children.length === 0) {
      alertContainer.remove();
    }
  }, 3000);
}

// Crear contenedor de alertas si no existe
function createAlertContainer() {
  const container = document.createElement('div');
  container.id = 'alert-container';
  container.style.position = 'fixed';
  container.style.top = '20px';
  container.style.right = '20px';
  container.style.zIndex = '1000';
  document.body.appendChild(container);
  return container;
}

// Exportar funciones
window.auth = {
  register,
  login,
  logout,
  checkAuth,
  getCurrentUser: () => currentUser
}; 