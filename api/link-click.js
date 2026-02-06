// api/link-click.js
const { getConnection } = require('./db');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let connection;
  
  try {
    const { negocioId } = req.body;

    if (!negocioId) {
      return res.status(400).json({ error: 'negocioId es requerido' });
    }

    // Create a new connection for this request
    connection = await getConnection();

    // Increment contadorlink1 (treat NULL as 0)
    const sql = `
      UPDATE negociostbl 
      SET contadorlink1 = COALESCE(contadorlink1, 0) + 1 
      WHERE id = ?
    `;
    
    const [result] = await connection.execute(sql, [negocioId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Negocio no encontrado' });
    }

    // Get the updated counter value
    const [rows] = await connection.execute(
      'SELECT contadorlink1 FROM negociostbl WHERE id = ?',
      [negocioId]
    );

    res.status(200).json({ 
      success: true, 
      contadorlink1: rows[0]?.contadorlink1 || 0 
    });
  } catch (err) {
    console.error('Error en link-click API:', err);
    res.status(500).json({ error: 'Error al procesar solicitud', details: err.message });
  } finally {
    // Always close the connection
    if (connection) {
      await connection.end();
    }
  }
};
