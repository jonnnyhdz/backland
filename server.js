const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // 👈 nuevo
require('dotenv').config();

const app = express();

// Middleware
app.use(cookieParser()); // 👈 nuevo
app.use(express.json());

// Habilita CORS con credenciales para aceptar cookies del frontend
app.use(cors({
  origin: 'http://localhost:3001', // Cambia si usas otro puerto para el frontend
  credentials: true                // 👈 necesario para que el navegador permita cookies
}));

// Rutas
const contactRoutes = require('./src/routes/contact');
const authRoutes = require('./src/routes/auth');

app.use('/api', contactRoutes);
app.use('/api/auth', authRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.send('<h1>API de Formulario funcionando 🎉</h1>');
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
