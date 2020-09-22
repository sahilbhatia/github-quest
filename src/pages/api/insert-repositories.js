var cron = require("node-cron");
const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const github = require("../utils/githubFunction");
const gitlab = require("../utils/gitlabFunction");
const bitbucket = require("../utils/bitbucketFunction");
const Users = db.users;

export default async function insertPublicRepos(req, res) {
  const insertRepos = async () => {
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
  };

  cron.schedule(process.env.INSERT_PUBLIC_REPOS_SCHEDULE, async () => {
    insertRepos();
  });

  insertRepos();
  res.status(200).json({
    message: "cron Job Activated successfully for inserting repositories",
  });
}
