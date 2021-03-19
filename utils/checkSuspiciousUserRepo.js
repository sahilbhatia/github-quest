const dbConn = require("../models/sequelize");
const { Sentry } = require("./sentry");
const log4js = require("../config/loggerConfig");
const githubServices = require("./../services/githubServices");
const gitlabServices = require("./../services/gitlabServices");
const bitbucketServices = require("./../services/bitbucketServices");
const githubFunctions = require("./githubFunction");
const bitbucketFunction = require("./bitbucketFunction");
const logger = log4js.getLogger();
dbConn.sequelize;
const db = require("../models/sequelize");
const gitlabFunction = require("./gitlabFunction");
const Repositories = db.repositories;
const File_constants = db.file_constants;

//function for get  all project details from github
const getProjectDetailsFromGithub = async (project, projectUrlInfo) => {
  project.repository = await Repositories.findOne({
    where: { source_repo_id: project.repoResponce.id.toString() },
  });
  const configFileConstants = await File_constants.findAll({
    where: {
      content_type: "configuration",
    },
  });
  project.branches = await githubServices.getAllBranchesOfRepo(projectUrlInfo);
  project.fileStructure = await githubFunctions.getFileDirStructure(
    projectUrlInfo,
    project.branches,
    configFileConstants
  );
  if (project.repository) {
    project.commits = await githubServices.getCommitsByBranches(
      project.repository,
      projectUrlInfo,
      project.branches
    );
    project.tags = await githubServices.getTags(projectUrlInfo);
    project.labels = await githubServices.getLabels(projectUrlInfo);
    project.language = project.repoResponce.language;
  }
  return project;
};

//function for get  all project details from gitlab
const getProjectDetailsFromGitlab = async (project) => {
  project.repository = await Repositories.findOne({
    where: { source_repo_id: project.repoResponce.id.toString() },
  });
  project.branches = await gitlabServices.getAllBranchesOfRepo(
    project.repoResponce.id
  );
  const configFileConstants = await File_constants.findAll({
    where: {
      content_type: "configuration",
    },
  });
  project.fileStructure = await gitlabFunction.getFileDirStructure(
    project.repoResponce.id,
    project.branches,
    configFileConstants
  );
  if (project.repository) {
    project.commits = await gitlabServices.getCommitsByBranches(
      project.repository,
      project.branches
    );
    project.tags = project.repoResponce.tag_list;
    project.labels = await gitlabServices.getLabels(project.repoResponce.id);
    project.language = false;
  }
  return project;
};

//function for get  all project details from bitbucket
const getProjectDetailsFromBitbucket = async (project, projectUrlInfo) => {
  project.repository = await Repositories.findOne({
    where: { source_repo_id: project.repoResponce.uuid.toString() },
  });
  project.branches = await bitbucketServices.getAllBranchesOfRepo(
    projectUrlInfo
  );
  const configFileConstants = await File_constants.findAll({
    where: {
      content_type: "configuration",
    },
  });
  project.fileStructure = await bitbucketFunction.getFileDirStructure(
    projectUrlInfo,
    project.branches,
    configFileConstants
  );
  if (project.repository) {
    project.commits = await bitbucketServices.getCommitsByBranches(
      project.repository,
      projectUrlInfo,
      project.branches
    );
    project.language = project.repoResponce.language;
    project.tags = await bitbucketServices.getTags(projectUrlInfo);
  }
  return project;
};

const getProjectDetails = async (project, projectUrlInfo) => {
  if (projectUrlInfo.sourceType == "github") {
    project = await getProjectDetailsFromGithub(project, projectUrlInfo);
  } else if (projectUrlInfo.sourceType == "gitlab") {
    project = await getProjectDetailsFromGitlab(project);
  } else if (projectUrlInfo.sourceType == "bitbucket") {
    project = await getProjectDetailsFromBitbucket(project, projectUrlInfo);
  }

  if (project.commits && project.repository && project.branches) {
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
