const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const Users = db.users;
const yup = require("yup");
const Sequelize = require("sequelize");
const { Sentry } = require("../../../utils/sentry");

//function for find user by username
const findUserByUserName = async (userName, res) => {
  try {
    let userList = await Users.findAll({
      where: {
        name: {
          [Sequelize.Op.iLike]: "%" + userName + "%",
        },
      },
    });
    return userList;
  } catch (err) {
    Sentry.captureException(err);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

//function for find user by git handle
const findUserByGitHandle = async (gitHandle, res) => {
  try {
    let userList = await Users.findAll({
      where: {
        [Sequelize.Op.or]: [
          {
            gitlab_handle: {
              [Sequelize.Op.iLike]: "%" + gitHandle + "%",
            },
          },
          {
            github_handle: {
              [Sequelize.Op.iLike]: "%" + gitHandle + "%",
            },
          },
          {
            bitbucket_handle: {
              [Sequelize.Op.iLike]: "%" + gitHandle + "%",
            },
          },
        ],
      },
    });
    return userList;
  } catch (err) {
    Sentry.captureException(err);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

//function for find user by user id
const findUserByUserId = async (res, userId) => {
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
          res.status(200).json(user);
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
};
//get user list
const findUser = async (req, res) => {
  try {
    const { userName, gitHandle, userId } = req.query;
    if (userName) {
      let userList = await findUserByUserName(userName, res);
      res.status(200).json(userList);
    } else if (gitHandle) {
      const userList = await findUserByGitHandle(gitHandle, res);
      res.status(200).json(userList);
    } else if (userId) {
      await findUserByUserId(res, userId);
    } else {
      res.status(400).json({
        message: "Params Required",
      });
    }
  } catch (err) {
    Sentry.captureException(err);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export default findUser;
