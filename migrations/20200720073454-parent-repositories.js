"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
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
  },
  down: (queryInterface) => {
    return queryInterface.dropTable("parent_repositories");
  },
};
