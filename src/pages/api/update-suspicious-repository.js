const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const Repositories = db.repositories;
const Commits = db.commits;
const validation = require("../../../utils/validationSchema");
const { Sentry } = require("../../../utils/sentry");

//function for update repository
const updateRepo = async (repoId, updatedAt, res) => {
  try {
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
  } catch (err) {
    Sentry.captureException(err);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
//function for update parent repository
const updateParentRepo = async (repoId, updatedAt, res) => {
  try {
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
  } catch (err) {
    Sentry.captureException(err);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

//function for clear remark
const clearRemark = async (id) => {
  await Commits.destroy({ where: { repository_id: id } });
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
          res.status(404).json({
            message: "Repository Not Found For Specified Id",
          });
        } else {
          const updatedRepo = await updateRepo(repoId, updatedAt, res);
          if (updatedRepo[1].dataValues.parent_repo_id) {
            await updateParentRepo(
              updatedRepo[1].dataValues.parent_repo_id,
              updatedAt,
              res
            );
            await clearRemark(updatedRepo[1].dataValues.parent_repo_id);
          }
          await clearRemark(repoId);
          res.status(200).json({
            message: "Repository Updated Successfully",
          });
        }
      } catch (err) {
        Sentry.captureException(err);
        res.status(500).json({
          message: "internal server error",
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

export default updateSuspiciousRepo;
