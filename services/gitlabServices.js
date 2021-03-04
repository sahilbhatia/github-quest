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
// function for get project details from gitlab
const getRepositoryFromGitlab = async (project) => {
  try {
    let projectStatus = false;
    const gitlabUser = await request.get(
      `https://gitlab.com/api/v4/users?username=${project.handle}`
    );
    if (gitlabUser.body.length != 0) {
      const gitlabRepos = await request
        .get(
          `https://gitlab.com/api/v4/users/${gitlabUser.body[0].id}/projects`
        )
        .set({ "PRIVATE-TOKEN": process.env.GITLAB_ACCESS_TOKEN });
      gitlabRepos.body.forEach((repo) => {
        if (project.repositorieName.localeCompare(repo.path) == 0) {
          projectStatus = repo;
        }
      });
      return projectStatus;
    } else {
      return false;
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while fetching projects in get repositories from gitlab function"
    );
    logger.error(err);
    logger.info("=========================================");
    return false;
  }
};

module.exports = {
  getLabels: getLabels,
  getRepositoryFromGitlab: getRepositoryFromGitlab,
};
