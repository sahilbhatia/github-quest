const Sequelize = require("sequelize");
const moment = require("moment");
const log4js = require("../../../config/loggerConfig");
const { Sentry } = require("../../../utils/sentry");
const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const Repositories = db.repositories;
const Users_repositories = db.users_repositories;
const Users = db.users;
const Commits = db.commits;
const logger = log4js.getLogger();

//function for get where clause
const getWhereClause = ({
  repoName,
  is_forked,
  is_archived,
  is_disabled,
  startDate,
  endDate,
  is_suspicious,
  source_type,
  review,
  reviewDate,
  error_details,
}) => {
  let where = {};
  if (
    repoName ||
    is_forked ||
    is_archived ||
    is_disabled ||
    startDate ||
    endDate ||
    is_suspicious ||
    source_type ||
    review ||
    reviewDate ||
    error_details
  ) {
    if (repoName != undefined) {
      where = {
        [Sequelize.Op.or]: {
          name: {
            [Sequelize.Op.iLike]: "%" + repoName + "%",
          },
        },
      };
    }
    if (review != undefined && review != "undefined") {
      where.review = review;
    }
    if (source_type != undefined && source_type != "undefined") {
      where.source_type = source_type;
    }
    if (is_forked == "true" || is_forked == "false") {
      where.is_forked = is_forked;
    }

    if (is_archived == "true" || is_archived == "false") {
      where.is_archived = is_archived;
    }

    if (is_disabled == "true" || is_disabled == "false") {
      where.is_disabled = is_disabled;
    }

    if (is_suspicious == "true" || is_suspicious == "false") {
      where.is_suspicious = is_suspicious;
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

    if (reviewDate != undefined) {
      let endDate = moment(reviewDate).add(24, "hours").toISOString();
      let startDate = reviewDate;
      where.reviewed_at = {
        [Sequelize.Op.between]: [startDate, endDate],
      };
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
    return where;
  } else null;
};

//function for get where clause for username
const getUsersWhereClause = (userName) => {
  let findUserWhereClause = {};
  if (userName != undefined) {
    findUserWhereClause = {
      model: Users_repositories,
      include: {
        model: Users,
        where: {
          name: userName,
        },
      },
    };
  } else {
    findUserWhereClause = {
      model: Users_repositories,
      include: {
        model: Users,
      },
    };
  }
  return findUserWhereClause;
};

//function for get find all clause
const getFindAllClause = (limit, offset, getIncludeUsersModel) => {
  let findAllClause = {
    order: [["id", "ASC"]],
    distinct: true,
    include: [
      getIncludeUsersModel,
      {
        model: Repositories,
        as: "children",
      },
      {
        model: Commits,
      },
    ],
    limit: limit,
    offset: offset,
  };
  return findAllClause;
};

//function for get last fetch time
const getLastFetchedAt = async () => {
  const time = await Users.findOne({
    attributes: ["last_fetched_at"],
    where: {
      last_fetched_at: {
        [Sequelize.Op.ne]: null,
      },
    },
  });
  return time;
};

//get repositories
const getAllPublicRepos = async (req, res) => {
  try {
    let { userName, limit, offset } = req.query;
    limit = limit == undefined ? 10 : limit;
    //get all repositories
    const getIncludeUsersModel = await getUsersWhereClause(userName);
    let findAllClause = getFindAllClause(limit, offset, getIncludeUsersModel);
    const getWhereClauseObject = await getWhereClause(req.query);
    findAllClause.where = getWhereClauseObject;
    let { count, rows: repositories } = await Repositories.findAndCountAll(
      findAllClause
    );
    const earliestDate = await Repositories.findAll({
      attributes: [[Sequelize.fn("min", Sequelize.col("created_at")), "min"]],
    });
    const lastFetchedAt = await getLastFetchedAt();
    let data = {};
    (data.repositories = repositories),
      (data.date = earliestDate[0]),
      (data.last_fetched_at = lastFetchedAt),
      (data.count = count);
    res.status(200).json(data);
  } catch (err) {
    Sentry.captureException(err);
    logger.error("Error executing in repositories api");
    logger.error(err);
    logger.info("=========================================");
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export default getAllPublicRepos;
