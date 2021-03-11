"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      "branches",
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        head_commit_id: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        repository_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "repositories",
            key: "id",
          },
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
    return queryInterface.dropTable("branches");
  },
};
