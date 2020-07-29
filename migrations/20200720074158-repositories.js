"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      "repositories",
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        github_repo_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          unique: true,
        },
        name: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        url: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        is_forked: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false,
        },
        is_archived: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false,
        },
        is_disabled: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false,
        },
        is_suspicious: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false,
        },
        manual_review: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
          allowNull: false,
        },
        review: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        reviewed_at: {
          type: 'TIMESTAMP',
          allowNull: true,
        },
        reviewed_by:{
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        is_private: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false,
        },
        parent_repo_id: {
          type: Sequelize.INTEGER,
          references: {
            model: "repositories",
            key: "id",
          },
        },
        created_at: {
          type: 'TIMESTAMP',
        },
        updated_at: {
          type: 'TIMESTAMP',
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
    return queryInterface.dropTable("repositories");
  },
};
