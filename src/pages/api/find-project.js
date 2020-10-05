const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const Projects = db.projects;
const Sequelize = require("sequelize");
const { Sentry } = require("../../../utils/sentry");

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
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export default findProject;
