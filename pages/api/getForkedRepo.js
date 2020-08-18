const dbConn = require("../../models/sequelize");
dbConn.sequelize;
const db = require("../../models/sequelize");
const Repositories = db.repositories;
const Users_repositories = db.users_repositories;
const Users = db.users;
const yup = require("yup");

Repositories.belongsTo(Repositories, { foreignKey: { name: 'parent_repo_id', allowNull: true }, as: "parent" })
Repositories.hasMany(Repositories, { foreignKey: { name: 'parent_repo_id', allowNull: true }, as: "children" })


Users_repositories.belongsTo(Repositories, { foreignKey: { name: 'repository_id', allowNull: true } });
Repositories.hasMany(Users_repositories, { foreignKey: { name: 'repository_id', allowNull: true } });

Users_repositories.belongsTo(Users, { foreignKey: { name: 'user_id', allowNull: true } });
Users.hasMany(Users_repositories, { foreignKey: { name: 'user_id', allowNull: true } });

const getForkedRepos = async (req, res) => {
    await yup.object().shape({
      repoId: yup
        .number()
        .required({ repoId: "required" }),
    }).validate({
      repoId: req.query.id
    }, { abortEarly: false })
      .then(async()=>{
        try {
        const data =await Repositories.findAll({
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
          if (data.length == 0) {
            res.status(404).json({
              message: "list not found for given id"
            });
          } else {
            res.status(200).json(data);
          }
          } catch {
          res.status(500).json({
            message: "internal server error"
          });
        }
      })
      .catch(() => {
        res.status(400).json({
          message: "repo Id must be number"
        })
      });
  }
export default getForkedRepos;
