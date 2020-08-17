const dbConn = require("../../models/sequelize");
dbConn.sequelize;
const db = require("../../models/sequelize");
const Repositories = db.repositories;
const Users_repositories = db.users_repositories;
const Users = db.users;

Repositories.belongsTo(Repositories, { foreignKey: { name: 'parent_repo_id', allowNull: true }, as: "parent" })
Repositories.hasMany(Repositories, { foreignKey: { name: 'parent_repo_id', allowNull: true }, as: "children" })


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
          as: "parent",
          include: [{
            model: Repositories,
            as: "children",
          }]
        },
        {
          model: Repositories,
          as: "children"
        },
        {
          model: Users_repositories,
          include: {
            model: Users,
          },
        }
      ]
    });
    if(data.length==0){
      res.status(404).json({
        message: "list not found for given id"
      });
    };
    res.status(200).json(data);
  } catch {
    res.status(500).json({
      message: "internal server error"
    })
  }
};

export default getForkedRepos;
