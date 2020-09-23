const {
  validateGitHubToken,
  ValidationError,
} = require("validate-github-token");
module.exports.gitHubValidation = async () => {
  try {
    await validateGitHubToken(process.env.GITHUB_ACCESS_TOKEN);
    return true;
  } catch (err) {
    if (err instanceof ValidationError) {
      return false;
    } else {
      {
        return true;
      }
    }
  }
};
