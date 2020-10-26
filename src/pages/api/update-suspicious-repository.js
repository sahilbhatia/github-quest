const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const Repositories = db.repositories;
const Commits = db.commits;
const validation = require("../../../utils/validationSchema");
const log4js = require("../../../config/loggerConfig");
const logger = log4js.getLogger();
const { Sentry } = require("../../../utils/sentry");
const {
  REPOSITORY_NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  REPOSITORY_UPDATED,
  VALIDATION_ERROR,
} = require("../../../constants/responseConstants");
const {
  UPDATE_SUSPICIOUS_REPOSITORY,
} = require("../../../constants/objectConstants");

//function for update repository
const updateRepo = async (repoId, updatedAt) => {
  UPDATE_SUSPICIOUS_REPOSITORY.reviewed_at = updatedAt;
  const updateRepo = await Repositories.update(UPDATE_SUSPICIOUS_REPOSITORY, {
    returning: true,
    plain: true,
    where: { id: repoId },
  });
  return updateRepo;
};

//function for update parent repository
const updateParentRepo = async (repoId, updatedAt) => {
  UPDATE_SUSPICIOUS_REPOSITORY.reviewed_at = updatedAt;
  await Repositories.update(UPDATE_SUSPICIOUS_REPOSITORY, {
    returning: true,
    where: {
      parent_repo_id: repoId,
    },
  });
};

//function for clear remark
const clearRemark = async (id) => {
  await Commits.destroy({ where: { repository_id: id } });
};

//function for get invalid repository ids
const getInvalidRepoIds = async (arr) => {
  let invalidIds = [];
  const repo = await arr.map(async (id) => {
    const repo = await Repositories.findOne({ where: { id: id } });
    if (!repo) invalidIds.push(id);
  });
  await Promise.all(repo);
  return invalidIds;
};

//function for update suspicious repo
const updateSuspiciousRepo = async (req, res) => {
  const repoIds = req.body.ids;
  const updatedAt = req.query.updatedAt;
  await validation
    .reviewSchema()
    .validate(
      {
        repoIds: repoIds,
        updatedAt: updatedAt,
      },
      { abortEarly: false }
    )
    .then(async () => {
      try {
        const invalidRepos = await getInvalidRepoIds(repoIds);
        if (invalidRepos.length == 0) {
          const updateData = await repoIds.map(async (id) => {
            const updatedRepo = await updateRepo(id, updatedAt);
            if (updatedRepo[1].dataValues.parent_repo_id) {
              await updateParentRepo(
                updatedRepo[1].dataValues.parent_repo_id,
                updatedAt
              );
              await clearRemark(updatedRepo[1].dataValues.parent_repo_id);
            }
            await clearRemark(id);
          });
          await Promise.all(updateData);
          res.status(200).json(REPOSITORY_UPDATED);
        } else {
          REPOSITORY_NOT_FOUND.ids = invalidRepos;
          res.status(404).json(REPOSITORY_NOT_FOUND);
        }
      } catch (err) {
        Sentry.captureException(err);
        logger.error("Error executing in update suspicious repository api");
        logger.error(err);
        logger.info("=========================================");
        res.status(500).json(INTERNAL_SERVER_ERROR);
      }
    })
    .catch((err) => {
      Sentry.captureException(err);
      const errors = err.errors;
      res.status(400).json({
        VALIDATION_ERROR,
        errors,
      });
    });
};

export default updateSuspiciousRepo;
