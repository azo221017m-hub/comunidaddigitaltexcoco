// api/visitas.js
const db = require('./db');

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
    // Increase counter by 1
    const updateSql = 'UPDATE contador SET visitas = visitas + 1 WHERE id = 1';
    
    db.query(updateSql, (err) => {
      if (err) {
        console.error('Error updating visits:', err);
        return res.status(500).json({ error: err.message });
      }

      // Get the updated value
      const selectSql = 'SELECT visitas FROM contador WHERE id = 1';
      db.query(selectSql, (err, results) => {
        if (err) {
          console.error('Error getting visits:', err);
          return res.status(500).json({ error: err.message });
        }

        if (results.length > 0) {
          res.status(200).json({ visitas: results[0].visitas });
        } else {
          res.status(200).json({ visitas: 0 });
        }
      });
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
