const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../database/db');
const JWT_SECRET = process.env.JWT_SECRET || 'clave-secreta-super-ultra';

router.post('/login', async (req, res) => {
  const { correo, password } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE correo = ?', [correo]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({ correo: user.correo, id: user.id }, JWT_SECRET, { expiresIn: '2h' });

    // Enviar cookie segura
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // Usa true si despliegas en HTTPS
      sameSite: 'Lax',
      maxAge: 2 * 60 * 60 * 1000 // 2 horas
    });

    res.json({ message: 'Login exitoso' });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/auth/me - Verifica si el usuario tiene sesión activa
router.get('/me', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'No autenticado' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ correo: decoded.correo, id: decoded.id });
  } catch (err) {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
});

// POST /api/auth/logout - Cierra sesión (elimina la cookie)
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: false,
    sameSite: 'Lax',
  });
  res.json({ message: 'Sesión cerrada correctamente' });
});


module.exports = router;
