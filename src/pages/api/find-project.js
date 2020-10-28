const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const Projects = db.projects;
const Sequelize = require("sequelize");
const log4js = require("../../../config/loggerConfig");
const logger = log4js.getLogger();
const { Sentry } = require("../../../utils/sentry");
const {
  INTERNAL_SERVER_ERROR,
} = require("../../../constants/responseConstants");

const findProject = async (req, res) => {
  try {
    const projectName = req.query.projectName;
    const projectList = await Projects.findAll({
      where: {
        name: {
          [Sequelize.Op.iLike]: "%" + projectName + "%",
        },
      },
    });
    res.status(200).json(projectList);
  } catch (err) {
    Sentry.captureException(err);
    logger.error("Error executing in find projects api");
    logger.error(err);
    logger.info("=========================================");
    res.status(500).json(INTERNAL_SERVER_ERROR);
  }
};

export default findProject;
