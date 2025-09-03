// backend/server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql');

const app = express();
app.use(cors());

// Carpeta para servir archivos estáticos (frontend)
app.use(express.static('../frontend'));

// Servir archivos estáticos de imágenes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta por defecto -> index.html
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: '../frontend' });
});

// Configuración de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Ruta para registrar un negocio
app.post('/api/negocios', upload.single('imagen'), (req, res) => {
  console.log('Campos recibidos:', req.body);
  console.log('Archivo recibido:', req.file);

  const { nobredenegocio, propietario, telnegocio, descripcionnegocio } = req.body;
  const imagen = req.file ? req.file.filename : null;

  const sql = `
    INSERT INTO negociostbl
    (nobredenegocio, propietario, telnegocio, descripcionnegocio, imagen)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [nobredenegocio, propietario, telnegocio, descripcionnegocio, imagen], (err, result) => {
    if (err) {
      console.error('Error al insertar en DB:', err);
      return res.status(500).send('❌ Error al guardar en DB');
    }
    res.send('✅ Negocio registrado correctamente');
  });
});

// Iniciar servidor
app.listen(3000, () => console.log('🚀 Servidor corriendo en http://localhost:3000'));
