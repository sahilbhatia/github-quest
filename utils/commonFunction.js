const { Sentry } = require("./sentry");
const log4js = require("../config/loggerConfig");
const logger = log4js.getLogger();

//chech a file name is exist in file constants list
const FileIsExistInConstantConfigList = (file, FileConstants) => {
  try {
    let fileStatus = false;
    let projectType = [];
    FileConstants.forEach((ele) => {
      if (file.name && file.name.toLowerCase().includes(ele.dataValues.name)) {
        fileStatus = file;
        projectType.push(ele.dataValues.tech_type);
      }
    });
    if (fileStatus) {
      return {
        projectType: projectType,
      };
    } else {
      return false;
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while checking the file name is exist in data base"
    );
    logger.error(err);
    logger.info("=========================================");
    return null;
  }
};

//function for get project info by project repo url
const getInfoByProjectUrl = (url) => {
  let project = {};
  const splitArray = url.split("/");
  if (splitArray.length > 4) {
    let sourceType = splitArray[2].split(".")[0];
    if (
      sourceType.localeCompare("github") == 0 ||
      sourceType.localeCompare("bitbucket") == 0 ||
      sourceType.localeCompare("gitlab") == 0
    ) {
      project.sourceType = sourceType;
      project.handle = splitArray[3];
      project.repositorieName = splitArray[4];
      project.url = url;
      return project;
    } else {
      return false;
    }
  } else {
    return false;
  }
};
module.exports = {
  FileIsExistInConstantConfigList: FileIsExistInConstantConfigList,
  getInfoByProjectUrl: getInfoByProjectUrl,
};
