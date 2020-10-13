const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const Repositories = db.repositories;
const Users_repositories = db.users_repositories;
const Users = db.users;
const Sequelize = require("sequelize");
const yup = require("yup");
const { Sentry } = require("../../../utils/sentry");

//function for get repository list by user id
const getRepositoriesByUserId = async (userId, repositoryName) => {
  try {
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
  } catch (err) {
    Sentry.captureException(err);
    throw err;
  }
};

//function for get repository list by username
const getRepositoriesByUserName = async (userName, repositoryName) => {
  try {
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
  } catch (err) {
    Sentry.captureException(err);
    throw err;
  }
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
          try {
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
          } catch (err) {
            Sentry.captureException(err);
            res.status(500).json({
              message: "Internal Server Error",
            });
          }
        })
        .catch((err) => {
          Sentry.captureException(err);
          const errors = err.errors;
          res.status(400).json({
            message: "Validation Error",
            errors,
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
  } catch (err) {
    Sentry.captureException(err);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export default findRepository;
