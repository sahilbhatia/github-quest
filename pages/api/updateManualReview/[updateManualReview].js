const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const Repositories = db.repositories;

const updateManualRepos = async (req, res) => {
  const repoId = req.query.id;
  try {
    await Repositories.update({ manual_review: false }, {
      returning: true,
      where: { id: repoId },
    });

    res.status(200).json({
      message: "repo updated successfully"
    })

  } catch {
    res.status(500).json({
      message: "internal server error"
    })
  }
}

export default updateManualRepos;

