const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const Users = db.users;
const yup = require("yup");
const Sequelize = require("sequelize");
const { Sentry } = require("../../../utils/sentry");

//function for find user by username
const findUserByUserName = async (userName) => {
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
    throw err;
  }
};

//function for find user by git handle
const findUserByGitHandle = async (gitHandle) => {
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
    throw err;
  }
};

//function for find user by user id
const validateUserId = async (userId) => {
  await yup
    .object()
    .shape({
      userId: yup.number().required({ userId: "required" }),
    })
    .validate({
      userId: userId,
    })
    .then(async () => {
      return false;
    })
    .catch((err) => {
      Sentry.captureException(err);
      const errors = err.errors;
      return errors;
    });
};

//function for find user by user id
const findUserByUserId = async (userId) => {
  try {
    let user = await Users.findOne({
      where: {
        id: userId,
      },
    });
    return user;
  } catch (err) {
    Sentry.captureException(err);
    throw err;
  }
};

//get user list
const findUser = async (req, res) => {
  try {
    const { userName, gitHandle, userId } = req.query;
    if (userName) {
      let userList = await findUserByUserName(userName);
      res.status(200).json(userList);
    } else if (gitHandle) {
      const userList = await findUserByGitHandle(gitHandle);
      res.status(200).json(userList);
    } else if (userId) {
      const validateError = await validateUserId(userId);
      if (!validateError) {
        const user = await findUserByUserId(userId);
        if (user) {
          res.status(200).json(user);
        } else {
          res.status(404).json({
            message: "User Not Found For Specified Id",
          });
        }
      } else {
        res.status(400).json({
          message: "Validation Error",
          validateError,
        });
      }
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
