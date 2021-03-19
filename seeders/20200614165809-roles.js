"use strict";
const db = require("../models/sequelize");
db.sequelize;
const Roles = db.roles;

module.exports = {
  up: async (queryInterface) => {
    const rolesCount = await Roles.count();
    if (rolesCount > 0) {
      return rolesCount;
    } else {
      return queryInterface.bulkInsert("roles", [
        {
          role: "Employee",
        },
        {
          role: "Intern",
        },
        {
          role: "Manager",
        },
        {
          role: "Admin",
        },
        {
          role: "Finance",
        },
        {
          role: "HR",
        },
      ]);
    }
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete("roles", null);
  },
};
