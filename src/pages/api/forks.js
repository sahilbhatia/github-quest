const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const Repositories = db.repositories;
const Users_repositories = db.users_repositories;
const Users = db.users;
const yup = require("yup");

Repositories.belongsTo(Repositories, {
  foreignKey: { name: "parent_repo_id", allowNull: true },
  as: "parent",
});
Repositories.hasMany(Repositories, {
  foreignKey: { name: "parent_repo_id", allowNull: true },
  as: "children",
});
Users_repositories.belongsTo(Repositories, {
  foreignKey: { name: "repository_id", allowNull: true },
});

Repositories.hasMany(Users_repositories, {
  foreignKey: { name: "repository_id", allowNull: true },
});
Users_repositories.belongsTo(Users, {
  foreignKey: { name: "user_id", allowNull: true },
});
Users.hasMany(Users_repositories, {
  foreignKey: { name: "user_id", allowNull: true },
});

//function for return forked repo
const forkedRepos = async (repoId) => {
  const data = await Repositories.findAll({
    where: { parent_repo_id: repoId },
    include: [
      {
        model: Repositories,
        as: "parent",
        include: [
          {
            model: Repositories,
            as: "children",
          },
        ],
      },
      {
        model: Repositories,
        as: "children",
      },
      {
        model: Users_repositories,
        include: {
          model: Users,
        },
      },
    ],
  });
  return data;
};

//get forked repos
const getForkedRepos = async (req, res) => {
  await yup
    .object()
    .shape({
      repoId: yup.number().required({ repoId: "required" }),
    })
    .validate({
      repoId: req.query.id,
    })
    .then(async () => {
      try {
        const data = await forkedRepos(req.query.id);
        if (data.length == 0) {
          res.status(404).json({
            message: "List Not found For Given Id",
          });
        } else {
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

export default getForkedRepos;
