const dbConn = require("../../models/sequelize");
dbConn.sequelize;
const Sequelize = require("sequelize")
const db = require("../../models/sequelize");
const Projects = db.projects;
const Users_projects = db.users_projects;
const Users = db.users;
const Repositories = db.repositories;

Repositories.belongsTo(Projects, { foreignKey: { name: 'project_id', allowNull: true } });
Projects.hasMany(Repositories, { foreignKey: { name: 'project_id', allowNull: true } });

const getUsers = async (req, res) => {
  try {
    let data = await Repositories.findAll({
      where : {project_id:req.query.projectId},
    });
    res.status(200).json(data);
  } catch {
    res.status(500).json({
      message: "internal server error"
    })
  }
};

export default getUsers;
