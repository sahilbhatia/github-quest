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
        type: Sequelize.STRING(50),
        allowNull: true,
      }),
      queryInterface.removeColumn("repositories", "github_repo_id"),
      queryInterface.addColumn("repositories", "source_repo_id", {
        type: Sequelize.STRING(50),
        default: "default",
        allowNull: false,
        unique: true,
      }),
      queryInterface.sequelize.query(
        `ALTER TABLE repositories ALTER COLUMN source_repo_id DROP DEFAULT;`
      ),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("users", "gitlab_handle"),
      queryInterface.removeColumn("users", "bitbucket_handle"),
      queryInterface.removeColumn("repositories", "source_type"),
      queryInterface.addColumn("repositories", "github_repo_id", {
        type: Sequelize.BIGINT,
        allowNull: true,
        default: 123,
        unique: true,
      }),
      queryInterface.removeColumn("repositories", "source_repo_id"),
      queryInterface.sequelize.query(
        `ALTER TABLE repositories ALTER COLUMN github_repo_id DROP DEFAULT;`
      ),
    ]);
  },
};
