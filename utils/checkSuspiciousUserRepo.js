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
const Commits = db.commits;

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

//function for get all project details from bitbucket
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
    project.labels = project.repoResponce.language
      ? project.repoResponce.language
      : [];
  }
  return project;
};

//function for get all project details
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

//function for get all repository list by userId
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

//function for get qurey and avoid project creator user
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
//function for get all active user details from database
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

//function for check a repository name with project name ,Is same?
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
//function for check a repository branches name with project branches name ,Is same?
const checkBranchNameIsSame = async (repository, projectBranches) => {
  let branches = [];
  let matchingBranches = [];
  let repoUrlInfo = commonFunction.getInfoByProjectUrl(repository.url);

  if (repository.source_type == "github") {
    branches = await githubServices.getAllBranchesOfRepo(
      repoUrlInfo,
      repository.id
    );
    await githubServices.getCommitsByBranches(
      repository,
      repoUrlInfo,
      branches,
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
    await gitlabServices.getCommitsByBranches(
      repository,
      branches,
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
    await bitbucketServices.getCommitsByBranches(
      repository,
      repoUrlInfo,
      branches,
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
  if (matchingBranches.length > parseInt(process.env.MATCHING_BRANCHES_COUNT)) {
    return 1;
  } else {
    return 0;
  }
};
//function for get commitIds list in  project commits
const getCommitIdsFromProjectCommits = async (repository, commits) => {
  let commitIds = [];
  for (const key in commits) {
    const element = commits[key];
    if (
      key == "staging" ||
      key == "production" ||
      key == "master" ||
      key == "main"
    ) {
      element.map((commit) => {
        if (repository.source_type == "github") {
          commitIds.push(commit.sha);
        } else if (repository.source_type == "gitlab") {
          commitIds.push(commit.id);
        } else if (repository.source_type == "bitbucket") {
          commitIds.push(commit.hash);
        }
      });
    }
  }
  return commitIds;
};
//function for check repository commits ids with project commits ids, Is Same?
const checkCommitIds = async (repository, project) => {
  try {
    let queryObj = {
      repository_id: repository.id,
    };
    let commitIds = await getCommitIdsFromProjectCommits(
      repository,
      project.commits
    );
    if (commitIds.length > 0) {
      queryObj.commit_id = commitIds;
    }
    let matchingCommits = await Commits.findAll({
      where: queryObj,
    });
    if (
      matchingCommits.length >= parseInt(process.env.MATCHING_COMMITS_COUNT)
    ) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing in check suspicious user repo commits function while checking matching commits available in personal repository"
    );
    logger.error(err);
    logger.info("=========================================");
    return false;
  }
};
//function for mark repository suspicious as true in database
const markAsSuspiciousRepository = async (repositoryId) => {
  try {
    let updateObj = {
      is_suspicious: true,
    };
    await Repositories.update(updateObj, {
      returning: true,
      where: {
        id: repositoryId,
      },
    });
  } catch (err) {
    Sentry.captureException(err);
    logger.error("Error executing in mark as suspicious user repo function");
    logger.error(err);
    logger.info("=========================================");
    return false;
  }
};
//function for check repository blob ids with project blob ids, Is Same?
const checkBlobIdsIsSame = async (
  repository,
  ProjectFileStructure,
  projectUrlInfo
) => {
  let repoUrlInfo = commonFunction.getInfoByProjectUrl(repository.url);
  if (
    repoUrlInfo.sourceType === "bitbucket" ||
    projectUrlInfo.sourceType === "bitbucket"
  ) {
    return false;
  }
  let matchingBlobs = [];
  let blobThreshold = false;
  for (const key in ProjectFileStructure) {
    const fileOfSingleBranch = ProjectFileStructure[key];
    let matchingBlobsOfEachBranch = [];
    for (let index = 0; index < fileOfSingleBranch.length; index++) {
      const element = fileOfSingleBranch[index];
      if (
        repoUrlInfo.sourceType === "github" &&
        projectUrlInfo.sourceType === "github"
      ) {
        let blob = await githubServices.getBlobByBlobId(
          repoUrlInfo,
          element.sha
        );
        if (blob) {
          matchingBlobsOfEachBranch.push(blob);
        }
      } else if (
        repoUrlInfo.sourceType === "gitlab" &&
        projectUrlInfo.sourceType === "gitlab"
      ) {
        let blob = await gitlabServices.getBlobByBlobId(
          repository.id,
          element.id
        );
        if (blob) {
          matchingBlobsOfEachBranch.push(blob);
        }
      } else if (
        repoUrlInfo.sourceType === "gitlab" &&
        projectUrlInfo.sourceType === "github"
      ) {
        let blob = await githubServices.getBlobByBlobId(
          repoUrlInfo,
          element.sha
        );
        if (blob) {
          matchingBlobsOfEachBranch.push(blob);
        }
      } else if (
        repoUrlInfo.sourceType === "github" &&
        projectUrlInfo.sourceType === "gitlab"
      ) {
        let blob = await gitlabServices.getBlobByBlobId(
          repository.id,
          element.id
        );
        if (blob) {
          matchingBlobsOfEachBranch.push(blob);
        }
      }
      if (matchingBlobsOfEachBranch.length > 5) {
        matchingBlobs = matchingBlobsOfEachBranch;
        break;
      }
    }
    if (matchingBlobs.length > parseInt(process.env.MATCHING_BLOBS_COUNT)) {
      blobThreshold = true;
      break;
    }
  }
  return blobThreshold;
};
//function for check a repository tags with project tags ,Is same?
const checkTagsNameIsSame = async (repository, projectTags, projectId) => {
  let matchingTags = [];
  let repositoryTags = [];
  let repoUrlInfo = commonFunction.getInfoByProjectUrl(repository.url);

  if (repository.source_type == "github") {
    repositoryTags = await githubServices.getTags(repoUrlInfo);
    matchingTags = projectTags.map((tag) => {
      for (let index = 0; index < repositoryTags.length; index++) {
        const ele = repositoryTags[index];
        if (ele.name.localeCompare(tag.name) === 1) {
          return ele;
        }
      }
    });
  } else if (repository.source_type == "gitlab") {
    repositoryTags = await gitlabServices.getTags(projectId);
    matchingTags = projectTags.map((tag) => {
      for (let index = 0; index < repositoryTags.length; index++) {
        const ele = repositoryTags[index];
        if (ele.name.localeCompare(tag.name) === 1) {
          return ele;
        }
      }
    });
  } else if (repository.source_type == "bitbucket") {
    repositoryTags = await bitbucketServices.getTags(repoUrlInfo);
    matchingTags = projectTags.map((tag) => {
      for (let index = 0; index < repositoryTags.length; index++) {
        const ele = repositoryTags[index];
        if (ele.name.localeCompare(tag.name) === 1) {
          return ele;
        }
      }
    });
  }
  if (matchingTags.length >= process.env.MATCHING_TAGS_COUNT) {
    return matchingTags;
  } else {
    return false;
  }
};
//function for check a repository labels with project labels ,Is same?
const checkLabelsNameIsSame = async (repository, projectLabels, projectId) => {
  let matchingLabels = [];
  let repositoryLabels = [];
  let repoUrlInfo = commonFunction.getInfoByProjectUrl(repository.url);

  if (projectLabels.length <= 0) {
    return false;
  } else {
    if (repository.source_type == "github") {
      repositoryLabels = await githubServices.getLabels(repoUrlInfo);
      matchingLabels = projectLabels.map((tag) => {
        for (let index = 0; index < repositoryLabels.length; index++) {
          const ele = repositoryLabels[index];
          if (ele.name.localeCompare(tag.name) === 1) {
            return ele;
          }
        }
      });
    } else if (repository.source_type == "gitlab") {
      repositoryLabels = await gitlabServices.getLabels(projectId);
      matchingLabels = projectLabels.map((tag) => {
        for (let index = 0; index < repositoryLabels.length; index++) {
          const ele = repositoryLabels[index];
          if (ele.name.localeCompare(tag.name) === 1) {
            return ele;
          }
        }
      });
    }
    if (matchingLabels.length >= process.env.MATCHING_LABELS_COUNT) {
      return matchingLabels;
    } else {
      return false;
    }
  }
};
//function for check a repository languages with project languages ,Is same?
const checkLanguagesNameIsSame = async (repository, projectLanguages) => {
  let matchingLanguages = [];
  let repositoryLanguages = [];
  let repoUrlInfo = commonFunction.getInfoByProjectUrl(repository.url);

  if (projectLanguages.length <= 0) {
    return false;
  } else {
    if (repository.source_type == "github") {
      repositoryLanguages = await githubServices.getLabels(repoUrlInfo);
      matchingLanguages = projectLanguages.map((tag) => {
        for (let index = 0; index < repositoryLanguages.length; index++) {
          const ele = repositoryLanguages[index];
          if (ele.name.localeCompare(tag.name) === 1) {
            return ele;
          }
        }
      });
    }
    if (matchingLanguages.length > 2) {
      return true;
    } else {
      return false;
    }
  }
};
//function for check repository is suspicious or not?
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
      thresholdObj.commit = await checkCommitIds(repository, projectDetail);
      if (thresholdObj.commit) {
        await markAsSuspiciousRepository(repository.id);
        return null; // continue the loop
      }
      thresholdObj.blob = await checkBlobIdsIsSame(
        repository,
        projectDetail.fileStructure,
        projectDetail.projectUrlInfo
      );
      if (thresholdObj.blob) {
        await markAsSuspiciousRepository(repository.id);
        return null; // continue the loop
      }
      thresholdObj.tags = await checkTagsNameIsSame(
        repository,
        projectDetail.tags,
        projectDetail.repoResponce.id
      );
      thresholdObj.labels = await checkLabelsNameIsSame(
        repository,
        projectDetail.labels,
        projectDetail.repoResponce.id
      );
      thresholdObj.language = await checkLanguagesNameIsSame(
        repository,
        projectDetail.language,
        projectDetail.repoResponce.id
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
