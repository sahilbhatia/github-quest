const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const Repositories = db.repositories;

const updateSuspiciousRepos = async (req, res) => {
  const repoId = req.query.id;
  try {
    if (repoId != "undefined") {
      const suspeciousRepo = await Repositories.update({ is_suspicious: true }, {
        returning: true,
        plain: true,
        where: { id: repoId },
      });

      if (suspeciousRepo[1].dataValues.parent_repo_id) {
        await Repositories.update({ is_suspicious: true }, {
          returning: true,
          where: { parent_repo_id: suspeciousRepo[1].dataValues.parent_repo_id },
        });
      }

      await Repositories.update({ is_suspicious: true }, {
        returning: true,
        where: { parent_repo_id: suspeciousRepo[1].dataValues.id },
      });
      res.status(200).json({
        message: "repo updated successfully"
      })
    }
  } catch {
    res.status(500).json({
      message: "internal server error"
    })
  }
}

export default updateSuspiciousRepos;

