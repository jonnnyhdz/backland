const express = require('express');
const axios = require('axios');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const db = require('../database/db');
const { enviarCorreo } = require('../utils/emailSender');

// Variables de entorno
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET;

// POST /api/contact
router.post(
  '/contact',
  [
    body('name').trim().escape().notEmpty().withMessage('El nombre es requerido'),
    body('phone').trim().isMobilePhone().withMessage('Teléfono inválido'),
    body('gmail').trim().isEmail().withMessage('Correo inválido'),
    body('message').trim().escape().notEmpty().withMessage('El mensaje es requerido'),
    body('captcha').notEmpty().withMessage('Captcha requerido'),
    body('aceptaTerminos').isBoolean().withMessage('Debes aceptar los términos'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errores: errors.array() });
    }

    const { name, phone, gmail, message, captcha, aceptaTerminos } = req.body;

    try {
      // Validación con Google reCAPTCHA
      
      const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
        params: {
          secret: RECAPTCHA_SECRET,
          response: captcha,
        },
      });

      if (!response.data.success) {
        return res.status(400).json({ error: 'Verificación de reCAPTCHA fallida.' });
      }

      // Guardar en la base de datos
      await db.query(
        'INSERT INTO contact (name, phone, gmail, message, captcha_token, acepta_terminos) VALUES (?, ?, ?, ?, ?, ?)',
        [name, phone, gmail, message, captcha, aceptaTerminos ? 1 : 0]
      );
console.log('📧 Enviando correo a:', process.env.EMAIL_RECEIVER);

      // Enviar notificación por correo al administrador
      await enviarCorreo({ name, phone, gmail, message });

      return res.status(201).json({ message: 'Formulario guardado y correo enviado exitosamente.' });

    } catch (err) {
      console.error('❌ Error en POST /contact:', err.message || err);
      return res.status(500).json({ error: 'Ocurrió un error al procesar el formulario.' });
    }
  }
);

// GET /api/contacts
router.get('/contacts', async (req, res) => {
  try {
    const [rows] = await db.query('CALL getAllContacts()');
    res.json(rows[0]);
  } catch (err) {
    console.error('❌ Error en GET /contacts:', err);
    res.status(500).json({ error: 'Error al obtener los contactos' });
  }
});

// GET /api/contact/filter
router.get('/contact/filter', async (req, res) => {
  const { name, gmail } = req.query;

  try {
    const [rows] = await db.query('CALL filterContacts(?, ?)', [
      name || null,
      gmail || null
    ]);
    res.json(rows[0]);
  } catch (err) {
    console.error('❌ Error en GET /contact/filter:', err);
    res.status(500).json({ error: 'Error al filtrar los contactos' });
  }
});


// POST /api/contact/responder
router.post('/contact/responder', async (req, res) => {
  const { correoDestino, mensaje, estado = 1 } = req.body;

  if (!correoDestino) {
    return res.status(400).json({ error: 'Correo destino requerido' });
  }

  try {
    // Solo enviar correo si es un mensaje real (estado = 1)
    if (estado === 1) {
      if (!mensaje) {
        return res.status(400).json({ error: 'Mensaje requerido para responder' });
      }

      await enviarCorreo({
        gmail: correoDestino,
        name: 'Boost Media',
        phone: 'No aplica',
        message: mensaje
      });
    }

    // Actualizar el estado del contacto: 1 (respondido), -1 (descartado)
    await db.query('UPDATE contact SET respondido = ? WHERE gmail = ?', [estado, correoDestino]);

    const mensajeEstado = estado === -1 ? 'descartado' : 'respondido';
    res.status(200).json({ message: `Contacto marcado como ${mensajeEstado}` });

  } catch (error) {
    console.error('❌ Error al procesar el contacto:', error.message || error);
    res.status(500).json({ error: 'No se pudo procesar la solicitud' });
  }
});

router.get('/test-proc', async (req, res) => {
  try {
    const [rows] = await db.query('CALL getAllContacts()');
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


module.exports = router;
