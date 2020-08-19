const dbConn = require("../../models/sequelize");
dbConn.sequelize;
const db = require("../../models/sequelize");
const Repositories = db.repositories;
const Users_repositories = db.users_repositories;
const Users = db.users;
const Sequelize = require("sequelize");

Users_repositories.belongsTo(Repositories, { foreignKey: { name: 'repository_id', allowNull: true } });
Repositories.hasMany(Users_repositories, { foreignKey: { name: 'repository_id', allowNull: true } });

Users_repositories.belongsTo(Users, { foreignKey: { name: 'user_id', allowNull: true } });
Users.hasMany(Users_repositories, { foreignKey: { name: 'user_id', allowNull: true } });

const findRepos = async (req, res) => {
  try {
    const { repositoryName, userName, userId } = req.query;
    if (userId != "undefined" && userId != undefined) {
      const repoList = await Repositories.findAll({
        include: {
          model: Users_repositories,
          include: {
            model: Users,
            where: { id: userId }
          }

        },
        where: {
          name: {
            [Sequelize.Op.iLike]: "%" + repositoryName + "%",
          },
        }
      })
      const getList = (repoList) => {
        let arr = [];
        repoList.map((item) => {
          if (item.users_repositories.length != 0) {
            arr.push(item)
          }
        })
        return arr;
      }
      res.status(200).json(getList(repoList));

    } else if (userName == "undefined" || userName == undefined || repositoryName == "null") {
      const repoList = await Repositories.findAll({
        where: {
          name: {
            [Sequelize.Op.iLike]: "%" + repositoryName + "%",
          },
        }
      })
      res.status(200).json(repoList);
    } else {
      const repoList = await Repositories.findAll({
        include: {
          model: Users_repositories,
          include: {
            model: Users,
            where: { name: userName }
          }

        },
        where: {
          name: {
            [Sequelize.Op.iLike]: "%" + repositoryName + "%",
          },
        }
      })
      const getList = (repoList) => {
        let arr = [];
        repoList.map((item) => {
          if (item.users_repositories.length != 0) {
            arr.push(item)
          }
        })
        return arr;
      }
      res.status(200).json(getList(repoList));
    }
  } catch {
    res.status(500).json({
      message: "internal server error"
    })
  }
}

export default findRepos;
