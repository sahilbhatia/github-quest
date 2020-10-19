"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("repositories", "comment", {
        type: Sequelize.STRING(50),
        allowNull: true,
      }),
    ]);
  },

  down: (queryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("repositories", "comment"),
    ]);
  },
};
