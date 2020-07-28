const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const Repositories = db.repositories;

const updateSuspiciousRepos = async (req, res) => {
  const repoId = req.query.id;
  console.log("hiiiiiiiiiiiiiiii")
  try {
    if (repoId != "undefined") {
      await Repositories.update({ is_suspicious: true }, {
        returning: true,
        where: { id: repoId },
      });
    }
    res.status(200).json({
      message: "repo updated successfully"
    })

  } catch {
    res.status(500).json({
      message: "internal server error"
    })
  }
}

export default updateSuspiciousRepos;
