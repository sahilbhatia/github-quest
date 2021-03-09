const { Sentry } = require("./sentry");
const log4js = require("../config/loggerConfig");
const logger = log4js.getLogger();

const FileIsExistInConstantConfigList = (file, FileConstants) => {
  try {
    let fileStatus = false;
    let projectType = [];
    FileConstants.forEach((ele) => {
      if (file.name.toLowerCase().includes(ele.dataValues.name)) {
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

module.exports = {
  FileIsExistInConstantConfigList: FileIsExistInConstantConfigList,
};
