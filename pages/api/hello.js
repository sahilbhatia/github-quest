// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const pool = require('./mypool')

export default (req, res) => {
   pool.query('SELECT * FROM player ORDER BY id ASC', (error, results) => {
    if (error) {
      throw error
    }
    res.status(200).json(results.rows)
  })
}
