const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const Repositories = db.repositories;

const updateManualRepos = async (req, res) => {
  const repoId = req.query.id;
  try {
    if (repoId != "undefined") {
      const manualRepoReview = await Repositories.update({ manual_review: false }, {
        returning: true,
        plain: true,
        where: { id: repoId },
      });

      if (manualRepoReview[1].dataValues.parent_repo_id) {
        await Repositories.update({ manual_review: false }, {
          returning: true,
          where: { parent_repo_id: manualRepoReview[1].dataValues.parent_repo_id },
        });
      }

      await Repositories.update({ manual_review: false }, {
        returning: true,
        where: { parent_repo_id: manualRepoReview[1].dataValues.id },
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

export default updateManualRepos;

