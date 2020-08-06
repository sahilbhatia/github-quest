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
    let data = await Projects.findAll({
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
    });
    if (data.length == 0) {
      res.status(404).json({
        message: "list not found for given id"
      });
    };
    res.status(200).json(data);
  } catch (err){
    console.log(err)
    res.status(500).json({
      message: "internal server error"
    })
  }
};

export default getProjects;
