const pool = require("../../../config/postgres-config");

export default async function login(req, res) {
  try {
    const userId = await pool.query("select id from repositories where name = 'onkar'");

    const result = await pool.query("SELECT repositories.* FROM repositories INNER JOIN users_repositories ON users_repositories.repository_id  = repositories.id where users_repositories.user_id="+userId.rows[0].id+"");
    if (result.rows) {
      res.status(200).json({
        data: result.rows,
      });
    }
  } catch {
    res.status(500).json({ message: "internal server error" });
  }
}
