// backend/server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer'); // Para subir imágenes
const bodyParser = require('body-parser');
const db = require('./db');
const path = require('path');
const router = express.Router();

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

const upload = multer({ storage: storage });


// Ruta para guardar negocio
router.post("/negocios", upload.single("imagen"), (req, res) => {
  const { nobredenegocio, propietario, telnegocio, descripcionnegocio } = req.body;
  const imagen = req.file ? req.file.filename : null;

  const sql = `
    INSERT INTO negociostbl 
    (nobredenegocio, propietario, telnegocio, descripcionnegocio, imagen, fecharegistro, estatusnegocio)
    VALUES (?, ?, ?, ?, ?, NOW(), 1)
  `;

  db.query(sql, [nobredenegocio, propietario, telnegocio, descripcionnegocio, imagen], (err, result) => {
    if (err) {
      console.error("❌ Error al insertar:", err);
      return res.status(500).send("Error al guardar en la BD");
    }
    console.log("✅ Registro insertado:", result.insertId);
    res.send("Negocio guardado correctamente");
  });
});

module.exports = router;



app.listen(3306, () => console.log('🚀 Servidor corriendo en :3306'));
