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
        name: {
          type: Sequelize.STRING(70),
          allowNull: false,
        },
        repository_url: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        host: {
          type: Sequelize.STRING(70),
          allowNull: false,
        },
        created_at: {
          type: 'TIMESTAMP',
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: 'TIMESTAMP',
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
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