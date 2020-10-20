const Sequelize = require("sequelize");
const moment = require("moment");
const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const { Sentry } = require("../../../utils/sentry");
const log4js = require("../../../config/loggerConfig");
const logger = log4js.getLogger();
const Repositories = db.repositories;
const Users_repositories = db.users_repositories;
const Users = db.users;
const Commits = db.commits;
const yup = require("yup");

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

//function for get find all clause for user
const getFindAllUserClause = (userId, limit, offset) => {
  let findAllClause = {
    order: [["id", "ASC"]],
    include: [
      {
        model: Users_repositories,
        include: {
          model: Users,
          where: {
            id: userId,
          },
        },
      },
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

//get repositories
const getAllPublicRepos = async (req, res) => {
  let { limit, offset, userId } = req.query;
  limit = limit == undefined ? 10 : limit;
  await yup
    .object()
    .shape({
      userId: yup.number(),
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
        if (!user) {
          res.status(404).json({
            message: "User Not Found For Specified Id",
          });
        } else {
          let findAllClause = getFindAllUserClause(userId, limit, offset);
          const getWhereClauseObject = await getWhereClause(req.query);

          findAllClause.where = getWhereClauseObject;
          const repositories = await Repositories.findAll(findAllClause);
          const earliestDate = await Repositories.findAll({
            attributes: [
              [Sequelize.fn("min", Sequelize.col("created_at")), "min"],
            ],
          });
          let data = {};
          (data.repositories = repositories), (data.date = earliestDate[0]);
          const user = await Users.findOne({ where: { id: userId } });
          data.userName = user.name;
          res.status(200).json(data);
        }
      } catch (err) {
        Sentry.captureException(err);
        logger.error("Error executing in user repositories api");
        logger.error(err);
        logger.info("=========================================");
        res.status(500).json({
          message: "Internal Server Error",
        });
      }
    })
    .catch((err) => {
      Sentry.captureException(err);
      res.status(400).json({
        message: "User Id Must Be Number",
      });
    });
};

export default getAllPublicRepos;
