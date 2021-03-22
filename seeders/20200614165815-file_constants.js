"use strict";

module.exports = {
  up: async (queryInterface) => {
    const rolesCount = await queryInterface.sequelize.query(
      "SELECT count(*) from file_constants;"
    );
    if (rolesCount[0][0].count > 0) {
      return rolesCount;
    } else {
      return queryInterface.bulkInsert("file_constants", [
        {
          name: "utils",
          content_type: "business",
          tech_type: "node",
          type: "dir",
        },
        {
          name: "service",
          content_type: "business",
          tech_type: "node",
          type: "dir",
        },
        {
          name: "routers",
          content_type: "business",
          tech_type: "node",
          type: "dir",
        },
        {
          name: "router",
          content_type: "business",
          tech_type: "node",
          type: "dir",
        },
        {
          name: "server.js",
          content_type: "business",
          tech_type: "node",
          type: "file",
        },
        {
          name: "migrations",
          content_type: "configuration",
          tech_type: "node",
          type: "dir",
        },
        {
          name: "src",
          content_type: "business",
          tech_type: "react",
          type: "dir",
        },
        {
          name: "components",
          content_type: "business",
          tech_type: "react",
          type: "dir",
        },
        {
          name: "actions",
          content_type: "business",
          tech_type: "react",
          type: "dir",
        },
        {
          name: "reducers",
          content_type: "business",
          tech_type: "react",
          type: "dir",
        },
        {
          name: "db",
          content_type: "configuration",
          tech_type: "rails",
          type: "dir",
        },
        {
          name: "Rakefile",
          content_type: "configuration",
          tech_type: "rails",
          type: "file",
        },
        {
          name: "Gemfile",
          content_type: "configuration",
          tech_type: "rails",
          type: "file",
        },
        {
          name: "config.ru",
          content_type: "configuration",
          tech_type: "rails",
          type: "file",
        },
        {
          name: "seeds.rb",
          content_type: "configuration",
          tech_type: "rails",
          type: "file",
        },
        {
          name: "schema.rb",
          content_type: "configuration",
          tech_type: "rails",
          type: "file",
        },
        {
          name: "environments",
          content_type: "configuration",
          tech_type: "rails",
          type: "dir",
        },
        {
          name: "development.rb",
          content_type: "configuration",
          tech_type: "rails",
          type: "file",
        },
        {
          name: "production.rb",
          content_type: "configuration",
          tech_type: "rails",
          type: "file",
        },
        {
          name: "test.rb",
          content_type: "business",
          tech_type: "rails",
          type: "file",
        },
        {
          name: "controllers",
          content_type: "business",
          tech_type: "rails",
          type: "dir",
        },
        {
          name: "models",
          content_type: "business",
          tech_type: "rails",
          type: "dir",
        },
        {
          name: "helpers",
          content_type: "business",
          tech_type: "rails",
          type: "dir",
        },
        {
          name: "view",
          content_type: "business",
          tech_type: "rails",
          type: "dir",
        },
        {
          name: "README.md",
          content_type: "configuration",
          tech_type: "common",
          type: "file",
        },
        {
          name: ".gitignore",
          content_type: "configuration",
          tech_type: "common",
          type: "file",
        },
        {
          name: "package.json",
          content_type: "configuration",
          tech_type: "common",
          type: "file",
        },
        {
          name: "index.js",
          content_type: "configuration",
          tech_type: "common",
          type: "file",
        },
        {
          name: ".env",
          content_type: "configuration",
          tech_type: "common",
          type: "file",
        },
        {
          name: "constant",
          content_type: "configuration",
          tech_type: "common",
          type: "dir",
        },
        {
          name: "config",
          content_type: "configuration",
          tech_type: "common",
          type: "dir",
        },
        {
          name: "config.js",
          content_type: "configuration",
          tech_type: "common",
          type: "file",
        },
      ]);
    }
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete("file_constants", null);
  },
};
