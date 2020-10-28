const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const log4js = require("../../../config/loggerConfig");
const { Sentry } = require("../../../utils/sentry");
const yup = require("yup");
const Projects = db.projects;
const Users_projects = db.users_projects;
const Users_repositories = db.users_repositories;
const Users = db.users;
const logger = log4js.getLogger();
const {
  INTERNAL_SERVER_ERROR,
  PROJECT_NOT_FOUND,
  VALIDATION_ERROR,
} = require("../../../constants/responseConstants");

//function for get users of projects
const getUsersByProjectId = async (projectId, limit, offset) => {
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
          res.status(404).json(PROJECT_NOT_FOUND);
        } else {
          const data = await getUsersByProjectId(projectId, limit, offset, res);
          res.status(200).json(data);
        }
      } catch (err) {
        Sentry.captureException(err);
        logger.error("Error executing in project users api");
        logger.error(err);
        logger.info("=========================================");
        res.status(500).json(INTERNAL_SERVER_ERROR);
      }
    })
    .catch((err) => {
      Sentry.captureException(err);
      VALIDATION_ERROR.errors = err.errors;
      res.status(400).json(VALIDATION_ERROR);
    });
};

export default getUsers;
