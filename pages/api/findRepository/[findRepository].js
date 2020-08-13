const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const Repositories = db.repositories;
const Sequelize = require("sequelize");
const findRepos = async (req, res) => {
  try{
  const repositoryName = req.query.repositoryName;
  const repoList = await Repositories.findAll({
    where: {
      [Sequelize.Op.or]: {
        name: {
          [Sequelize.Op.iLike]: "%" + repositoryName + "%",
        },
      },
    }
  })
  res.status(200).json(repoList);
  } catch {
    res.status(500).json({
      message: "internal server error"
    })
  }
  
}

export default findRepos;
