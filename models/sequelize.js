"use strict";
const Sequelize = require("sequelize");
const fs = require("fs");
const path = require("path");
const modelsDirectory = path.resolve(process.cwd(), "models");
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

fs.readdirSync(modelsDirectory)
  .filter((file) => {
    //console.log(__dirname,file)
    return (
      file.indexOf(".") !== 0 &&
      file !== "sequelize.js" &&
      file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = sequelize["import"](path.join(modelsDirectory, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// db.roles = require("./roles.model")(sequelize, Sequelize);
// db.users = require("./users.model")(sequelize, Sequelize);
// db.repositories = require("./repositories.model")(sequelize, Sequelize);
// db.users_repositories = require("./users_repositories.model")(
//   sequelize,
//   Sequelize
// );
// db.projects = require("./projects.model")(sequelize, Sequelize);
// db.projects_repositories = require("./projects_repositories.model")(
//   sequelize,
//   Sequelize
// );
// db.users_projects = require("./users_projects.model")(sequelize, Sequelize);
// db.commits = require("./commits.model")(sequelize, Sequelize);

module.exports = db;
