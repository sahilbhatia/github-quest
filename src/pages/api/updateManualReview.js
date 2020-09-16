const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const Repositories = db.repositories;
const validation = require("../utils/validationSchema");

//function for update repository
const updateRepo = async (repoId, updatedAt) => {
  const updateRepo = await Repositories.update(
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
  return updateRepo;
};
//function for update parent repository
const updateParentRepo = async (repoId, updatedAt) => {
  await Repositories.update(
    {
      manual_review: false,
      review: "approved",
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

//function for manual review
const updateManualRepo = async (req, res) => {
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
            message: "Repository Not Found For Given Id",
          });
        } else {
          const updatedRepo = await updateRepo(repoId, updatedAt);
          if (updatedRepo[1].dataValues.parent_repo_id) {
            await updateParentRepo(
              updatedRepo[1].dataValues.parent_repo_id,
              updatedAt
            );
          }
          await updateParentRepo(updatedRepo[1].dataValues.id, updatedAt);

          res.status(200).json({
            message: "Repository Updated Successfully",
          });
        }
      } catch {
        res.status(500).json({
          message: "Internal Server Error",
        });
      }
    })
    .catch((err) => {
      const errors = err.errors;
      res.status(400).json({
        message: "Validation Error",
        errors,
      });
    });
};

export default updateManualRepo;
