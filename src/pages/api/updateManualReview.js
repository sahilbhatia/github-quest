const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const Repositories = db.repositories;
const yup = require("yup");

const updateManualRepos = async (req, res) => {
  const repoId = req.query.id;
  const updatedAt = req.query.updatedAt;
  let manualRepoReview;
  yup.object().shape({
    repoId: yup
      .number()
      .required({ repoId: "required" }),
    updatedAt: yup
      .string()
      .required({ updatedAt: "required" }),
  }).validate({
    repoId: req.query.id,
    updatedAt: updatedAt
  }, { abortEarly: false })
    .catch(() => {
      res.status(400).json({
        message: "repo Id must be number"
      })
    })

  try {
    manualRepoReview = await Repositories.update({
      manual_review: false,
      review: 'approved',
      reviewed_at: updatedAt,
    }, {
      returning: true,
      plain: true,
      where: { id: repoId },
    });
  } catch{
    res.status(404).json({
      message: "repository with specified id not found"
    })
  }
  
  if (manualRepoReview[1].dataValues.parent_repo_id) {
    try {
      await Repositories.update({
        manual_review: false,
        review: 'approved',
        reviewed_at: updatedAt,
      }, {
        returning: true,
        where: { parent_repo_id: manualRepoReview[1].dataValues.parent_repo_id },
      });
    } catch {
      res.status(404).json({
        message: "repository with specified id not found"
      })
    }
  }

  await Repositories.update({
    manual_review: false,
    review: 'approved',
    reviewed_at: updatedAt,
  }, {
    returning: true,
    where: { parent_repo_id: manualRepoReview[1].dataValues.id },
  });

  res.status(200).json({
    message: "repository updated successfully"
  })
}

export default updateManualRepos;