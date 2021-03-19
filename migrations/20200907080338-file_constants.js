"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      "file_constants",
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: Sequelize.STRING(25),
          allowNull: false,
        },
        type: {
          type: Sequelize.STRING(25),
          allowNull: false,
        },
        content_type: {
          type: Sequelize.STRING(25),
          allowNull: false,
        },
        path: {
          type: Sequelize.STRING(25),
          allowNull: true,
        },
        tech_type: {
          type: Sequelize.STRING(25),
          allowNull: false,
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
    return queryInterface.dropTable("file_constants");
  },
};
