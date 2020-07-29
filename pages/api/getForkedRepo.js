const dbConn = require("../../models/sequelize");
dbConn.sequelize;
const db = require("../../models/sequelize");
const Repositories = db.repositories;
const Users_repositories = db.users_repositories;
const Users = db.users;

Repositories.belongsTo(Repositories, { foreignKey: { name: 'parent_repo_id', allowNull: true }, as: "child_of" })
Repositories.hasMany(Repositories, { foreignKey: { name: 'parent_repo_id', allowNull: true }, as: "parent_of" })


Users_repositories.belongsTo(Repositories, { foreignKey: { name: 'repository_id', allowNull: true } });
Repositories.hasMany(Users_repositories, { foreignKey: { name: 'repository_id', allowNull: true } });

Users_repositories.belongsTo(Users, { foreignKey: { name: 'user_id', allowNull: true } });
Users.hasMany(Users_repositories, { foreignKey: { name: 'user_id', allowNull: true } });

const getForkedRepos = async (req, res) => {
  try {
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
        {
          model: Users_repositories,
          include: {
            model: Users,
          },
        }
      ]
    });
    res.json(data);
  } catch {
    res.status(500).json({
      message: "internal server error"
    })
  }
};

export default getForkedRepos;
