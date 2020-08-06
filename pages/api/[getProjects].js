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
  console.log(req.query)
  try {
    let {
      projectName,
      startDate,
      endDate,
    } = req.query;
    console.log(projectName)
    console.log(startDate)
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
      if (projectName || startDate || endDate) {

        if (projectName != undefined) {
          where.name = projectName
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
        return where;
      } else {
        return null;
      }
    }

    const whereClauseData = getWhereClause();

    if (whereClauseData) {
      findAllClause.where = whereClauseData;
      let data = await Projects.findAll(findAllClause);
      if (data.length == 0) {
        res.status(404).json({
          message: "list not found for given id"
        });
      };
      res.status(200).json(data);
    } else {
      let data = await Projects.findAll(findAllClause);
      if (data.length == 0) {
        res.status(404).json({
          message: "list not found for given id"
        });
      };

      res.status(200).json(data);
    }
  } catch {
    res.status(500).json({
      message: "internal server error"
    })
  }
};

export default getProjects;
