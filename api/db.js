// api/db.js
const mysql = require('mysql2/promise');

/**
 * Creates a database connection for serverless environments
 * Each serverless function invocation should create and close its own connection
 * to avoid connection pooling issues in stateless environments
 */
async function getConnection() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // Recommended settings for serverless/cloud databases
    connectTimeout: 10000, // 10 seconds
    // SSL is often required for cloud databases
    // Uncomment if your database requires SSL:
    // ssl: { rejectUnauthorized: false }
  });
  return connection;
}

module.exports = { getConnection };
