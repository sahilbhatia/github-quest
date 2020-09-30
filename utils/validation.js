const request = require("superagent");
const { headers } = require("../constants/githubHeader");

//function for validate github access token
const gitHubValidation = async () => {
  try {
    const res = await request.get(`https://api.github.com`).set(headers);
    if (res.status == 200) {
      return true;
    } else {
      return false;
    }
  } catch {
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
module.exports.validateToken = async () => {
  const githubValidate = await gitHubValidation();
  if (githubValidate) {
    const gitlabValidate = await gitLabValidation();
    if (gitlabValidate) {
      const bitbucketValidate = await bitbucketValidation();
      if (bitbucketValidate) {
        return false;
      } else {
        return "Invalid BitBucket Access Token";
      }
    } else {
      return "Invalid GiLab Access Token";
    }
  } else {
    return "Invalid GitHub Access Token";
  }
};
