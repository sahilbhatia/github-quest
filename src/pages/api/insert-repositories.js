var cron = require("node-cron");
const dbConn = require("../../../models/sequelize");
const moment = require("moment");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const github = require("../../../utils/githubFunction");
const gitlab = require("../../../utils/gitlabFunction");
const bitbucket = require("../../../utils/bitbucketFunction");
const Users = db.users;
const validation = require("../../../utils/validation");
const { Sentry } = require("../../../utils/sentry");

const insertPublicRepos = async (req, res) => {
  const insertRepos = async () => {
    try {
      const validate = await validation.validateToken();
      if (validate.status == 401) {
        res.status(401).json({
          error: "Unauthorized",
          message: validate.message,
        });
      } else if (validate.status == 403) {
        process.env["RETRY"] = true;
        res.status(403).json({
          error: "Rate Limit Exceeded",
          message: validate.message,
        });
      } else {
        const usersList = await Users.findAll({
          attributes: [
            "id",
            "github_handle",
            "gitlab_handle",
            "bitbucket_handle",
            "last_fetched_at",
          ],
          order: [["id", "ASC"]],
        });
        await usersList.map(async (user) => {
          if (user.dataValues.bitbucket_handle) {
            await bitbucket.insertBitbucketRepos(user);
          }
          if (user.dataValues.gitlab_handle) {
            await gitlab.insertGitlabRepos(user);
          }
          if (user.dataValues.github_handle) {
            await github.insertGithubRepos(user);
          }
          await Users.update(
            { last_fetched_at: moment.utc().format() },
            {
              where: { id: user.dataValues.id },
            }
          );
        });
        res.status(200).json({
          message: "cron Job Activated successfully for inserting repositories",
        });
      }
    } catch (err) {
      Sentry.captureException(err);
      return null;
    }
  };

  //for daily cron schedule
  cron.schedule(process.env.INSERT_PUBLIC_REPOS_SCHEDULE, async () => {
    await insertRepos();
  });

  //for retry cron schedule
  cron.schedule(process.env.RETRY_SCHEDULE, async () => {
    if (process.env.RETRY == "true") {
      await insertRepos();
    }
  });

  await insertRepos();
};

export default insertPublicRepos;
