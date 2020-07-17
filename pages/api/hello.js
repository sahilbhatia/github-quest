// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const pool = require('./mypool')

export default (req, res) => {
  pool.query('SELECT * FROM player ORDER BY id ASC')
    .then(results => {
      res.status(200).send(results.rows);
    })
    .catch(err => {
      res.status(500)
    })
}
