const yup = require("yup");
const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const Projects = db.projects;
const Users_projects = db.users_projects;
const Users = db.users;
const Projects_Repositories = db.projects_repositories;

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
Projects_Repositories.belongsTo(Projects, {
  foreignKey: { name: "project_id", allowNull: true },
});
Projects.hasMany(Projects_Repositories, {
  foreignKey: { name: "project_id", allowNull: true },
});

//function for get projects of user
const getProjectsByUserId = async (userId) => {
  let data = await Users.findOne({
    where: { id: userId },
    include: {
      model: Users_projects,
      attributes: ["id"],
      include: [
        {
          model: Projects,
          include: [
            { model: Users_projects },
            { model: Projects_Repositories },
          ],
        },
      ],
    },
  });
  return data;
};

//get projects
const getProjects = async (req, res) => {
  let { userId } = req.query;
  await yup
    .object()
    .shape({
      userId: yup.number().required({ repoId: "required" }),
    })
    .validate({
      userId: userId,
    })
    .then(async () => {
      try {
        const user = await Users.findOne({
          where: { id: userId },
        });
        if (!user) {
          res.status(404).json({
            message: "User Not Found For Specified Id",
          });
        } else {
          const data = await getProjectsByUserId(userId);
          res.status(200).json(data);
        }
      } catch {
        res.status(500).json({
          message: "Internal Server Error",
        });
      }
    })
    .catch((err) => {
      const errors = err.errors;
      res.status(400).json({
        message: "Validation Error",
        errors,
      });
    });
};

export default getProjects;
