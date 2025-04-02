FROM node:16

WORKDIR /app

# Copiar archivos de backend
COPY backend/package*.json ./backend/
RUN cd backend && npm install
COPY backend ./backend/

# Copiar archivos de frontend
COPY index.html student-dashboard.html quiz.html library.html admin-dashboard.html ./
COPY css ./css
COPY js ./js

# Archivo de configuración con variables de entorno por defecto
COPY .env.example ./backend/.env

# Puerto por defecto
EXPOSE 5000

# Comando para iniciar el servidor
CMD cd backend && node server.js 