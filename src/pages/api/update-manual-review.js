const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const Repositories = db.repositories;
const Commits = db.commits;
const validation = require("../../../utils/validationSchema");
const log4js = require("../../../config/loggerConfig");
const logger = log4js.getLogger();
const { Sentry } = require("../../../utils/sentry");

//function for update repository
const updateRepo = async (repoId, updatedAt, comment) => {
  const updateRepo = await Repositories.update(
    {
      manual_review: false,
      review: "approved",
      reviewed_at: updatedAt,
      comment: comment ? comment : null,
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
const updateParentRepo = async (repoId, updatedAt, comment) => {
  await Repositories.update(
    {
      manual_review: false,
      review: "approved",
      reviewed_at: updatedAt,
      comment: comment ? comment : null,
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

//function for manual review
const updateManualRepo = async (req, res) => {
  let repoIds = req.query.ids.split(",");
  repoIds = repoIds.map(Number);
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
        await repoIds.map(async (id) => {
          let repo = await Repositories.findOne({ where: { id: id } });
          if (!repo) {
            res.status(404).json({
              message: "Repository Not Found For Given Id",
            });
          } else {
            let comment = req.body;
            const updatedRepo = await updateRepo(id, updatedAt, comment);
            if (updatedRepo[1].dataValues.parent_repo_id) {
              await updateParentRepo(
                updatedRepo[1].dataValues.parent_repo_id,
                updatedAt,
                comment
              );
              await clearRemark(updatedRepo[1].dataValues.parent_repo_id);
            }
            await clearRemark(id);
          }
        });
        res.status(200).json({
          message: "Repository Updated Successfully",
        });
      } catch (err) {
        Sentry.captureException(err);
        logger.error("Error executing in update manual review api");
        logger.error(err);
        logger.info("=========================================");
        res.status(500).json({
          message: "Internal Server Error",
        });
      }
    })
    .catch((err) => {
      Sentry.captureException(err);
      const errors = err.errors;
      res.status(400).json({
        message: "Validation Error",
        errors,
      });
    });
};

export default updateManualRepo;
