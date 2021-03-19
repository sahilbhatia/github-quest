"use strict";
const fileList = require("../constants/fileStructure");
const db = require("../models/sequelize");
db.sequelize;
const FileConstants = db.file_constants;

module.exports = {
  up: async (queryInterface) => {
    const filesCount = await FileConstants.count();
    if (filesCount > 0) {
      return filesCount;
    } else {
      return queryInterface.bulkInsert(
        "file_constants",
        fileList.constantFileList
      );
    }
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete("file_constants", null);
  },
};
