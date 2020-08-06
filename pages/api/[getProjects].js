import moment from "moment";

const dbConn = require("../../models/sequelize");
dbConn.sequelize;
const Sequelize = require("sequelize")
const db = require("../../models/sequelize");
const Projects = db.projects;
const Users_projects = db.users_projects;
const Users = db.users;
const Repositories = db.repositories;


Users_projects.belongsTo(Projects, { foreignKey: { name: 'project_id', allowNull: true } });
Projects.hasMany(Users_projects, { foreignKey: { name: 'project_id', allowNull: true } });

Users_projects.belongsTo(Users, { foreignKey: { name: 'user_id', allowNull: true } });
Users.hasMany(Users_projects, { foreignKey: { name: 'user_id', allowNull: true } });

Repositories.belongsTo(Projects, { foreignKey: { name: 'project_id', allowNull: true } });
Projects.hasMany(Repositories, { foreignKey: { name: 'project_id', allowNull: true } });


const getProjects = async (req, res) => {
  try {
    let {
      projectName,
      startDate,
      endDate,
      is_active,
    } = req.query;
    let where = {};
    let findAllClause = {};
    findAllClause = {
      include: [
        {
          model: Users_projects,
          include: {
            model: Users,
          },
        },
        {
          model: Repositories,
        }
      ],
      limit: req.query.limit,
      offset: req.query.offset,
    }

    const getWhereClause = () => {
      if (projectName || startDate || endDate || is_active) {

        if (projectName != undefined) {
          where.name = projectName
        }
        
        if (is_active != undefined) {
          where.is_active = is_active
        }

        if (is_active != undefined) {
          if (is_active != "undefined") {
            where.is_active = is_active
          }
        }

        if (startDate != undefined && endDate != undefined) {
          const endDateFormat = moment(endDate).add(1, "days")
          where.created_at = {
            [Sequelize.Op.between]: [new Date(startDate), new Date(endDateFormat)]
          }
        } else if (endDate != undefined) {

          const endDateFormat = moment(endDate).add(1, "days")
          where.created_at = {
            [Sequelize.Op.lt]: new Date(endDateFormat),
          }
        } else if (startDate != undefined) {
          const date = new Date();
          where.created_at = {
            [Sequelize.Op.between]: [new Date(startDate), date]
          }
        }

        return where;
      } else {
        return null;
      }
    }

    const whereClauseData = getWhereClause();

    if (whereClauseData) {
      findAllClause.where = whereClauseData;
      let data = await Projects.findAll(findAllClause);
      res.status(200).json(data);
    } else {
      let data = await Projects.findAll(findAllClause);

      res.status(200).json(data);
    }
  } catch {
    res.status(500).json({
      message: "internal server error"
    })
  }
};

export default getProjects;
