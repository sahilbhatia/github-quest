const Pool = require('pg').Pool
const dbConfig = new Pool({
  user: 'root',
  host: '127.0.0.1',
  database: 'peerly',
  password: 'root',
  port: 5432,
});

module.exports = dbConfig