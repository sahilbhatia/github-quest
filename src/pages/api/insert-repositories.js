var cron = require("node-cron");
const request = require("superagent");
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

//function for validate github access token
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

//function for validate gitlab access token
const gitLabValidation = async () => {
  try {
    const res = await request
      .get(`https://gitlab.com/api/v4/projects`)
      .set({ "PRIVATE-TOKEN": process.env.GITLAB_ACCESS_TOKEN });
    if (res.status == 200) {
      return true;
    } else {
      return false;
    }
  } catch {
    return false;
  }
};

//function for validate bitbucket access token
const bitbucketValidation = async () => {
  try {
    const res = await request.get(
      `https://api.bitbucket.org/2.0/repositories?access_token=${process.env.BITBUCKET_ACCESS_TOKEN}`
    );
    if (res.status == 200) {
      return true;
    } else {
      return false;
    }
  } catch {
    return false;
  }
};

//function for validate Token
const validateToken = async (req, res) => {
  const githubValidate = await gitHubValidation();
  if (githubValidate) {
    const gitlabValidate = await gitLabValidation();
    if (gitlabValidate) {
      const bitbucketValidate = await bitbucketValidation();
      if (bitbucketValidate) {
        return null;
      } else {
        res.status(401).json({
          error: "Unauthorized User",
          message: "Invalid BitBucket Access Token",
        });
      }
    } else {
      res.status(401).json({
        error: "Unauthorized User",
        message: "Invalid GiLab Access Token",
      });
    }
  } else {
    res.status(401).json({
      error: "Unauthorized User",
      message: "Invalid GiHub Access Token",
    });
  }
};

const insertPublicRepos = async (req, res) => {
  const insertRepos = async () => {
    await validateToken(req, res);
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
  };

  cron.schedule(process.env.INSERT_PUBLIC_REPOS_SCHEDULE, async () => {
    insertRepos();
  });
  insertRepos();
};

export default insertPublicRepos;
