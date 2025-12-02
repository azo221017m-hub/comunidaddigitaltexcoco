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

// Servir archivos de uploads (imágenes de negocios)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/mock.html'));
});

// Configuración Multer con límite de 4MB
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 4 * 1024 * 1024 }, // 4MB limit
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Solo se permiten archivos de imagen.'), false);
    }
    cb(null, true);
  }
});


// Helper function to validate URLs
function isValidUrl(string) {
  if (!string || string.trim() === '') return true; // Empty is allowed
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Ruta para registrar negocio con imágenes
app.post('/api/negocios', upload.fields([
  { name: 'imagen1', maxCount: 1 },
  { name: 'imagen2', maxCount: 1 },
  { name: 'imagen3', maxCount: 1 }
]), (req, res) => {
  console.log('📥 Llega POST /api/negocios');
  console.log('Campos recibidos:', req.body);
  console.log('Archivos recibidos:', req.files);

  const { nombredenegocio, propietario, telnegocio, descripcionnegocio, tiponegocio, ubinegocio } = req.body;

  // Get uploaded file paths (stored as URLs relative to /uploads)
  const baseUrl = 'https://comunidaddigitaltexcoco.onrender.com/uploads/';
  const imagen1 = req.files && req.files['imagen1'] ? baseUrl + req.files['imagen1'][0].filename : null;
  const imagen2 = req.files && req.files['imagen2'] ? baseUrl + req.files['imagen2'][0].filename : null;
  const imagen3 = req.files && req.files['imagen3'] ? baseUrl + req.files['imagen3'][0].filename : null;

  // Validate URL field (only ubinegocio now)
  if (!isValidUrl(ubinegocio)) {
    return res.status(400).send('❌ URL inválida en el campo: ubinegocio');
  }

  const sql = `
    INSERT INTO negociostbl
    (nombredenegocio, propietario, telnegocio, descripcionnegocio, imagen1, imagen2, imagen3, tiponegocio, ubinegocio, estatusnegocio, fecharegistro)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW())
  `;

  db.query(sql, [nombredenegocio, propietario, telnegocio, descripcionnegocio, imagen1, imagen2, imagen3, tiponegocio, ubinegocio || null], (err, result) => {
    if (err) {
      console.error('Error al insertar en DB:', err);
      return res.status(500).send('❌ Error al guardar en DB');
    }
    res.send('✅ Negocio registrado correctamente');
  });
});


// Ruta para obtener negocios activos (estatusnegocio=1)
app.get('/api/negocios', (req, res) => {
  const sql = 'SELECT id, nombredenegocio, propietario, telnegocio, descripcionnegocio, imagen1, imagen2, imagen3, tiponegocio, ubinegocio, fecharegistro FROM negociostbl WHERE estatusnegocio = 1';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener negocios:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});



// Ruta para obtener y aumentar visitas
app.get('/api/visitas', (req, res) => {
  // 1Aumentar en 1 el contador

  const updateSql = 'UPDATE contador SET visitas = visitas + 1 WHERE id = 1';
  db.query(updateSql, (err) => {
    if (err) return res.status(500).json({ error: err.message });

    // 2️Obtener el valor actualizado
    const selectSql = 'SELECT visitas FROM contador WHERE id = 1';
    db.query(selectSql, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      if (results.length > 0) {
        res.json({ visitas: results[0].visitas });
      } else {
        res.json({ visitas: 0 });
      }
    });
  });
});



//LLAMA APP para concola
app.listen(3000, () => console.log('🚀 Servidor corriendo en http://localhost:3000'));