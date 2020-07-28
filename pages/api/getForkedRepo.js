const dbConn = require("../../models/sequelize");
dbConn.sequelize;
const db = require("../../models/sequelize");
const Repositories = db.repositories;

Repositories.belongsTo(Repositories, { foreignKey: { name: 'parent_repo_id', allowNull: true }, as: "child_of" })
Repositories.hasMany(Repositories, { foreignKey: { name: 'parent_repo_id', allowNull: true }, as: "parent_of" })

const getForkedRepos = async (req, res) => {
  let data = await Repositories.findAll({
    where: { parent_repo_id: req.query.id },
    include: [
      {
        model: Repositories,
        as: "child_of",
        include: [{
          model: Repositories,
          as: "parent_of",
        }]
      },
      {
        model: Repositories,
        as: "parent_of"
      },
    ]
  });
  res.json(data);
};

export default getForkedRepos;
