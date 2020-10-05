const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const yup = require("yup");
const { Sentry } = require("../../../utils/sentry");
const Projects = db.projects;
const Users_projects = db.users_projects;
const Users_repositories = db.users_repositories;
const Users = db.users;

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
Users_repositories.belongsTo(Users, {
  foreignKey: { name: "user_id", allowNull: true },
});
Users.hasMany(Users_repositories, {
  foreignKey: { name: "user_id", allowNull: true },
});

//function for get users of projects
const getUsersByProjectId = async (projectId, limit, offset, res) => {
  try {
    let users = await Users.findAll({
      include: [
        {
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
        {
          model: Users_repositories,
          attributes: ["id"],
        },
      ],
      limit: limit,
      offset: offset,
    });
    let data = {};
    const project = await Projects.findOne({ where: { id: projectId } });
    data.users = users;
    data.projectName = project.name;
    return data;
  } catch (err) {
    Sentry.captureException(err);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

//get users
const getUsers = async (req, res) => {
  let { projectId, limit, offset } = req.query;
  await yup
    .object()
    .shape({
      projectId: yup.number().required({ repoId: "required" }),
    })
    .validate({
      projectId: projectId,
    })
    .then(async () => {
      try {
        const project = await Projects.findOne({
          where: { id: projectId },
        });
        if (!project) {
          res.status(404).json({
            message: "Project Not Found For Specified Id",
          });
        } else {
          const data = await getUsersByProjectId(projectId, limit, offset, res);
          res.status(200).json(data);
        }
      } catch (err) {
        Sentry.captureException(err);
        res.status(500).json({
          message: "Internal Server Error",
        });
      }
    })
    .catch((err) => {
      Sentry.captureException(err);
      const errors = err.errors;
      res.status(400).json({
        message: "Validation Error",
        errors,
      });
    });
};

export default getUsers;
