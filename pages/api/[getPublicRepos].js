const Sequelize = require("sequelize");
const moment = require("moment");
const dbConn = require("../../models/sequelize");
dbConn.sequelize;
const db = require("../../models/sequelize");
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
  let like = req.query.repoName;
  let userName = req.query.userName;
  let forked = req.query.is_forked;
  let archived = req.query.is_archived;
  let disabled = req.query.is_disabled;
  let limit = req.query.limit;
  let offset = req.query.offset;
  let startDate = req.query.startDate;
  let reviewDate = req.query.reviewDate;
  let endDate = req.query.endDate;
  let suspicious = req.query.is_suspicious;
  let privateRepo = req.query.is_private;
  let review = req.query.review;
  const getUsersWhereClause = () => {
    if (userName != "undefined") {
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
    if (like || forked || archived || disabled || startDate || endDate || suspicious || privateRepo || review || reviewDate) {
      if (like != "undefined") {
        where = {
          [Sequelize.Op.or]: {
            name: {
              [Sequelize.Op.iLike]: "%" + like + "%",
            },
          },
        };
      }

      if (review == "suspicious auto" || review == "suspicious manual" || review == "approved" || review == "pending") {
        where.review = review;
      }

      if (forked == "true" || forked == "false") {
        where.is_forked = JSON.parse(forked);
      }

      if (archived == "true" || archived == "false") {
        where.is_archived = JSON.parse(archived);
      }

      if (disabled == "true" || disabled == "false") {
        where.is_disabled = JSON.parse(disabled);
      }

      if (suspicious == "true" || suspicious == "false") {
        where.is_suspicious = JSON.parse(suspicious);
      }

      if (privateRepo == "true" || privateRepo == "false") {
        where.is_private = JSON.parse(privateRepo);
      }

      if (startDate != "undefined" && endDate != "undefined") {
        where.created_at = {
          [Sequelize.Op.between]: [moment(startDate).toISOString(), moment(endDate).toISOString()]
        }
      } else if (endDate != "undefined") {
        where.created_at = {
          [Sequelize.Op.lt]: moment(endDate).toISOString(),
        }
      } else if (startDate != "undefined") {
        endDate = moment().toISOString();
        where.created_at = {
          [Sequelize.Op.between]: [moment(startDate).toISOString(), endDate]
        }
      }
      if(reviewDate!="undefined"){
        let endDate = moment(reviewDate).add(1,"days").toISOString();
        let startDate = moment(reviewDate).subtract(1,"days").toISOString();
        where.reviewed_at = {
          [Sequelize.Op.between]: [moment(startDate).toISOString(), endDate]
        }
      }
      return where;
    }
  }

  const getWhereClauseObject = await getWhereClause();

  if (getWhereClauseObject) {
    findAllClause.where = getWhereClauseObject
    const repositories = await Repositories.findAll(findAllClause);
    const earliestDate = await Repositories.findAll({
      attributes: [[Sequelize.fn('min', Sequelize.col("created_at")), 'min']]
    })
    let data = {};
    data.repositories = repositories,
      data.date = earliestDate[0];
    res.status(200).json(data);
  } else {
    const repositories = await Repositories.findAll(findAllClause);
    const earliestDate = await Repositories.findAll({
      attributes: [[Sequelize.fn('min', Sequelize.col("created_at")), 'min']]
    })
    let data = {};
    data.repositories = repositories,
      data.date = earliestDate[0];
    res.status(200).json(data);
  }
};

export default getAllPublicRepos;

