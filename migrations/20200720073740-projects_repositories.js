"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      "projects_repositories",
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        repository_url: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        host: {
          type: Sequelize.STRING(70),
          allowNull: true,
        },
        project_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "projects",
            key: "id",
          },
        },
        created_at: {
          type: "TIMESTAMP",
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updated_at: {
          type: "TIMESTAMP",
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
      },
      {
        timestamp: false,
        createdAt: false,
        updatedAt: false,
      }
    );
  },
  down: (queryInterface) => {
    return queryInterface.dropTable("projects_repositories");
  },
};
