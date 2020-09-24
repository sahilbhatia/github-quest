var cron = require("node-cron");
const {
  validateGitHubToken,
  ValidationError,
} = require("validate-github-token");
const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const github = require("../../../utils/githubFunction");
const gitlab = require("../../../utils/gitlabFunction");
const bitbucket = require("../../../utils/bitbucketFunction");
const Users = db.users;

//function for validate githun access token
const gitHubValidation = async () => {
  try {
    await validateGitHubToken(process.env.GITHUB_ACCESS_TOKEN);
    return true;
  } catch (err) {
    if (err instanceof ValidationError) {
      return false;
    } else {
      return true;
    }
  }
};

const insertPublicRepos = async (req, res) => {
  const insertRepos = async () => {
    const validate = await gitHubValidation();
    if (validate) {
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
      });
      res.status(200).json({
        message: "cron Job Activated successfully for inserting repositories",
      });
    } else {
      res.status(401).json({
        error: "Unauthorized User",
        message: "Invalid GiHub Access Token",
      });
    }
  };

  cron.schedule(process.env.INSERT_PUBLIC_REPOS_SCHEDULE, async () => {
    insertRepos();
  });
  insertRepos();
};

export default insertPublicRepos;
