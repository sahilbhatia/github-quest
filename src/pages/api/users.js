const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const Sequelize = require("sequelize");
const db = require("../../../models/sequelize");
const { Sentry } = require("../../../utils/sentry");
const log4js = require("../../../config/loggerConfig");
const logger = log4js.getLogger();
const Users_projects = db.users_projects;
const Users = db.users;
const Users_repositories = db.users_repositories;

//function for get git handle where clause
const getGitHandleClause = (gitHandle) => {
  let where = {
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
  };
  return where;
};

//function for get where clause
const getWhereClause = (
  userName,
  gitHandle,
  startDate,
  endDate,
  error_details
) => {
  let where = {
    name: {
      [Sequelize.Op.ne]: "unknown",
    },
  };
  if (userName != undefined) {
    where.name = {
      [Sequelize.Op.eq]: userName,
    };
  }
  if (gitHandle != undefined) {
    where = getGitHandleClause(gitHandle);
  }
  if (error_details == "true" || error_details == "false") {
    if (error_details == "true") {
      where.error_details = {
        [Sequelize.Op.ne]: null,
      };
    } else if (error_details == "false") {
      where.error_details = {
        [Sequelize.Op.eq]: null,
      };
    }
  }
  if (startDate != undefined && endDate != undefined) {
    where.created_at = {
      [Sequelize.Op.between]: [new Date(startDate), new Date(endDate)],
    };
  } else if (endDate != undefined) {
    where.created_at = {
      [Sequelize.Op.lt]: new Date(endDate),
    };
  } else if (startDate != undefined) {
    const date = new Date();
    where.created_at = {
      [Sequelize.Op.between]: [new Date(startDate), date],
    };
  }
  return where;
};

// function for get user list
const getUserList = async (where, limit, offset) => {
  const usersData = await Users.findAll({
    where,
    include: [
      {
        model: Users_projects,
        attributes: ["id"],
      },
      {
        model: Users_repositories,
        attributes: ["id"],
      },
    ],
    limit: limit,
    offset: offset,
  });
  const earliestDate = await Users.findAll({
    attributes: [[Sequelize.fn("min", Sequelize.col("created_at")), "min"]],
  });
  let data = {};
  (data.users = usersData), (data.date = earliestDate[0]);
  return data;
};

//get users
const getUsers = async (req, res) => {
  try {
    let {
      limit,
      offset,
      userName,
      gitHandle,
      startDate,
      endDate,
      error_details,
    } = req.query;
    const where = getWhereClause(
      userName,
      gitHandle,
      startDate,
      endDate,
      error_details
    );
    const data = await getUserList(where, limit, offset);
    res.status(200).json(data);
  } catch (err) {
    Sentry.captureException(err);
    logger.error("Error executing while getting user list");
    logger.error(err);
    logger.info("=========================================");
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export default getUsers;
