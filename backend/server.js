// backend/server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer'); // Para subir imágenes
const bodyParser = require('body-parser');
const db = require('./db');
const path = require('path');
const router = express.Router();
const PORT = process.env.PORT || 3000;
const fs = require('fs');


const app = express();
app.use(cors());
app.use(bodyParser.json());

// Servir archivos estáticos (tu carpeta frontend)
app.use(express.static('../frontend'));

//     Ruta por defecto -> index.html
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: '../frontend' });
});


// Crear carpeta de uploads si no existe
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// Ruta para recibir el archivo
app.post("/api/upload", upload.single("imagen"), (req, res) => {
  if (!req.file) return res.status(400).send("No se envió archivo");
  
  res.send(`Archivo guardado como: ${req.file.filename}`);
});

// Servir archivos estáticos para acceder a ellos
app.use("/uploads", express.static(uploadDir));



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
