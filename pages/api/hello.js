// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const db = require("./dbConfig")
export default (req, res) => {

  db.query('SELECT * FROM users ', (error, results) => {
    if (error) {
      throw error
    }
    res.status(200).json({data:results})
  })
  
};