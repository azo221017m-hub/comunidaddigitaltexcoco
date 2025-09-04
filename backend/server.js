// backend/server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer'); // Para subir imágenes
const bodyParser = require('body-parser');
const db = require('./db');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Servir archivos estáticos (tu carpeta frontend)
app.use(express.static('../frontend'));

// Ruta por defecto -> index.html
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: '../frontend' });
});


// Configuración Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });


// Ruta para registrar negocio
app.post('/api/negocios', upload.single('imagen'), (req, res) => {
  console.log('📥 Llega POST /api/negocios');
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


// Ruta para obtener visitas
app.get('/api/visitas', (req, res) => {
  const sql = 'SELECT visitas FROM contador WHERE id = 1';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0) {
      res.json({ visitaSS: results[0].visitas });
    } else {
      res.json({ VIsitas: 0 });
    }
  });
});



//LLAMA APP para concola
app.listen(3000, () => console.log('🚀 Servidor corriendo en http://localhost:3000'));