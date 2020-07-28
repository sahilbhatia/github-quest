const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const Repositories = db.repositories;

const updateManualRepos = async (req, res) => {
    console.log("hii")
  const repoId = req.query.id;
  try {
    if (repoId != "undefined") {
      await Repositories.update({ manual_review: false }, {
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

export default updateManualRepos;
