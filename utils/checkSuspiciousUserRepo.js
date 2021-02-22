const dbConn = require("../models/sequelize");
const { Sentry } = require("./sentry");
const log4js = require("../config/loggerConfig");
const githubFunction = require("./githubFunction");
const gitlabFunction = require("./gitlabFunction");
const bitbucketFunction = require("./bitbucketFunction");
const logger = log4js.getLogger();
dbConn.sequelize;
const db = require("../models/sequelize");
const Repositories = db.repositories;

const getProjectDetails = async (project, projectUrlInfo) => {
  if (projectUrlInfo.sourceType == "github") {
    project.repository = await Repositories.findOne({
      where: { id: project.repoResponce.id },
    });
    project.branches = await githubFunction.getAllBranchesOfRepo(
      projectUrlInfo
    );
    project.commits = await githubFunction.getCommitsByBranches(
      project.repository,
      projectUrlInfo,
      project.branches
    );
  } else if (projectUrlInfo.sourceType == "gitlab") {
    project.repository = await Repositories.findOne({
      where: { id: project.repoResponce.id },
    });
    project.branches = await gitlabFunction.getAllBranchesOfRepo(
      project.repoResponce.id
    );
  } else if (projectUrlInfo.sourceType == "bitbucket") {
    project.repository = await Repositories.findOne({
      where: { id: project.repoResponce.uuid },
    });
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
