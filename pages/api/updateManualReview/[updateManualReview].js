const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const Repositories = db.repositories;
const moment = require('moment');
const yup = require("yup");

const updateManualRepos = async (req, res) => {
  const repoId = req.query.id;
  let manualRepoReview;
  yup.object().shape({
    repoId: yup
      .number()
      .required({ repoId: "required" }),
  }).validate({
    repoId: req.query.id
  }, { abortEarly: false })
    .catch(() => {
      res.status(400).json({
        message: "repo Id must be number"
      })
    })

  if (repoId != "undefined") {

    try {
      manualRepoReview = await Repositories.update({
        manual_review: false,
        review: 'approved',
        reviewed_at: moment.utc().format(),
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
          reviewed_at: moment.utc().format(),
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
      reviewed_at: moment.utc().format(),
    }, {
      returning: true,
      where: { parent_repo_id: manualRepoReview[1].dataValues.id },
    });

    res.status(200).json({
      message: "repository updated successfully"
    })
  }
}

export default updateManualRepos;

