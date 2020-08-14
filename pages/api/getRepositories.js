const dbConn = require("../../models/sequelize");
dbConn.sequelize;
const db = require("../../models/sequelize");
const Projects = db.projects;

const Projects_Repositories = db.projects_repositories;

Projects_Repositories.belongsTo(Projects, { foreignKey: { name: 'project_id', allowNull: true } });
Projects.hasMany(Projects_Repositories, { foreignKey: { name: 'project_id', allowNull: true } });

const getUsers = async (req, res) => {
  try {
    let data = await Projects_Repositories.findAll({
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
