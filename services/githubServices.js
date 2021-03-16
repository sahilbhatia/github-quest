const request = require("superagent");
const { headers } = require("./../constants/githubHeader");
const { Sentry } = require("./../utils/sentry");
const log4js = require("../config/loggerConfig");
const logger = log4js.getLogger();
const databaseService = require("./databaseServices");

//function for get all tags from github
const getTags = async (repoUrlInfo) => {
  try {
    const tags = await request
      .get(
        `https://api.github.com/repos/${repoUrlInfo.handle}/${repoUrlInfo.repositorieName}/tags`
      )
      .set(headers);
    return tags.body;
  } catch (err) {
    Sentry.captureException(err);
    logger.error("Error executing while get all tags of github repository");
    logger.error(err);
    logger.info("=========================================");
    return false;
  }
};

//function for get all labels from github
const getLabels = async (repoUrlInfo) => {
  try {
    const labels = await request
      .get(
        `https://api.github.com/repos/${repoUrlInfo.handle}/${repoUrlInfo.repositorieName}/labels`
      )
      .set(headers);
    return labels.body;
  } catch (err) {
    Sentry.captureException(err);
    logger.error("Error executing while get all labels of github repository");
    logger.error(err);
    logger.info("=========================================");
    return false;
  }
};
// function for get project details from github
const getRepositoryFromGithub = async (project) => {
  try {
    let projectRepo = await request
      .get(
        `https://api.github.com/repos/${project.handle}/${project.repositorieName}`
      )
      .set(headers);
    if (projectRepo) {
      return projectRepo.body;
    } else {
      return false;
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while fetching projects in get repositories from github function"
    );
    logger.error(err);
    logger.info("=========================================");
    return false;
  }
};

//function for get commits by branches head sha
const getCommitsByBranches = async (
  repo,
  repoUrlInfo,
  branches,
  repositoryId
) => {
  try {
    let commitsObj = {};
    let data = await branches.map(async (branch) => {
      //can we just hit this API for master ,staging and production branches
      const url = `https://api.github.com/repos/${repoUrlInfo.handle}/${repo.name}/commits?sha=${branch.commit.sha}`;
      const commits = await request.get(url).set(headers);
      let data = await commits.body.map(async (commit) => {
        await databaseService.insertCommits(repositoryId, commit, "github");
      });
      await Promise.all(data);
      commitsObj[branch.name] = commits.body;
    });
    await Promise.all(data);
    return commitsObj;
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while get all commits of each branches of repo github repositories in get all repository function"
    );
    logger.error(err);
    logger.info("=========================================");
    return null;
  }
};

//function for get all branches of single repository
const getAllBranchesOfRepo = async (repoInfo, repositoryId) => {
  try {
    let ProjectBranches = await request
      .get(
        "https://api.github.com/repos/" +
          repoInfo.handle +
          "/" +
          repoInfo.repositorieName +
          "/branches"
      )
      .set(headers);
    if (ProjectBranches.body) {
      let data = await ProjectBranches.body.map(async (branch) => {
        await databaseService.insertBranch(repositoryId, branch, "github");
      });
      await Promise.all(data);
      return ProjectBranches.body;
    } else {
      return false;
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while get all branches of repo github repositories in get all repository function"
    );
    logger.error(err);
    logger.info("=========================================");
    return null;
  }
};
//get a filelist by the url from github
const getFileList = async (url) => {
  try {
    const fileList = await request.get(url).set(headers);
    return fileList.body;
  } catch (err) {
    Sentry.captureException(err);
    logger.error("Error executing while get file list of github repository");
    logger.error(err);
    logger.info("=========================================");
    return false;
  }
};

//get a single commit details by commit_id from github
const getCommitByCommitId = async (repoUrlInfo, commit_id) => {
  try {
    const commit = await request
      .get(
        `https://api.github.com/repos/${repoUrlInfo.handle}/${repoUrlInfo.repositorieName}/commits/${commit_id}`
      )
      .set(headers);

    return commit.body;
  } catch (err) {
    if (err.status !== 404) {
      Sentry.captureException(err);
      logger.error(
        "Error executing while get commit details by commit_id from github"
      );
      logger.error(err);
      logger.info("=========================================");
    }
    return false;
  }
};

//get a single blob(file) details by blob_id from github
const getBlobByBlobId = async (repoUrlInfo, blob_id) => {
  try {
    const blob = await request
      .get(
        `https://api.github.com/repos/${repoUrlInfo.handle}/${repoUrlInfo.repositorieName}/git/blobs/${blob_id}`
      )
      .set(headers);

    return blob.body;
  } catch (err) {
    if (err.status !== 404) {
      Sentry.captureException(err);
      logger.error(
        "Error executing while get blob(file) details by blob_id from github"
      );
      logger.error(err);
      logger.info("=========================================");
    }
    return false;
  }
};
module.exports = {
  getTags: getTags,
  getLabels: getLabels,
  getRepositoryFromGithub: getRepositoryFromGithub,
  getCommitsByBranches: getCommitsByBranches,
  getAllBranchesOfRepo: getAllBranchesOfRepo,
  getFileList: getFileList,
  getCommitByCommitId: getCommitByCommitId,
  getBlobByBlobId: getBlobByBlobId,
};
