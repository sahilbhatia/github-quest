const request = require("superagent");
const { Sentry } = require("./../utils/sentry");
const log4js = require("../config/loggerConfig");
const logger = log4js.getLogger();

//function for get all labels of repository
const getLabels = async (project_id) => {
  try {
    const labels = await request
      .get(`https://gitlab.com/api/v4/projects/${project_id}/labels`)
      .set({ "PRIVATE-TOKEN": process.env.GITLAB_ACCESS_TOKEN });
    return labels.body;
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while getting all labels of projects from gitlab"
    );
    logger.error(err);
    logger.info("=========================================");
    return null;
  }
};

module.exports = {
  getLabels: getLabels,
};
