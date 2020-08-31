"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      "projects",
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        org_project_id: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING(70),
          allowNull: false,
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false,
        },
        project_manager: {
          type: Sequelize.INTEGER,
          defaultValue: null,
          allowNull: true,
          references: {
            model: "users",
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
    return queryInterface.dropTable("projects");
  },
};
