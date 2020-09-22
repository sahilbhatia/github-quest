import moment from "moment";
const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const Sequelize = require("sequelize");
const db = require("../../../models/sequelize");
const Projects = db.projects;
const Users_projects = db.users_projects;
const Users = db.users;
const Project_Repositories = db.projects_repositories;

Users_projects.belongsTo(Projects, {
  foreignKey: { name: "project_id", allowNull: true },
});
Projects.hasMany(Users_projects, {
  foreignKey: { name: "project_id", allowNull: true },
});
Users_projects.belongsTo(Users, {
  foreignKey: { name: "user_id", allowNull: true },
});
Users.hasMany(Users_projects, {
  foreignKey: { name: "user_id", allowNull: true },
});
Project_Repositories.belongsTo(Projects, {
  foreignKey: { name: "project_id", allowNull: true },
});
Projects.hasMany(Project_Repositories, {
  foreignKey: { name: "project_id", allowNull: true },
});
Projects.belongsTo(Users, {
  foreignKey: { name: "project_manager", allowNull: true },
});
Users.hasMany(Projects, {
  foreignKey: { name: "project_manager", allowNull: true },
});

//function for get project model
const getProjectModel = (limit, offset) => {
  let findAllClause = {
    include: [
      {
        model: Users_projects,
        include: {
          model: Users,
        },
      },
      {
        model: Project_Repositories,
      },
      {
        model: Users,
      },
    ],
    limit: limit,
    offset: offset,
  };
  return findAllClause;
};

//function for get where clause
const getWhereClause = (projectName, startDate, endDate, is_active) => {
  let where = {};
  if (projectName || startDate || endDate || is_active) {
    if (projectName != undefined) {
      where.name = projectName;
    }
    if (is_active != undefined) {
      if (is_active != "undefined") {
        where.is_active = is_active;
      }
    }
    if (startDate != undefined && endDate != undefined) {
      const endDateFormat = moment(endDate).add(1, "days");
      where.created_at = {
        [Sequelize.Op.between]: [new Date(startDate), new Date(endDateFormat)],
      };
    } else if (endDate != undefined) {
      const endDateFormat = moment(endDate).add(1, "days");
      where.created_at = {
        [Sequelize.Op.lt]: new Date(endDateFormat),
      };
    } else if (startDate != undefined) {
      const date = new Date();
      where.created_at = {
        [Sequelize.Op.between]: [new Date(startDate), date],
      };
    }
    return where;
  } else {
    return null;
  }
};

//get projects
const getProjects = async (req, res) => {
  try {
    let {
      projectName,
      startDate,
      endDate,
      is_active,
      limit,
      offset,
    } = req.query;
    const whereClauseData = getWhereClause(
      projectName,
      startDate,
      endDate,
      is_active
    );
    const findAllClause = getProjectModel(limit, offset);

    if (whereClauseData) {
      findAllClause.where = whereClauseData;
      let projectData = await Projects.findAll(findAllClause);
      const earliestDate = await Projects.findAll({
        attributes: [[Sequelize.fn("min", Sequelize.col("created_at")), "min"]],
      });
      let data = {};
      (data.projects = projectData), (data.date = earliestDate[0]);
      res.status(200).json(data);
    } else {
      let projectData = await Projects.findAll(findAllClause);
      const earliestDate = await Projects.findAll({
        attributes: [[Sequelize.fn("min", Sequelize.col("created_at")), "min"]],
      });
      let data = {};
      (data.projects = projectData), (data.date = earliestDate[0]);
      res.status(200).json(data);
    }
  } catch {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export default getProjects;