const request = require("superagent");
const { headers } = require("../constants/githubHeader");
const { Sentry } = require("./../utils/sentry");
const log4js = require("../config/loggerConfig");
const logger = log4js.getLogger();

//function for get new commit
const getTags = async (repoUrlInfo) => {
  try {
    const tags = await request
      .get(
        `https://api.github.com/repos/${repoUrlInfo.handle}/${repoUrlInfo.repositorieName}/tags`
      )
      .set(headers);
    return tags.body;
  } catch (err) {
    Sentry.captureException(err);
    logger.error("Error executing while get all tags of github repository");
    logger.error(err);
    logger.info("=========================================");
    return false;
  }
};

module.exports = {
  getTags: getTags,
};
