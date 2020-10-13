const log4js = require("log4js");

module.exports = log4js.configure({
  appenders: {
    fileAppender: {
      type: process.env.TYPE_OF_LOGGER_FILE,
      pattern: process.env.LOGGER_ROLLING_TYPE,
      filename: process.env.LOGGER_FILE_STORAGE_PATH,
      daysToKeep: parseInt(process.env.BACKUP_FILES_FOR_LOGGER),
    },
  },
  categories: {
    default: {
      appenders: ["fileAppender"],
      level: ["ALL"],
    },
  },
});
