const jwt = require("jsonwebtoken");

const pool = require("../../../config/postgres-config");

export default async function login(req, res) {
  try {
    const result = await pool.query("SELECT * FROM users where email = 'onkar.hasabe@joshsoftware.com'")
    if (result.rows[0]) {
      const token = jwt.sign(
        {
          id: result.rows[0].id,
          github_handle: result.rows[0].github_handle,
        },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: process.env.JWT_EXPIRE_TIME,
        }
      );
      res.status(200).json({
        data: {
          token: token,
        },
      });
    } else {
      res.status(401).json({ message: "unauthorized user" });
    }
  } catch {
    res.status(500).json({ message: "internal server error" });
  }
}
