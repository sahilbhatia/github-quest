import { users_projects, users, projects_repositories } from "../../models/sequelize";

const dbConn = require("../../models/sequelize");
dbConn.sequelize;
const Sequelize = require("sequelize")
const db = require("../../models/sequelize");
const Projects = db.projects;
const Users_projects = db.users_projects;
const Users = db.users;
const Projects_Repositories = db.projects_repositories;

Users_projects.belongsTo(Projects, { foreignKey: { name: 'project_id', allowNull: true } });
Projects.hasMany(Users_projects, { foreignKey: { name: 'project_id', allowNull: true } });

Users_projects.belongsTo(Users, { foreignKey: { name: 'user_id', allowNull: true } });
Users.hasMany(Users_projects, { foreignKey: { name: 'user_id', allowNull: true } });


Projects_Repositories.belongsTo(Projects, { foreignKey: { name: 'project_id', allowNull: true } });
Projects.hasMany(Projects_Repositories, { foreignKey: { name: 'project_id', allowNull: true } });

const getUsers = async (req, res) => {
  try {
    let {
      userId,
    } = req.query;

    let where = {};

    let includeUsersProjects = {
      model: users_projects,
      attributes: ["id"],
      include: [
        {
          model: Projects,
          
          include:[
            {model: Users_projects},
            { model: Projects_Repositories }]
            
        }
      ]
    };

    let findAllData = {
      include: [
        includeUsersProjects,
      ]
    }

    const getWhereClauseObjectUsers = () => {
      if (userId) {
        if (userId != undefined) {
          where.id = userId;
        }
        return where;
      }
    }
    const getwhereClauseObject = getWhereClauseObjectUsers();
    if (getwhereClauseObject) {
      findAllData.where = getwhereClauseObject
      let data = await Users.findOne(findAllData);

      res.status(200).json(data);
    } else {
      let data = await Users.findOne(findAllData);
      res.status(200).json(data);
    }
  } catch {
    res.status(500).json({
      message: "internal server error"
    })
  }
};

export default getUsers;