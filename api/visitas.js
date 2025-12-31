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

      // Use a transaction to ensure atomicity
      await connection.beginTransaction();

      try {
        // Increase counter by 1
        await connection.execute('UPDATE contador SET visitas = visitas + 1 WHERE id = 1');

        // Get the updated value
        const [results] = await connection.execute('SELECT visitas FROM contador WHERE id = 1');

        await connection.commit();

        if (results.length > 0) {
          res.status(200).json({ visitas: results[0].visitas });
        } else {
          res.status(200).json({ visitas: 0 });
        }
      } catch (err) {
        // Rollback transaction on error
        await connection.rollback();
        throw err;
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
