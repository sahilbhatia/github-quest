const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const Repositories = db.repositories;
const Users_repositories = db.users_repositories;
const Users = db.users;
const Sequelize = require("sequelize");
const yup = require("yup");

Users_repositories.belongsTo(Repositories, {
  foreignKey: { name: "repository_id", allowNull: true },
});
Repositories.hasMany(Users_repositories, {
  foreignKey: { name: "repository_id", allowNull: true },
});

Users_repositories.belongsTo(Users, {
  foreignKey: { name: "user_id", allowNull: true },
});
Users.hasMany(Users_repositories, {
  foreignKey: { name: "user_id", allowNull: true },
});

//function for get repository list by user id
const getRepositoriesByUserId = async (userId, repositoryName) => {
  const repoList = await Repositories.findAll({
    include: {
      model: Users_repositories,
      include: {
        model: Users,
        where: { id: userId },
      },
    },
    where: {
      name: {
        [Sequelize.Op.iLike]: "%" + repositoryName + "%",
      },
    },
  });
  let arr = [];
  repoList.map((item) => {
    if (item.users_repositories.length != 0) {
      arr.push(item);
    }
  });
  return arr;
};

//function for get repository list by username
const getRepositoriesByUserName = async (userName, repositoryName) => {
  const repoList = await Repositories.findAll({
    include: {
      model: Users_repositories,
      include: {
        model: Users,
        where: { name: userName },
      },
    },
    where: {
      name: {
        [Sequelize.Op.iLike]: "%" + repositoryName + "%",
      },
    },
  });
  let arr = [];
  repoList.map((item) => {
    if (item.users_repositories.length != 0) {
      arr.push(item);
    }
  });
  return arr;
};

//function for find repositories
const findRepository = async (req, res) => {
  try {
    const { repositoryName, userName, userId } = req.query;
    if (userId != "undefined" && userId != undefined) {
      await yup
        .object()
        .shape({
          userId: yup.number().required({ userId: "required" }),
        })
        .validate({
          userId: userId,
        })
        .then(async () => {
          let user = await Users.findOne({
            where: {
              id: userId,
            },
          });
          if (user) {
            const repoList = await getRepositoriesByUserId(
              userId,
              repositoryName
            );
            res.status(200).json(repoList);
          } else {
            res.status(404).json({
              message: "User Not Found For Specified Id",
            });
          }
        })
        .catch(() => {
          res.status(400).json({
            message: "User Id Must Be Number",
          });
        });
    } else if (
      userName == "undefined" ||
      userName == undefined ||
      repositoryName == "null"
    ) {
      const repoList = await Repositories.findAll({
        where: {
          name: {
            [Sequelize.Op.iLike]: "%" + repositoryName + "%",
          },
        },
      });
      res.status(200).json(repoList);
    } else {
      const repoList = await getRepositoriesByUserName(
        userName,
        repositoryName
      );
      res.status(200).json(repoList);
    }
  } catch {
    res.status(500).json({
      message: "internal server error",
    });
  }
};

export default findRepository;
