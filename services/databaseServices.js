const dbConn = require("../models/sequelize");
const { Sentry } = require("./sentry");
const log4js = require("../config/loggerConfig");
const logger = log4js.getLogger();
dbConn.sequelize;
const db = require("../models/sequelize");
const Branches = db.branches;

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
        where: { id: branch.id },
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

module.exports = {
  insertBranch: insertBranch,
};
