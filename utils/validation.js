const request = require("superagent");
const { Sentry } = require("./sentry");
const { headers } = require("../constants/githubHeader");

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
      return {
        status: 403,
        message: "Rate Limit Exceeded Of GitLab Access Token",
      };
    }
  } else {
    return {
      status: 403,
      message: "Rate Limit Exceeded Of GitHub Access Token",
    };
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
        return { status: 401, message: "Invalid BitBucket Access Token" };
      }
    } else {
      return { status: 401, message: "Invalid GiLab Access Token" };
    }
  } else {
    return { status: 401, message: "Invalid GitHub Access Token" };
  }
};
