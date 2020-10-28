const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const Users = db.users;
const yup = require("yup");
const Sequelize = require("sequelize");
const log4js = require("../../../config/loggerConfig");
const logger = log4js.getLogger();
const { Sentry } = require("../../../utils/sentry");
const {
  INTERNAL_SERVER_ERROR,
  USER_NOT_FOUND,
  VALIDATION_ERROR,
} = require("../../../constants/responseConstants");

//function for find user by username
const findUserByUserName = async (userName) => {
  let userList = await Users.findAll({
    where: {
      name: {
        [Sequelize.Op.iLike]: "%" + userName + "%",
      },
    },
  });
  return userList;
};

//function for find user by git handle
const findUserByGitHandle = async (gitHandle) => {
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
};

//function for find user by user id
const validateUserId = async (userId) => {
  let valid = await yup
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
  return valid;
};

//function for find user by user id
const findUserByUserId = async (userId) => {
  let user = await Users.findOne({
    where: {
      id: userId,
    },
  });
  return user;
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
          res.status(404).json(USER_NOT_FOUND);
        }
      } else {
        VALIDATION_ERROR.errors = validateError;
        res.status(400).json(VALIDATION_ERROR);
      }
    } else {
      res.status(400).json(VALIDATION_ERROR);
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error("Error executing in find user api");
    logger.error(err);
    logger.info("=========================================");
    res.status(500).json(INTERNAL_SERVER_ERROR);
  }
};

export default findUser;
