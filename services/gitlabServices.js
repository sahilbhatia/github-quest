const request = require("superagent");
const { Sentry } = require("./../utils/sentry");
const log4js = require("../config/loggerConfig");
const logger = log4js.getLogger();
const databaseService = require("./databaseServices");

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

//function for get all branches of single repository
const getAllBranchesOfRepo = async (project_id, repositoryId) => {
  try {
    let ProjectBranches = await request
      .get(
        "https://gitlab.com/api/v4/projects/" +
          project_id +
          "/repository/branches"
      )
      .set({ "PRIVATE-TOKEN": process.env.GITLAB_ACCESS_TOKEN });
    if (ProjectBranches.body) {
      let data = await ProjectBranches.body.map(async (branch) => {
        await databaseService.insertBranch(repositoryId, branch, "gitlab");
      });
      await Promise.all(data);
      return ProjectBranches.body;
    } else {
      return false;
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error("Error executing while get all branches function");
    logger.error(err);
    logger.info("=========================================");
    return null;
  }
};

//function for get new commit by branches
const getCommitsByBranches = async (repo, branches, repositoryId) => {
  try {
    const commitsObj = {};
    let data = await branches.map(async (branch) => {
      try {
        let url = `https://gitlab.com/api/v4/projects/${
          repo.source_repo_id
        }/repository/commits?since=${repo.reviewed_at}&ref_name="${
          branch.name
        }"&all=${true}`;
        if (!repo.reviewed_at) {
          url = `https://gitlab.com/api/v4/projects/${
            repo.source_repo_id
          }/repository/commits?ref_name="${branch.name}"&all=${true}`;
        }
        const commits = await request
          .get(url)
          .set({ "PRIVATE-TOKEN": process.env.GITLAB_ACCESS_TOKEN });
        let data = await commits.body.map(async (commit) => {
          await databaseService.insertCommits(repositoryId, commit, "gitlab");
        });
        await Promise.all(data);
        commitsObj[branch.name] = commits.body;
      } catch (err) {
        commitsObj[branch.name] = false;
      }
    });
    await Promise.all(data);
    return commitsObj;
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while get all commits of each branches of repository of gitlab"
    );
    logger.error(err);
    logger.info("=========================================");
    return false;
  }
};

//function for get single commit by commit id from gitlab
const getCommitByCommitId = async (project_id, commit_id) => {
  try {
    let commit = await request
      .get(
        "https://gitlab.com/api/v4/projects/" +
          project_id +
          "/repository/commits/" +
          commit_id
      )
      .set({ "PRIVATE-TOKEN": process.env.GITLAB_ACCESS_TOKEN });
    if (commit.body) {
      return commit.body;
    } else {
      return false;
    }
  } catch (err) {
    if (err.status !== 404) {
      Sentry.captureException(err);
      logger.error(
        "Error executing while get single commit detail by commit id function"
      );
      logger.error(err);
      logger.info("=========================================");
    }
    return null;
  }
};

//function for get single blob(file) by blob id from gitlab
const getBlobByBlobId = async (project_id, blob_id) => {
  try {
    let blob = await request
      .get(
        "https://gitlab.com/api/v4/projects/" +
          project_id +
          "/repository/blobs/" +
          blob_id
      )
      .set({ "PRIVATE-TOKEN": process.env.GITLAB_ACCESS_TOKEN });
    if (blob.body) {
      return blob.body;
    } else {
      return false;
    }
  } catch (err) {
    if (err.status !== 404 || err.status !== 409) {
      Sentry.captureException(err);
      logger.error(
        "Error executing while get single blob detail by blob id function"
      );
      logger.error(err);
      logger.info("=========================================");
    }
    return null;
  }
};

//get a filelist by the url from gitlab
const getFileList = async (url) => {
  try {
    const fileList = await request
      .get(url)
      .set({ "PRIVATE-TOKEN": process.env.GITLAB_ACCESS_TOKEN });
    return fileList.body;
  } catch (err) {
    Sentry.captureException(err);
    logger.error("Error executing while get file list of gitlab repository");
    logger.error(err);
    logger.info("=========================================");
    return false;
  }
};

//get a filelist by the url from gitlab
const getTags = async (projectId) => {
  try {
    const fileList = await request
      .get(`https://gitlab.com/api/v4/projects/${projectId}/repository/tags`)
      .set({ "PRIVATE-TOKEN": process.env.GITLAB_ACCESS_TOKEN });
    return fileList.body;
  } catch (err) {
    Sentry.captureException(err);
    logger.error("Error executing while get tags list of gitlab repository");
    logger.error(err);
    logger.info("=========================================");
    return false;
  }
};

module.exports = {
  getLabels: getLabels,
  getRepositoryFromGitlab: getRepositoryFromGitlab,
  getAllBranchesOfRepo: getAllBranchesOfRepo,
  getCommitsByBranches: getCommitsByBranches,
  getCommitByCommitId: getCommitByCommitId,
  getBlobByBlobId: getBlobByBlobId,
  getFileList: getFileList,
  getTags: getTags,
};
