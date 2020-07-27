const Sequelize = require("sequelize");
const moment = require("moment");
const dbConn = require("../../models/sequelize");
dbConn.sequelize;
const db = require("../../models/sequelize");
const Repositories = db.repositories;
const Parent_repositories = db.parent_repositories;

Repositories.belongsTo(Parent_repositories, { foreignKey: { name: 'parent_repo_id', allowNull: true } })
Parent_repositories.hasMany(Repositories, { foreignKey: { name: 'parent_repo_id', allowNull: true } })

const getAllPublicRepos = async (req, res) => {
  let where = {};
  let like = req.query.like;
  let forked = req.query.forked;
  let archived = req.query.archived;
  let disabled = req.query.disabled;
  let limit = req.query.limit;
  let offset = req.query.offset;
  let startDate = req.query.startDate;
  let endDate = req.query.endDate;
  let findAllClause = {
    order: [["id", "ASC"]],
    include: [{
      model: Parent_repositories,
      seperate: true,
      include: {
        model: Repositories,
      },
    }],
    limit: limit,
    offset: offset,
  }
  const getWhereClause = () => {

    if (like || forked || archived || disabled || startDate || endDate) {
      if (like) {
        where = {
          [Sequelize.Op.or]: {
            name: {
              [Sequelize.Op.iLike]: "%" + like + "%",
            },
          },
        };
      }

      if (forked == "true" || forked == "false") {
        where.is_forked = JSON.parse(forked);
      }

      if (archived == "true" || archived == "false") {
        where.archived = JSON.parse(archived);
      }

      if (disabled == "true" || disabled == "false") {
        where.is_disabled = JSON.parse(disabled);
      }

      if (startDate && endDate) {
        where.created_at = {
          [Sequelize.Op.between]: [startDate, endDate]
        }
      } else if (endDate) {
        where.created_at = {
          [Sequelize.Op.lt]: endDate,
        }
      } else if (startDate) {
        let endDate = moment().toISOString();
        where.created_at = {
          [Sequelize.Op.between]: [startDate, endDate]
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
