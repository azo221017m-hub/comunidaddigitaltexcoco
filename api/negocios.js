// api/negocios.js
const db = require('./db');

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

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    // Get active businesses
    const sql = 'SELECT id, nombredenegocio, propietario, telnegocio, descripcionnegocio, imagen1, imagen2, imagen3, tiponegocio, ubinegocio, fecharegistro FROM negociostbl WHERE estatusnegocio = 1';
    
    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error al obtener negocios:', err);
        return res.status(500).json({ error: err.message });
      }
      res.status(200).json(results);
    });
  } else if (req.method === 'POST') {
    // Register new business
    // Note: File uploads are not directly supported in Vercel serverless functions
    // This would need to be modified to use cloud storage (e.g., AWS S3, Cloudinary)
    const { nombredenegocio, propietario, telnegocio, descripcionnegocio, tiponegocio, ubinegocio, imagen1, imagen2, imagen3 } = req.body;

    // Validate URL field
    if (!isValidUrl(ubinegocio)) {
      return res.status(400).json({ error: 'URL inválida en el campo: ubinegocio' });
    }

    const sql = `
      INSERT INTO negociostbl
      (nombredenegocio, propietario, telnegocio, descripcionnegocio, imagen1, imagen2, imagen3, tiponegocio, ubinegocio, estatusnegocio, fecharegistro)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW())
    `;

    db.query(sql, [nombredenegocio, propietario, telnegocio, descripcionnegocio, imagen1 || null, imagen2 || null, imagen3 || null, tiponegocio, ubinegocio || null], (err, result) => {
      if (err) {
        console.error('Error al insertar en DB:', err);
        return res.status(500).json({ error: 'Error al guardar en DB' });
      }
      res.status(200).json({ message: 'Negocio registrado correctamente' });
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
