const dbConn = require("../models/sequelize");
const { Sentry } = require("./sentry");
const log4js = require("../config/loggerConfig");
const githubFunction = require("./githubFunction");
const gitlabFunction = require("./gitlabFunction");
const bitbucketFunction = require("./bitbucketFunction");
const logger = log4js.getLogger();
dbConn.sequelize;

const getProjectDetails = async (project, projectUrlInfo) => {
  if (projectUrlInfo.sourceType == "github") {
    project.branches = await githubFunction.getAllBranchesOfRepo(
      projectUrlInfo
    );
  } else if (projectUrlInfo.sourceType == "gitlab") {
    project.branches = await gitlabFunction.getAllBranchesOfRepo(
      project.repository.id
    );
  } else if (projectUrlInfo.sourceType == "bitbucket") {
    project.branches = await bitbucketFunction.getAllBranchesOfRepo(
      projectUrlInfo
    );
  }
  return project;
};

module.exports.checkSuspiciousUserRepo = async (
  projectRepo,
  intranetProject,
  projectUrlInfo
) => {
  try {
    let projectDetail = {};
    projectDetail.repoResponce = projectRepo;
    projectDetail = await getProjectDetails(projectDetail, projectUrlInfo);
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing in check suspicious user repo function while iterating projects in API call"
    );
    logger.error(err);
    logger.info("=========================================");
    return false;
  }
};
