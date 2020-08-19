import { users_projects, users } from "../../models/sequelize";

const dbConn = require("../../models/sequelize");
dbConn.sequelize;
const Sequelize = require("sequelize")
const db = require("../../models/sequelize");
const Projects = db.projects;
const Users_projects = db.users_projects;
const Users = db.users;
const Repositories = db.repositories;
const Users_repositories = db.users_repositories;

Users_projects.belongsTo(Projects, { foreignKey: { name: 'project_id', allowNull: true } });
Projects.hasMany(Users_projects, { foreignKey: { name: 'project_id', allowNull: true } });

Users_projects.belongsTo(Users, { foreignKey: { name: 'user_id', allowNull: true } });
Users.hasMany(Users_projects, { foreignKey: { name: 'user_id', allowNull: true } });

Users_repositories.belongsTo(Repositories, { foreignKey: { name: 'repository_id', allowNull: true } });
Repositories.hasMany(Users_repositories, { foreignKey: { name: 'repository_id', allowNull: true } });

Users_repositories.belongsTo(Users, { foreignKey: { name: 'user_id', allowNull: true } });
Users.hasMany(Users_repositories, { foreignKey: { name: 'user_id', allowNull: true } });

const getUsers = async (req, res) => {
  try {
    let { limit, offset, userName, githubHandle, startDate, endDate } =req.query;
    let where = {
      name :{
        [Sequelize.Op.ne]: "unknown",
      }
    };
    if(userName!=undefined){
      where.name={
        [Sequelize.Op.eq]: userName, 
      }
    }
    if(githubHandle!=undefined){
      where.github_handle={
        [Sequelize.Op.eq]: githubHandle, 
      }
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
    const data = await
      Users.findAll({
        where,
        include: [
          {
            model: Users_projects, attributes: ["id"]
          },
          {
            model: Users_repositories, attributes: ["id"]
          }
        ],
        limit:limit,
        offset:offset,
      });
    res.json(data);
  } catch  {
    res.status(500).json({
      message: "internal server error",
      err:err
    })
  }
};

export default getUsers;
