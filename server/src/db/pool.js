require('dotenv').config();
const { Pool } = require('pg');

// One shared pool for the whole API. DATABASE_URL comes from server/.env.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = pool;
