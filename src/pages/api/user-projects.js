const yup = require("yup");
const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const { Sentry } = require("../../../utils/sentry");
const log4js = require("../../../config/loggerConfig");
const logger = log4js.getLogger();
const Projects = db.projects;
const Users_projects = db.users_projects;
const Users = db.users;
const Projects_Repositories = db.projects_repositories;
const {
  INTERNAL_SERVER_ERROR,
  User_NOT_FOUND,
  VALIDATION_ERROR,
} = require("../../../constants/responseConstants");

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
          res.status(404).json(User_NOT_FOUND);
        } else {
          const data = await getProjectsByUserId(userId);
          res.status(200).json(data);
        }
      } catch (err) {
        Sentry.captureException(err);
        logger.error("Error executing in user project api");
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

export default getProjects;
