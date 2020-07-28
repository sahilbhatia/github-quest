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
  let repoName = req.query.repoName;
  let forked = req.query.is_forked;
  let archived = req.query.is_archived;
  let disabled = req.query.is_disabled;
  let limit = req.query.limit;
  let offset = req.query.offset;
  let startDate = req.query.startDate;
  let endDate = req.query.endDate;

  let findAllClause = {
    order: [["id", "ASC"]],
    include: [
      {
      model: Users_repositories,
      include: {
        model: Users,
      },
    },
    {
      model: Repositories,
      as: "parent_of"
    },
    ],
    limit: limit,
    offset: offset,
  }

  const getWhereClause = () => {

    if (repoName || forked || archived || disabled || startDate || endDate) {
      if (repoName != "undefined") {
        where = {
          [Sequelize.Op.or]: {
            name: {
              [Sequelize.Op.iLike]: "%" + repoName + "%",
            },
          },
        };
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

      return where;
    }
  }

  const getWhereClauseObject = await getWhereClause();
  if (getWhereClauseObject) {
    findAllClause.where = getWhereClauseObject
    const repositories = await Repositories.findAll(findAllClause);
    res.status(200).json(repositories);
  } else {
    const repositories = await Repositories.findAll(findAllClause);
    res.status(200).json(repositories);
  }
};

export default getAllPublicRepos;