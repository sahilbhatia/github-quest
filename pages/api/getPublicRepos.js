const db = require("../../config/postgres-config")
const data = async (req, res) => {
  try {
    const userId = await db.query("select id from users where name = 'avinash'");
    const result = await db.query("SELECT repositories.* FROM repositories INNER JOIN users_repositories ON users_repositories.repository_id = repositories.id where users_repositories.user_id=" + userId.rows[0].id + "");
    if (result.rows) {
      res.status(200).json(result.rows);
    } else {
      res.status(200).json("list not found");
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "internal server error" });
  }
};

export default data;
