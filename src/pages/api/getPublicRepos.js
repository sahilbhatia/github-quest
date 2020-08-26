const Sequelize = require("sequelize");
const moment = require("moment");
const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const Repositories = db.repositories;
const Users_repositories = db.users_repositories;
const Users = db.users;

Users_repositories.belongsTo(Repositories, { foreignKey: { name: 'repository_id', allowNull: true } });
Repositories.hasMany(Users_repositories, { foreignKey: { name: 'repository_id', allowNull: true } });

Users_repositories.belongsTo(Users, { foreignKey: { name: 'user_id', allowNull: true } });
Users.hasMany(Users_repositories, { foreignKey: { name: 'user_id', allowNull: true } });

Repositories.hasMany(Repositories, { foreignKey: { name: 'parent_repo_id', allowNull: true }, as: "parent_of" });

const getAllPublicRepos = async (req, res) => {
  let where = {};
  let findUserWhereClause = {};
  let {
    repoName,
    userName,
    is_forked,
    is_archived,
    is_disabled,
    limit,
    offset,
    startDate,
    reviewDate,
    endDate,
    is_suspicious,
    is_private,
    review,
    error_details,
    userId
  } = req.query;
  const getUsersWhereClause = () => {
    if (userId != undefined) {
      findUserWhereClause = {
        model: Users_repositories,
        include: {
          model: Users,
          where: {
            id: userId
          }
        },
      }
      return findUserWhereClause;
    }
    if (userName != undefined) {
      findUserWhereClause = {
        model: Users_repositories,
        include: {
          model: Users,
          where: {
            [Sequelize.Op.or]: {
              name: {
                [Sequelize.Op.iLike]: "%" + userName + "%",
              },
            },
          }
        },
      }
      return findUserWhereClause;
    } else {
      findUserWhereClause = {
        model: Users_repositories,
        include: {
          model: Users,
        },
      }
      return findUserWhereClause;
    }
  }

  const getIncludeUsersModel = await getUsersWhereClause();

  let findAllClause = {
    order: [["id", "ASC"]],
    include: [
      getIncludeUsersModel
      ,
      {
        model: Repositories,
        as: "parent_of"
      },
    ],
    limit: limit,
    offset: offset,
  }

  const getWhereClause = () => {
    if (repoName || is_forked || is_archived || is_disabled || startDate || endDate || is_suspicious || is_private || review || reviewDate || error_details) {
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

      if (is_private == "true" || is_private == "false") {
        where.is_private = is_private;
      }

      if (startDate != undefined && endDate != undefined) {
        where.created_at = {
          [Sequelize.Op.between]: [new Date(startDate), new Date(endDate)]
        }
      } else if (endDate != undefined) {
        where.created_at = {
          [Sequelize.Op.lt]: new Date(endDate),
        }
      } else if (startDate != undefined) {
        const date = new Date();
        where.created_at = {
          [Sequelize.Op.between]: [new Date(startDate), date]
        }
      }

      if (reviewDate != undefined) {
        let endDate = moment(reviewDate).add(24, "hours").toISOString();
        let startDate = reviewDate;
        where.reviewed_at = {
          [Sequelize.Op.between]: [startDate, endDate]
        }
      }

      if (error_details == "true" || error_details == "false") {
        if (error_details == "true") {
          where.error_details = {
            [Sequelize.Op.ne]: null
          }
        } else if (error_details == "false") {
          where.error_details = {
            [Sequelize.Op.eq]: null
          }
        }
      }
      return where;
    }
  }

  const getWhereClauseObject = await getWhereClause();

  if (getWhereClauseObject) {
    try {
      findAllClause.where = getWhereClauseObject
      const repositories = await Repositories.findAll(findAllClause);
      const earliestDate = await Repositories.findAll({
        attributes: [[Sequelize.fn('min', Sequelize.col("created_at")), 'min']]
      })
      let data = {};
      data.repositories = repositories,
        data.date = earliestDate[0];
      if (userId != undefined) {
        const user = await Users.findOne({ where: { id: userId } });
        data.userName = user.name;
        res.status(200).json(data);
      } else {
        res.status(200).json(data);
      }

    } catch {
      res.status(500).json({
        message: "internal server error"
      })
    }
  } else {
    try {
      const repositories = await Repositories.findAll(findAllClause);
      const earliestDate = await Repositories.findAll({
        attributes: [[Sequelize.fn('min', Sequelize.col("created_at")), 'min']]
      })
      let data = {};
      data.repositories = repositories,
        data.date = earliestDate[0];
      if (userId != undefined) {
        const user = await Users.findOne({ where: { id: userId } });
        data.userName = user.name;
        res.status(200).json(data);
      } else {
        res.status(200).json(data);
      }
    } catch {
      res.status(500).json({
        message: "internal server error"
      })
    }
  }
};

export default getAllPublicRepos;
