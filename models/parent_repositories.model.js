//const repositories = require("./repositories.model");

module.exports = (sequelize, Sequelize) => {
  const Parent_Repositories = sequelize.define(
    "parent_repositories",
    {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      github_repo_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      url: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      is_private: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      }
    },
    {
      timestamp: false,
      createdAt: false,
      updatedAt: false,
    }
  );
  return Parent_Repositories;
};
