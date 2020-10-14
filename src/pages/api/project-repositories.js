const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const yup = require("yup");
const db = require("../../../models/sequelize");
const Projects = db.projects;
const { Sentry } = require("../../../utils/sentry");
const log4js = require("../../../config/loggerConfig");
const logger = log4js.getLogger();
const Projects_Repositories = db.projects_repositories;

//function for get repositories
const getRepositories = async (limit, offset, projectId) => {
  let repoList = await Projects_Repositories.findAll({
    where: { project_id: projectId },
    limit: limit,
    offset: offset,
  });
  let data = {};
  const project = await Projects.findOne({ where: { id: projectId } });
  data.repositories = repoList;
  data.projectName = project.name;
  return data;
};

const getProjectRepository = async (req, res) => {
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
          const data = await getRepositories(limit, offset, projectId);
          res.status(200).json(data);
        }
      } catch (err) {
        Sentry.captureException(err);
        logger.error("Error executing in while getting project repositories");
        logger.error(err);
        logger.info("=========================================");
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

export default getProjectRepository;
