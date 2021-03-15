const dbConn = require("../models/sequelize");
const { Op } = require("sequelize");
const { Sentry } = require("./sentry");
const log4js = require("../config/loggerConfig");
const githubServices = require("./../services/githubServices");
const gitlabServices = require("./../services/gitlabServices");
const bitbucketServices = require("./../services/bitbucketServices");
const githubFunctions = require("./githubFunction");
const bitbucketFunction = require("./bitbucketFunction");
const commonFunction = require("./commonFunction");
const logger = log4js.getLogger();
dbConn.sequelize;
const db = require("../models/sequelize");
const gitlabFunction = require("./gitlabFunction");
const Repositories = db.repositories;
const File_constants = db.file_constants;
const Users = db.users;
const Users_repositories = db.users_repositories;

//function for get  all project details from github
const getProjectDetailsFromGithub = async (project, projectUrlInfo) => {
  project.repository = await Repositories.findOne({
    where: { source_repo_id: project.repoResponce.id.toString() },
  });
  if (project.repository) {
    project.branches = await githubServices.getAllBranchesOfRepo(
      projectUrlInfo,
      project.repository.dataValues.id
    );
    const configFileConstants = await File_constants.findAll({
      where: {
        content_type: "configuration",
      },
    });
    project.fileStructure = await githubFunctions.getFileDirStructure(
      projectUrlInfo,
      project.branches,
      configFileConstants
    );
    project.commits = await githubServices.getCommitsByBranches(
      project.repository,
      projectUrlInfo,
      project.branches,
      project.repository.dataValues.id
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
  if (project.repository) {
    project.branches = await gitlabServices.getAllBranchesOfRepo(
      project.repoResponce.id,
      project.repository.dataValues.id
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
    project.commits = await gitlabServices.getCommitsByBranches(
      project.repository,
      project.branches,
      project.repository.dataValues.id
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
  if (project.repository) {
    project.branches = await bitbucketServices.getAllBranchesOfRepo(
      projectUrlInfo,
      project.repository.dataValues.id
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
    project.commits = await bitbucketServices.getCommitsByBranches(
      project.repository,
      projectUrlInfo,
      project.branches,
      project.repository.dataValues.id
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

const getRepositoryByUserId = async (user_id) => {
  try {
    let userRepositories = await Users_repositories.findAll({
      where: {
        user_id: user_id,
      },
    });
    if (userRepositories) {
      let repository_ids = userRepositories.map((entry) => {
        return entry.dataValues.repository_id;
      });
      let repositories = await Repositories.findAll({
        where: {
          id: repository_ids,
          is_private: false,
        },
      });
      if (repositories) {
        let repositoryList = repositories.map((entry) => {
          return entry.dataValues;
        });
        return repositoryList;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing in check suspicious user repo function while iterating user repositores details from database"
    );
    logger.error(err);
    logger.info("=========================================");
    return false;
  }
};

const avoidProjectCreatorUserQuery = (userIds, projectUrlInfo) => {
  let queryObj = {
    org_user_id: userIds,
  };
  if (projectUrlInfo.sourceType == "github") {
    queryObj.github_handle = {
      [Op.not]: projectUrlInfo.handle,
    };
  } else if (projectUrlInfo.sourceType == "gitlab") {
    queryObj.gitlab_handle = {
      [Op.not]: projectUrlInfo.handle,
    };
  } else if (projectUrlInfo.sourceType == "bitbucket") {
    queryObj.bitbucket_handle = {
      [Op.not]: projectUrlInfo.handle,
    };
  }
  return queryObj;
};
const getAllActiveUsersInfoList = async (active_users, projectUrlInfo) => {
  try {
    let userList = [];
    let ids = active_users.map((user) => {
      return user.id;
    });
    let queryObj = avoidProjectCreatorUserQuery(ids, projectUrlInfo);
    const users = await Users.findAll({
      where: queryObj,
      attributes: [
        "id",
        "github_handle",
        "gitlab_handle",
        "bitbucket_handle",
        "last_fetched_at",
      ],
    });
    let data = await users.map(async (user) => {
      let userObj = user.dataValues;
      userObj.repositories = await getRepositoryByUserId(user.dataValues.id);
      userList.push(userObj);
      return user.dataValues;
    });
    await Promise.all(data);
    return userList;
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing in check suspicious user repo function while iterating users details from database"
    );
    logger.error(err);
    logger.info("=========================================");
    return false;
  }
};

const checkRepositoryNameIsSame = (repository, projectUrlInfo) => {
  let repoUrlInfo = commonFunction.getInfoByProjectUrl(repository.url);
  if (
    repoUrlInfo.repositorieName.localeCompare(
      projectUrlInfo.repositorieName
    ) === 1
  ) {
    return 1;
  } else {
    return 0;
  }
};
const checkBranchNameIsSame = async (repository, projectBranches) => {
  let branches = [];
  let matchingBranches = [];
  let repoUrlInfo = commonFunction.getInfoByProjectUrl(repository.url);

  if (repository.source_type == "github") {
    branches = await githubServices.getAllBranchesOfRepo(
      repoUrlInfo,
      repository.id
    );
    matchingBranches = projectBranches.map((branch) => {
      for (let index = 0; index < branches.length; index++) {
        const ele = branches[index];
        if (
          branch.name != "staging" ||
          branch.name != "production" ||
          branch.name != "master" ||
          branch.name != "main"
        ) {
          if (ele.name.localeCompare(branch.name) === 1) {
            return ele;
          }
        }
      }
    });
  } else if (repository.source_type == "github") {
    branches = await gitlabServices.getAllBranchesOfRepo(
      repoUrlInfo,
      repository.id
    );
    matchingBranches = projectBranches.map((branch) => {
      for (let index = 0; index < branches.length; index++) {
        const ele = branches[index];
        if (
          branch.name != "staging" ||
          branch.name != "production" ||
          branch.name != "master" ||
          branch.name != "main"
        ) {
          if (ele.name.localeCompare(branch.name) === 1) {
            return ele;
          }
        }
      }
    });
  } else if (repository.source_type == "github") {
    branches = await bitbucketServices.getAllBranchesOfRepo(
      repoUrlInfo,
      repository.id
    );
    matchingBranches = projectBranches.map((branch) => {
      for (let index = 0; index < branches.length; index++) {
        const ele = branches[index];
        if (
          branch.name != "staging" ||
          branch.name != "production" ||
          branch.name != "master" ||
          branch.name != "main"
        ) {
          if (ele.name.localeCompare(branch.name) === 1) {
            return ele;
          }
        }
      }
    });
  }
  if (matchingBranches.length > 3) {
    return 1;
  } else {
    return 0;
  }
};
const checkUsersRepos = async (projectDetail) => {
  let data = await projectDetail.projectActiveUsers.map(async (user) => {
    let dataObj = await user.repositories.map(async (repository) => {
      let thresholdObj = {};
      thresholdObj.repository = checkRepositoryNameIsSame(
        repository,
        projectDetail.projectUrlInfo
      );
      thresholdObj.branch = await checkBranchNameIsSame(
        repository,
        projectDetail.branches
      );
    });
    await Promise.all(dataObj);
  });
  await Promise.all(data);
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
    if (projectDetail) {
      projectDetail.projectActiveUsers = await getAllActiveUsersInfoList(
        intranetProject.active_users,
        projectUrlInfo
      );
      if (projectDetail.projectActiveUsers) {
        projectDetail.projectUrlInfo = projectUrlInfo;
        await checkUsersRepos(projectDetail);
      }
    }
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
