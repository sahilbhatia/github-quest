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
  INTERNAL_SERVER_ERROR,
  REPOSITORY_UPDATED,
  VALIDATION_ERROR,
  REPOSITORY_NOT_FOUND,
} = require("../../../constants/responseConstants");

//function for update repository
const updateRepo = async (repoId, updatedAt) => {
  const updateRepo = await Repositories.update(
    {
      is_suspicious: true,
      review: "suspicious manual",
      reviewed_at: updatedAt,
    },
    {
      returning: true,
      plain: true,
      where: { id: repoId },
    }
  );
  return updateRepo;
};

//function for update parent repository
const updateParentRepo = async (repoId, updatedAt) => {
  await Repositories.update(
    {
      is_suspicious: true,
      review: "suspicious manual",
      reviewed_at: updatedAt,
    },
    {
      returning: true,
      where: {
        parent_repo_id: repoId,
      },
    }
  );
};

//function for clear remark
const clearRemark = async (id) => {
  await Commits.destroy({ where: { repository_id: id } });
};

//function for update suspicious repo
const updateSuspiciousRepo = async (req, res) => {
  const repoId = req.query.id;
  const updatedAt = req.query.updatedAt;
  await validation
    .reviewSchema()
    .validate(
      {
        repoId: req.query.id,
        updatedAt: updatedAt,
      },
      { abortEarly: false }
    )
    .then(async () => {
      try {
        let repo = await Repositories.findOne({ where: { id: repoId } });
        if (!repo) {
          res.status(404).json(REPOSITORY_NOT_FOUND);
        } else {
          const updatedRepo = await updateRepo(repoId, updatedAt);
          if (updatedRepo[1].dataValues.parent_repo_id) {
            await updateParentRepo(
              updatedRepo[1].dataValues.parent_repo_id,
              updatedAt
            );
            await clearRemark(updatedRepo[1].dataValues.parent_repo_id);
          }
          await clearRemark(repoId);
          res.status(200).json(REPOSITORY_UPDATED);
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
      VALIDATION_ERROR.errors = err.errors;
      res.status(400).json(VALIDATION_ERROR);
    });
};

export default updateSuspiciousRepo;
