const db = require("../../config/postgres-config")
const data = (req, res) => {
  db.query('SELECT * FROM users ', (error, results) => {
    if (error) {
      throw error
    }
    res.status(200).send(results.rows);
  })
};

export default data;
