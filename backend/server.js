// backend/server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer'); // Para subir imágenes
const bodyParser = require('body-parser');
const db = require('./db');
const path = require('path');
const router = express.Router();
const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Servir archivos estáticos (tu carpeta frontend)
app.use(express.static('../frontend'));

//     Ruta por defecto -> index.html
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: '../frontend' });
});


// Configuración de multer para guardar imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/'); // Carpeta donde se guardarán
  },
  filename: function (req, file, cb) {
    // Para evitar sobreescribir archivos con mismo nombre
    cb(null, Date.now() + '-' + file.originalname);
  }
});


app.get('/ping', (req, res) => res.send('pong'));
const upload = multer({ storage: storage });



// Ruta para guardar negocio
app.post('/api/negocios', upload.single('imagen'), (req, res) => {
  const { nobredenegocio, propietario, telnegocio, descripcionnegocio } = req.body;
  const imagen = req.file ? req.file.filename : null;

  const sql = `INSERT INTO negociostbl 
    (nobredenegocio, propietario, telnegocio, descripcionnegocio, imagen) 
    VALUES (?, ?, ?, ?, ?)`;

  db.query(sql, [nobredenegocio, propietario, telnegocio, descripcionnegocio, imagen], (err, result) => {
    if (err) {
      console.error("❌ Error al guardar en DB:", err);
      return res.status(500).send("Error al guardar en la BD");
    }
    res.send("✅ Negocio registrado correctamente");
  });
});



app.listen(PORT, () => {
  console.log(`🚀 Servidor Express corriendo en puerto ${PORT}`);
});
