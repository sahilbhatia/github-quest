const Pool = require('pg').Pool
const pool = new Pool({
  user: 'omkar',
  host: '127.0.0.1',
  database: 'league',
  password: 'onkar',
  port: 5432,
});

module.exports = pool
