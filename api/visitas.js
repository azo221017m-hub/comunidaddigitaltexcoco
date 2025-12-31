// api/visitas.js
const { getConnection } = require('./db');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    let connection;
    try {
      // Create a new connection for this request
      connection = await getConnection();

      // Increase counter by 1
      const updateSql = 'UPDATE contador SET visitas = visitas + 1 WHERE id = 1';
      await connection.execute(updateSql);

      // Get the updated value
      const selectSql = 'SELECT visitas FROM contador WHERE id = 1';
      const [results] = await connection.execute(selectSql);

      if (results.length > 0) {
        res.status(200).json({ visitas: results[0].visitas });
      } else {
        res.status(200).json({ visitas: 0 });
      }
    } catch (err) {
      console.error('Error with visits:', err);
      res.status(500).json({ error: err.message });
    } finally {
      // Always close the connection
      if (connection) {
        await connection.end();
      }
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
