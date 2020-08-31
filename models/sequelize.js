"use strict";
const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.js")[env];
const db = {};
let sequelize;

if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.roles = require("./roles.model")(sequelize, Sequelize);
db.users = require("./users.model")(sequelize, Sequelize);
db.repositories = require("./repositories.model")(sequelize, Sequelize);
db.users_repositories = require("./users_repositories.model")(
  sequelize,
  Sequelize
);
db.projects = require("./projects.model")(sequelize, Sequelize);
db.projects_repositories = require("./projects_repositories.model")(
  sequelize,
  Sequelize
);
db.users_projects = require("./users_projects.model")(sequelize, Sequelize);

module.exports = db;
