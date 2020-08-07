import { users_projects, users } from "../../models/sequelize";

const dbConn = require("../../models/sequelize");
dbConn.sequelize;
const Sequelize = require("sequelize")
const db = require("../../models/sequelize");
const Projects = db.projects;
const Users_projects = db.users_projects;
const Users = db.users;

Users_projects.belongsTo(Projects, { foreignKey: { name: 'project_id', allowNull: true } });
Projects.hasMany(Users_projects, { foreignKey: { name: 'project_id', allowNull: true } });

Users_projects.belongsTo(Users, { foreignKey: { name: 'user_id', allowNull: true } });
Users.hasMany(Users_projects, { foreignKey: { name: 'user_id', allowNull: true } });

const getUsers = async (req, res) => {
  try {
    let {
      userId,
      username,
      github_handle,
    } = req.query;

    let where = {};

    let includeUsersProjects = {
      model: users_projects,
      attributes: ["id"],
      //   where: { project_id: projectId },
      include: {
        model: Projects,
        //attributes: ["id"],
        //include: {
        //model: users_projects,
        //}
      }
    };

    // const getWhereClauseProject = () => {

    //   if (projectId != undefined) {
    //     includeUsersProjects.where = {
    //       project_id: projectId
    //     }
    //     return includeUsersProjects;
    //   }
    //   else {
    //     return includeUsersProjects;
    //   }
    // }
    // const getWhereClauseForProject = getWhereClauseProject();

    let findAllData = {
      include: [
        includeUsersProjects
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
      let data = await Users.findAll(findAllData);

      res.status(200).json(data);
    } else {
      let data = await Users.findAll(findAllData);
      res.status(200).json(data);
    }
  } catch (err){
    console.log(err)
    res.status(500).json({
      message: "internal server error"
    })
  }
};

export default getUsers;
