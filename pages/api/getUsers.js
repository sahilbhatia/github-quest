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

const getUsers = async (req, res) => {
  try {
    let {
      projectId,
      username,
      github_handle,
    } = req.query;

    let where = {};

    let includeUsersProjects = {
      model: Users_projects,
      include: {
        model: Projects
      }
    }

    const getWhereClauseProject = () => {

      if (projectId != undefined) {
        includeUsersProjects.where = {
          project_id: projectId
        }
        return includeUsersProjects;
      }
      else {
        return includeUsersProjects;
      }

    }

    const getWhereClauseForProject = getWhereClauseProject();

    let findAllData = {
      include: [
        getWhereClauseForProject
      ]
    }

    const getWhereClauseObjectUsers = () => {
      if (username || github_handle) {
        if (username != undefined) {
          where.name = username;
        }
        if (github_handle != undefined) {
          where.github_handle = github_handle;
        }
        return where;
      }
    }
    const getwhereClauseObject = getWhereClauseObjectUsers();
    if (getwhereClauseObject) {
      findAllData.where = getwhereClauseObject
      let data = await Users.findAll(findAllData);
      res.status(200).json(data);
    } else {
      let data = await Users.findAll(findAllData);
      res.status(200).json(data);
    }
  } catch {
    res.status(500).json({
      message: "internal server error"
    })
  }
};

export default getUsers;
