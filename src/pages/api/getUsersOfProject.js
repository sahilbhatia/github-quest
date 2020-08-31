const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const Projects = db.projects;
const Users_projects = db.users_projects;
const Users = db.users;
const yup = require("yup");
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

const getUsers = async (req, res) => {
  let { projectId, limit, offset } = req.query;
  await yup
    .object()
    .shape({
      projectId: yup.number().required({ repoId: "required" }),
    })
    .validate(
      {
        projectId: projectId,
      },
      { abortEarly: false }
    )
    .then(async () => {
      try {
        const project = await Projects.findOne({
          where: { id: projectId },
        });
        if (!project) {
          res.status(404).json({
            message: "project id not found",
          });
        } else {
          let users = await Users.findAll({
            include: {
              model: Users_projects,
              attributes: ["id"],
              where: { project_id: projectId },
              include: {
                model: Users,
                attributes: ["id"],
                include: {
                  model: Users_projects,
                },
              },
            },
            limit: limit,
            offset: offset,
          });
          let data = {};
          const project = await Projects.findOne({ where: { id: projectId } });
          data.users = users;
          data.projectName = project.name;
          res.status(200).json(data);
        }
      } catch {
        res.status(500).json({
          message: "internal server error",
        });
      }
    })
    .catch(() => {
      res.status(400).json({
        message: "repo Id must be number",
      });
    });
};

export default getUsers;
