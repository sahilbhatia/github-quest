const dbConn = require("../models/sequelize");
const { Sentry } = require("./../utils/sentry");
const log4js = require("../config/loggerConfig");
const logger = log4js.getLogger();
dbConn.sequelize;
const db = require("../models/sequelize");
const Branches = db.branches;
const Commits = db.commits;

const getBranchObjBySourceType = (repository_id, branch, sourceType) => {
  let branchObj = {
    name: branch.name,
    head_commit_id: branch.commit ? branch.commit.sha : "",
    repository_id: repository_id,
  };
  if (sourceType == "gitlab") {
    branchObj.head_commit_id = branch.commit.id;
  } else if (sourceType == "bitbucket") {
    branchObj.head_commit_id = branch.target.hash;
  }
  return branchObj;
};
const insertBranch = async (repositoryId, item, sourceType) => {
  try {
    let branchObj = getBranchObjBySourceType(repositoryId, item, sourceType);
    let branch = await Branches.findOne({
      where: {
        repository_id: repositoryId,
        name: item.name,
      },
    });
    if (branch) {
      await Branches.update(branchObj, {
        returning: true,
        where: { id: branch.dataValues.id },
      });
    } else {
      await Branches.create(branchObj);
    }
    return null;
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while inserting or updating Branches in database"
    );
    logger.error(err);
    logger.info("=========================================");
    return null;
  }
};

const getCommitObjBySourceType = (repositoryId, commit, sourceType) => {
  const commitObj = {
    commit_id: commit.sha,
    commit: commit.commit ? commit.commit.message : "",
    repository_id: repositoryId,
  };

  if (sourceType == "gitlab") {
    commitObj.commit_id = commit.id;
    commitObj.commit = commit.message;
  } else if (sourceType == "bitbucket") {
    commitObj.commit_id = commit.hash;
    commitObj.commit = commit.message;
  }
  return commitObj;
};

const getCommitQueryBySourceType = (repositoryId, commit, sourceType) => {
  let query = {
    repository_id: repositoryId,
    commit_id: commit.sha,
  };
  if (sourceType == "gitlab") {
    query.commit_id = commit.id;
  } else if (sourceType == "bitbucket") {
    query.commit_id = commit.hash;
  }
  return query;
};

const insertCommits = async (repositoryId, item, sourceType) => {
  try {
    let commitObj = getCommitObjBySourceType(repositoryId, item, sourceType);
    let queryObj = getCommitQueryBySourceType(repositoryId, item, sourceType);
    let commit = await Commits.findOne({
      where: queryObj,
    });
    if (commit) {
      await Commits.update(commitObj, {
        returning: true,
        where: queryObj,
      });
    } else {
      await Commits.create(commitObj);
    }
    return null;
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while inserting or updating Commits in database"
    );
    logger.error(err);
    logger.info("=========================================");
    return null;
  }
};

module.exports = {
  insertBranch: insertBranch,
  insertCommits: insertCommits,
};
