const request = require("superagent");
const { Sentry } = require("./sentry");
const log4js = require("../config/loggerConfig");
const logger = log4js.getLogger();
const { headers } = require("../constants/githubHeader");
const {
  INVALID_BITBUCKET_ACCESS_TOKEN,
  INVALID_GITLAB_ACCESS_TOKEN,
  INVALID_GITHUB_ACCESS_TOKEN,
  RATE_LIMIT_EXCEEDED_GITLAB_TOKEN,
  RATE_LIMIT_EXCEEDED_GITHUB_TOKEN,
} = require("../../../constants/responseConstants");

//function for validate github access token
const gitHubValidation = async () => {
  try {
    const res = await request.get(`https://api.github.com`).set(headers);
    if (res.status == 200) {
      return res;
    } else {
      return false;
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error("Error executing in github token validation function");
    logger.error(err);
    logger.info("=========================================");
    return false;
  }
};

//function for validate gitlab access token
const gitLabValidation = async () => {
  try {
    const res = await request
      .get(`https://gitlab.com/api/v4/projects`)
      .set({ "PRIVATE-TOKEN": process.env.GITLAB_ACCESS_TOKEN });
    if (res.status == 200) {
      return res;
    } else {
      return false;
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error("Error executing in gitlab token validation function");
    logger.error(err);
    logger.info("=========================================");
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
      return res;
    } else {
      return false;
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error("Error executing in bitbucket token validation function");
    logger.error(err);
    logger.info("=========================================");
    return false;
  }
};

//function for check rate limit exceeded
const isRateLimitExceed = (githubValidate, gitlabValidate) => {
  if (
    githubValidate.header["x-ratelimit-limit"] -
      githubValidate.header["x-ratelimit-used"] >=
    100
  ) {
    if (
      gitlabValidate.header["ratelimit-limit"] -
        gitlabValidate.header["ratelimit-observed"] >=
      100
    ) {
      delete process.env.RETRY;
      return false;
    } else {
      return RATE_LIMIT_EXCEEDED_GITLAB_TOKEN;
    }
  } else {
    return RATE_LIMIT_EXCEEDED_GITHUB_TOKEN;
  }
};

//function for validate Token
module.exports.validateToken = async () => {
  const githubValidate = await gitHubValidation();
  if (githubValidate) {
    const gitlabValidate = await gitLabValidation();
    if (gitlabValidate) {
      const bitbucketValidate = await bitbucketValidation();
      if (bitbucketValidate) {
        return isRateLimitExceed(githubValidate, gitlabValidate);
      } else {
        return INVALID_BITBUCKET_ACCESS_TOKEN;
      }
    } else {
      return INVALID_GITLAB_ACCESS_TOKEN;
    }
  } else {
    return INVALID_GITHUB_ACCESS_TOKEN;
  }
};
