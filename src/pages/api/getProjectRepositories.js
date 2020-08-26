const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const yup = require("yup");
const db = require("../../../models/sequelize");
const Projects = db.projects;

const Projects_Repositories = db.projects_repositories;

Projects_Repositories.belongsTo(Projects, { foreignKey: { name: 'project_id', allowNull: true } });
Projects.hasMany(Projects_Repositories, { foreignKey: { name: 'project_id', allowNull: true } });

const getProjectRepository = async (req, res) => {
  let { projectId, limit, offset } = req.query;
  await yup.object().shape({
    projectId: yup
      .number()
      .required({ repoId: "required" }),
  }).validate({
    projectId: projectId
  }, { abortEarly: false })
    .then(async () => {
      try {
        const project = await Projects.findOne({
          where: { id: projectId }
        });
        if (!project) {
          res.status(404).json({
            message: "project id not found"
          })
        } else {
          let repos = await Projects_Repositories.findAll({
            where: { project_id: req.query.projectId },
            limit: limit,
            offset: offset
          });
          let data={};
          const project=await Projects.findOne({where:{id:projectId}});
          data.repositories=repos;
          data.projectName=project.name;
          res.status(200).json(data);
        }
      } catch {
        res.status(500).json({
          message: "internal server error"
        })
      }
    })
    .catch(() => {
      res.status(400).json({
        message: "project Id must be number"
      })
    });
};

export default getProjectRepository;
