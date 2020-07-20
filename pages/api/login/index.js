const pool = require("../../../config/postgres-config");

export default async function login(req, res) {
  try {
    let result = await pool.query("SELECT * FROM users where email = 'onkar.hasabe@joshsoftware.com'")
    if (result.rows[0]) {
      res.status(200).json(result.rows);
    } else {
      res.status(400).json({ message: "internal server error" });
    }
  } catch {
    res.status(500).json({ message: "internal server error" });
  }
}