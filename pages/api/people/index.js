const pool = require("../../../config/postgres-config");

export default function handler(req, res) {
  pool.query('SELECT * FROM player ORDER BY id ASC')
    .then(results => {
      res.status(200).json(results.rows);
    })
    .catch(err => {
      res.status(500)
    })
}
