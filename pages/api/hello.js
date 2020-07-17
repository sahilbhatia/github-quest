//Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const db = require("./dbConfig")
const data = (req, res) => {
  db.query('SELECT * FROM users ', (error, results) => {
    if (error) {
      throw error
    }
    res.status(200).send(results.rows.map((item) => item.last_name));
  })
};

export default data;
