"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("users", "gitlab_handle", {
        type: Sequelize.STRING(50),
        allowNull: true,
      }),
      queryInterface.addColumn("users", "bitbucket_handle", {
        type: Sequelize.STRING(50),
        allowNull: true,
      }),
      queryInterface.addColumn("repositories", "source_type", {
        type: Sequelize.ENUM,
        values: ["github", "gitlab", "bitbucket"],
        allowNull: true,
      }),
      queryInterface.renameColumn(
        "repositories",
        "github_repo_id",
        "source_repo_id"
      ),
    ]);
  },

  down: (queryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("users", "gitlab_handle"),
      queryInterface.removeColumn("users", "bitbucket_handle"),
      queryInterface.removeColumn("repositories", "source_type"),
      queryInterface.renameColumn(
        "repositories",
        "source_repo_id",
        "github_repo_id"
      ),
    ]);
  },
};
