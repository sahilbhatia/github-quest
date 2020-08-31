const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const Repositories = db.repositories;
const yup = require("yup");

const updateManualRepos = async (req, res) => {
  const repoId = req.query.id;
  const updatedAt = req.query.updatedAt;
  let manualRepoReview;
  await yup
    .object()
    .shape({
      repoId: yup.number().required({ repoId: "required" }),
      updatedAt: yup.string().required({ updatedAt: "required" }),
    })
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
            message: "repository not found for given id",
          });
        } else {
          manualRepoReview = await Repositories.update(
            {
              manual_review: false,
              review: "approved",
              reviewed_at: updatedAt,
            },
            {
              returning: true,
              plain: true,
              where: { id: repoId },
            }
          );
          if (manualRepoReview[1].dataValues.parent_repo_id) {
            await Repositories.update(
              {
                manual_review: false,
                review: "approved",
                reviewed_at: updatedAt,
              },
              {
                returning: true,
                where: {
                  parent_repo_id: manualRepoReview[1].dataValues.parent_repo_id,
                },
              }
            );
          }
          await Repositories.update(
            {
              manual_review: false,
              review: "approved",
              reviewed_at: updatedAt,
            },
            {
              returning: true,
              where: { parent_repo_id: manualRepoReview[1].dataValues.id },
            }
          );

          res.status(200).json({
            message: "repository updated successfully",
          });
        }
      } catch {
        res.status(500).json({
          message: "Internal server error",
        });
      }
    })
    .catch(() => {
      res.status(400).json({
        message: "repo Id must be number",
      });
    });
};

export default updateManualRepos;
