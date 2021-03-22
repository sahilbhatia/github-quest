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
        repository_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "repositories",
            key: "id",
          },
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
