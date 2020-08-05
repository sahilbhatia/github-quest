"use strict";

module.exports = {
  up: async (queryInterface) => {
    const rolesCount = await queryInterface.sequelize.query(
      "SELECT count(*) from roles;"
    );
    if (rolesCount[0][0].count > 0) {
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
