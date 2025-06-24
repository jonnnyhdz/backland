const express = require('express');
const router = express.Router();
const db = require('../database/db');


router.post('/contact', async (req, res) => {
  const { name, surname, phone, gmail, message } = req.body;

  try {
    await db.query('CALL insertForm(?, ?, ?, ?, ?)', [name, surname, phone, gmail, message]);
    res.status(201).json({ message: 'Formulario guardado exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar el formulario' });
  }
});

router.get('/contacts', async (req, res) => {
  try {
    const [rows] = await db.query('CALL getAllContacts()');
    res.json(rows[0]); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los formularios' });
  }
});

router.get('/contact/filter', async (req, res) => {
  const { name, surname, gmail } = req.query;

  try {
    const [rows] = await db.query(
      'CALL filterContacts(?, ?, ?)',
      [
        name || null,
        surname || null,
        gmail || null
      ]
    );
    res.json(rows[0]); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al filtrar los formularios' });
  }
});

module.exports = router;

