// Variables globales
const API_URL = 'http://localhost:5000/api';
let token = localStorage.getItem('token');

// Cargar recursos de biblioteca
async function loadLibraryResources() {
  try {
    const response = await fetch(`${API_URL}/resources`);
    const data = await response.json();
    
    if (data.success) {
      renderLibraryResources(data.data);
    } else {
      showAlert('Error al cargar recursos', 'error');
    }
  } catch (error) {
    console.error('Error cargando recursos:', error);
    showAlert('Error de conexión', 'error');
  }
}

// Renderizar recursos de biblioteca
function renderLibraryResources(resources) {
  const resourcesContainer = document.getElementById('resources-container');
  if (!resourcesContainer) return;
  
  // Agrupar por categoría
  const categories = {};
  resources.forEach(resource => {
    if (!categories[resource.category]) {
      categories[resource.category] = [];
    }
    categories[resource.category].push(resource);
  });
  
  // Generar HTML para cada categoría
  let html = '';
  for (const [category, categoryResources] of Object.entries(categories)) {
    html += `
      <div class="category-section">
        <h2>${category}</h2>
        <div class="resources-grid">
          ${categoryResources.map(resource => `
            <div class="resource-card ${resource.type}">
              <div class="resource-icon">
                ${getResourceIcon(resource.type)}
              </div>
              <h3>${resource.title}</h3>
              <p>${resource.description}</p>
              <div class="resource-meta">
                <span class="type">${getResourceTypeName(resource.type)}</span>
                <span class="level">${resource.level}</span>
              </div>
              <a href="${resource.url}" target="_blank" class="btn btn-primary">Ver recurso</a>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  resourcesContainer.innerHTML = html;
}

// Obtener icono para tipo de recurso
function getResourceIcon(type) {
  switch (type) {
    case 'article':
      return '<i class="fas fa-file-alt"></i>';
    case 'video':
      return '<i class="fas fa-video"></i>';
    case 'ebook':
      return '<i class="fas fa-book"></i>';
    case 'presentation':
      return '<i class="fas fa-presentation"></i>';
    case 'quiz':
      return '<i class="fas fa-question-circle"></i>';
    default:
      return '<i class="fas fa-file"></i>';
  }
}

// Obtener nombre para tipo de recurso
function getResourceTypeName(type) {
  switch (type) {
    case 'article':
      return 'Artículo';
    case 'video':
      return 'Video';
    case 'ebook':
      return 'E-Book';
    case 'presentation':
      return 'Presentación';
    case 'quiz':
      return 'Evaluación';
    default:
      return 'Recurso';
  }
}

// Buscar recursos
function searchResources(query) {
  const resourceCards = document.querySelectorAll('.resource-card');
  const lowerQuery = query.toLowerCase();
  
  resourceCards.forEach(card => {
    const title = card.querySelector('h3').textContent.toLowerCase();
    const description = card.querySelector('p').textContent.toLowerCase();
    
    if (title.includes(lowerQuery) || description.includes(lowerQuery)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// Inicializar página
document.addEventListener('DOMContentLoaded', () => {
  loadLibraryResources();
  
  // Manejar búsqueda
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchResources(e.target.value);
    });
  }
  
  // Manejar filtros
  const filterButtons = document.querySelectorAll('.filter-btn');
  if (filterButtons.length > 0) {
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        const filter = button.dataset.filter;
        
        // Toggle clase activa
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Aplicar filtro
        const resourceCards = document.querySelectorAll('.resource-card');
        resourceCards.forEach(card => {
          if (filter === 'all' || card.classList.contains(filter)) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }
}); 