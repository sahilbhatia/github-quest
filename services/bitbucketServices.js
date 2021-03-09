const request = require("superagent");
const { Sentry } = require("./../utils/sentry");
const log4js = require("../config/loggerConfig");
const logger = log4js.getLogger();

//function for get all tags of single repository
const getTags = async (repoInfo) => {
  try {
    let isIncompleteTags = true;
    let count = 5;
    let allTags = [];
    let url = `https://api.bitbucket.org/2.0/repositories/${repoInfo.handle}/${repoInfo.repositorieName}/refs/tags?access_token=${process.env.BITBUCKET_ACCESS_TOKEN}&pagelen=5`;
    while (isIncompleteTags) {
      let ProjectTags = await request.get(url);
      if (ProjectTags.body) {
        allTags = allTags.concat(ProjectTags.body.values);
        if (count < ProjectTags.body.next) {
          url = ProjectTags.body.next;
          count = count + 5;
        } else {
          break;
        }
      }
    }
    if (allTags.length > 0) {
      return allTags;
    } else {
      return false;
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while get tags of  bitbucket repository in repository"
    );
    logger.error(err);
    logger.info("=========================================");
    return null;
  }
};

// function for get project details from bitbucket
const getRepositoryFromBitbucket = async (project) => {
  try {
    const projectRepo = await request.get(
      `https://api.bitbucket.org/2.0/repositories/${project.handle}/${project.repositorieName}?access_token=${process.env.BITBUCKET_ACCESS_TOKEN}`
    );
    if (projectRepo.body) {
      return projectRepo.body;
    } else {
      return false;
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while fetching projects in get repositories from bitbucket function"
    );
    logger.error(err);
    logger.info("=========================================");
    return false;
  }
};
//function for get all commits of all branches
const getCommitsByBranches = async (repo, repoUrlInfo, branches) => {
  let commitsObj = {};
  let data = await branches.map(async (branch) => {
    //can we just hit this API for master ,staging and production branches
    try {
      let isIncompleteCommits = true;
      let allCommits = [];
      let url = `https://api.bitbucket.org/2.0/repositories/${repoUrlInfo.handle}/${repoUrlInfo.repositorieName}/commits/${branch.name}?access_token=${process.env.BITBUCKET_ACCESS_TOKEN}`;
      try {
        while (isIncompleteCommits) {
          const commits = await request.get(url);
          if (repo.reviewed_at && commits.body.values.length > 0) {
            if (
              new Date(commits.body.values[0].date) > new Date(repo.reviewed_at)
            ) {
              if (
                new Date(
                  commits.body.values[commits.body.values.length - 1].date
                ) > new Date(repo.reviewed_at)
              ) {
                allCommits = allCommits.concat(commits.body.values);
                url = commits.body.next;
              } else {
                commits.body.values.map((commit) => {
                  if (new Date(commit.date) >= new Date(repo.reviewed_at)) {
                    allCommits.push(commit);
                  }
                });
                url = commits.body.next;
              }
              if (!url) {
                isIncompleteCommits = false;
              }
            } else {
              isIncompleteCommits = false;
            }
          } else {
            isIncompleteCommits = false;
          }
        }
      } catch (err) {
        logger.error(err);
        logger.info("=========================================");
      }
      commitsObj[branch.name] = allCommits;
    } catch (err) {
      Sentry.captureException(err);
      logger.error(
        "Error executing while get all branches of  bitbucket repository in get all commits of each branches of repository function"
      );
      logger.error(err);
      logger.info("=========================================");
      commitsObj[branch.name] = false;
    }
  });
  await Promise.all(data);
  return commitsObj;
};

//function for get all branches of single repository
const getAllBranchesOfRepo = async (repoInfo) => {
  try {
    let isIncompleteCommits = true;
    let count = 10;
    let allBranches = [];
    let url = `https://api.bitbucket.org/2.0/repositories/${repoInfo.handle}/${repoInfo.repositorieName}/refs/branches?access_token=${process.env.BITBUCKET_ACCESS_TOKEN}&pagelen=10`;
    while (isIncompleteCommits) {
      let ProjectBranches = await request.get(url);
      if (ProjectBranches.body) {
        allBranches = allBranches.concat(ProjectBranches.body.values);
        if (count < ProjectBranches.body.size) {
          url = ProjectBranches.body.next;
          count = count + 10;
        } else {
          break;
        }
      }
    }
    if (allBranches.length > 0) {
      return allBranches;
    } else {
      return false;
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while get all branches of  bitbucket repository in get all branches of repository function"
    );
    logger.error(err);
    logger.info("=========================================");
    return null;
  }
};

//function for get single commit detail by commit id from bitbucket
const getCommitByCommitId = async (repoInfo, commit_id) => {
  try {
    let url = `https://api.bitbucket.org/2.0/repositories/${repoInfo.handle}/${repoInfo.repositorieName}/commit/${commit_id}?access_token=${process.env.BITBUCKET_ACCESS_TOKEN}`;
    const commit = await request.get(url);
    if (commit.body) {
      return commit.body;
    } else {
      return false;
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while fetching commit details by commit id from bitbucket"
    );
    logger.error(err);
    logger.info("=========================================");
    return false;
  }
};

//function for get all file by passing url from bitbucket
const getFileList = async (url) => {
  try {
    let isIncompleteFiles = true;
    let allFiles = [];
    while (isIncompleteFiles) {
      let ProjectFiles = await request.get(url);
      if (ProjectFiles.body) {
        ProjectFiles.body.values.map((file) => {
          if (file.type == "commit_file") {
            file.name = file.escaped_path.split("/").pop();
            allFiles.push(file);
          } else {
            allFiles.push(file);
          }
        });
        allFiles = allFiles.concat(ProjectFiles.body.values);
        if (ProjectFiles.body.next) {
          url = ProjectFiles.body.next;
        } else {
          break;
        }
      }
    }
    if (allFiles.length > 0) {
      return allFiles;
    } else {
      return false;
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while get all files of branch from bitbucket repository"
    );
    logger.error(err);
    logger.info("=========================================");
    return null;
  }
};
module.exports = {
  getTags: getTags,
  getRepositoryFromBitbucket: getRepositoryFromBitbucket,
  getCommitsByBranches: getCommitsByBranches,
  getAllBranchesOfRepo: getAllBranchesOfRepo,
  getCommitByCommitId: getCommitByCommitId,
  getFileList: getFileList,
};
