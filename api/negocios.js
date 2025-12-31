// api/negocios.js
const { getConnection } = require('./db');

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

  let connection;
  
  try {
    // Create a new connection for this request
    connection = await getConnection();

    if (req.method === 'GET') {
      // Get active businesses
      const sql = 'SELECT id, nombredenegocio, propietario, telnegocio, descripcionnegocio, imagen1, imagen2, imagen3, tiponegocio, ubinegocio, fecharegistro FROM negociostbl WHERE estatusnegocio = 1';
      
      const [results] = await connection.execute(sql);
      res.status(200).json(results);
    } else if (req.method === 'POST') {
      // Register new business
      // NOTE: File uploads in Vercel require integration with cloud storage
      // The frontend should handle uploading to cloud storage first, then send URLs here
      
      const { nombredenegocio, propietario, telnegocio, descripcionnegocio, tiponegocio, ubinegocio, imagen1, imagen2, imagen3 } = req.body;

      // Validate required fields
      if (!nombredenegocio || !propietario || !telnegocio) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
      }

      // Validate URL field
      if (!isValidUrl(ubinegocio)) {
        return res.status(400).json({ error: 'URL inválida en el campo: ubinegocio' });
      }

      const sql = `
        INSERT INTO negociostbl
        (nombredenegocio, propietario, telnegocio, descripcionnegocio, imagen1, imagen2, imagen3, tiponegocio, ubinegocio, estatusnegocio, fecharegistro)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW())
      `;

      const [result] = await connection.execute(sql, [
        nombredenegocio, 
        propietario, 
        telnegocio, 
        descripcionnegocio, 
        imagen1 || null, 
        imagen2 || null, 
        imagen3 || null, 
        tiponegocio, 
        ubinegocio || null
      ]);
      
      res.status(200).json({ message: '✅ Negocio registrado correctamente', id: result.insertId });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('Error en negocios API:', err);
    res.status(500).json({ error: 'Error al procesar solicitud', details: err.message });
  } finally {
    // Always close the connection
    if (connection) {
      await connection.end();
    }
  }
};
