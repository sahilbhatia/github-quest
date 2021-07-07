const dbConn = require("../models/sequelize");
const { Sentry } = require("./sentry");
const log4js = require("../config/loggerConfig");
const githubFunction = require("./githubFunction");
const gitlabFunction = require("./gitlabFunction");
const bitbucketFunction = require("./bitbucketFunction");
const logger = log4js.getLogger();
dbConn.sequelize;
const Repositories = dbConn.repositories;

const getProjectDetails = async (project, projectUrlInfo) => {
  if (projectUrlInfo.sourceType == "github") {
    project.repository = await Repositories.findOne({
      where: { source_repo_id: project.repoResponce.id.toString() },
    });
    project.branches = await githubFunction.getAllBranchesOfRepo(
      projectUrlInfo
    );
    if (project.repository) {
      project.commits = await githubFunction.getCommitsByBranches(
        project.repository,
        projectUrlInfo,
        project.branches
      );
    }
  } else if (projectUrlInfo.sourceType == "gitlab") {
    project.repository = await Repositories.findOne({
      where: { source_repo_id: project.repoResponce.id.toString() },
    });
    project.branches = await gitlabFunction.getAllBranchesOfRepo(
      project.repoResponce.id
    );
    if (project.repository) {
      project.commits = await gitlabFunction.getCommitsByBranches(
        project.repository,
        project.branches
      );
    }
  } else if (projectUrlInfo.sourceType == "bitbucket") {
    project.repository = await Repositories.findOne({
      where: { source_repo_id: project.repoResponce.uuid.toString() },
    });
    project.branches = await bitbucketFunction.getAllBranchesOfRepo(
      projectUrlInfo
    );
    if (project.repository) {
      project.commits = await bitbucketFunction.getCommitsByBranches(
        project.repository,
        projectUrlInfo,
        project.branches
      );
    }
  }

  if (project.commits && project.repositories && project.branches) {
    return project;
  } else {
    return false;
  }
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
