const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const Repositories = db.repositories;
const Users_repositories = db.users_repositories;
const Users = db.users;
const yup = require("yup");
const { Sentry } = require("../../../utils/sentry");
const log4js = require("../../../config/loggerConfig");
const logger = log4js.getLogger();
const {
  INTERNAL_SERVER_ERROR,
  FORK_REPOSITORY_NOT_FOUND,
  VALIDATION_ERROR,
} = require("../../../constants/responseConstants");

//function for return forked repo
const forkedRepos = async (repoId) => {
  const data = await Repositories.findAll({
    where: { parent_repo_id: repoId },
    include: [
      {
        model: Repositories,
        as: "parent",
        include: [
          {
            model: Repositories,
            as: "children",
          },
        ],
      },
      {
        model: Repositories,
        as: "children",
      },
      {
        model: Users_repositories,
        include: {
          model: Users,
        },
      },
    ],
  });
  return data;
};

//get forked repos
const getForkedRepos = async (req, res) => {
  await yup
    .object()
    .shape({
      repoId: yup.number().required({ repoId: "required" }),
    })
    .validate({
      repoId: req.query.id,
    })
    .then(async () => {
      try {
        const data = await forkedRepos(req.query.id);
        if (data.length == 0) {
          res.status(404).json(FORK_REPOSITORY_NOT_FOUND);
        } else {
          res.status(200).json(data);
        }
      } catch (err) {
        Sentry.captureException(err);
        logger.error(
          "Error executing in fork api while getting forked repositories"
        );
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

export default getForkedRepos;
