const request = require("superagent");
const { Sentry } = require("./../utils/sentry");
const log4js = require("../config/loggerConfig");
const logger = log4js.getLogger();

//function for get all tags of single repository
const getTags = async (repoInfo) => {
  try {
    let isIncompleteTags = true;
    let count = 5;
    let allTags = [];
    let url = `https://api.bitbucket.org/2.0/repositories/${repoInfo.handle}/${repoInfo.repositorieName}/refs/tags?access_token=${process.env.BITBUCKET_ACCESS_TOKEN}&pagelen=5`;
    while (isIncompleteTags) {
      let ProjectTags = await request.get(url);
      if (ProjectTags.body) {
        allTags = allTags.concat(ProjectTags.body.values);
        if (count < ProjectTags.body.next) {
          url = ProjectTags.body.next;
          count = count + 5;
        } else {
          break;
        }
      }
    }
    if (allTags.length > 0) {
      return allTags;
    } else {
      return false;
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while get tags of  bitbucket repository in repository"
    );
    logger.error(err);
    logger.info("=========================================");
    return null;
  }
};

// function for get project details from bitbucket
const getRepositoryFromBitbucket = async (project) => {
  try {
    const projectRepo = await request.get(
      `https://api.bitbucket.org/2.0/repositories/${project.handle}/${project.repositorieName}?access_token=${process.env.BITBUCKET_ACCESS_TOKEN}`
    );
    if (projectRepo.body) {
      return projectRepo.body;
    } else {
      return false;
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while fetching projects in get repositories from bitbucket function"
    );
    logger.error(err);
    logger.info("=========================================");
    return false;
  }
};

module.exports = {
  getTags: getTags,
  getRepositoryFromBitbucket: getRepositoryFromBitbucket,
};
