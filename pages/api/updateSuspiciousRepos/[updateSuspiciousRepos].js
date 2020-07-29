const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const Repositories = db.repositories;
const moment = require('moment');
const yup = require("yup");

const updateSuspiciousRepos = async (req, res) => {
  const repoId = req.query.id;
  let suspeciousRepo;
  
  yup.object().shape({
    repoId: yup
      .number()
      .required({ repoId: "required" }),
  }).validate({
    repoId: req.query.id
  }, { abortEarly: false })
  .catch(()=>{
    res.status(400).json({
      message: "repo Id must be number"
    })
  })

  if (repoId != "undefined") {
    try {
      suspeciousRepo = await Repositories.update({
        is_suspicious: true,
        review: "suspicious manual",
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

    if (suspeciousRepo[1].dataValues.parent_repo_id) {
      try {
        await Repositories.update({
          is_suspicious: true,
          review: "suspicious manual",
          reviewed_at: moment.utc().format(),
        }, {
          returning: true,
          where: { parent_repo_id: suspeciousRepo[1].dataValues.parent_repo_id },
        });
      } catch{
        res.status(404).json({
          message: "repository with specified id not found"
        })
      }
    }
    try {
      await Repositories.update({
        is_suspicious: true,
        review: "suspicious manual",
        reviewed_at: moment.utc().format(),
      }, {
        returning: true,
        where: { parent_repo_id: suspeciousRepo[1].dataValues.id },
      });
    } catch {
      res.status(404).json({
        message: "repository with specified id not found"
      })
    }

    res.status(200).json({
      message: "repository updated successfully"
    })
  }
}

export default updateSuspiciousRepos;


