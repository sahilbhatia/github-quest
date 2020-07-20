"use strict";

exports.up = (db, callback) => {
  db.createTable(
    "users_repositories",
    {
      id: {
        type: "int",
        notNull: true,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: "int",
        notNull: true,
        foreignKey: {
          name: "users_repositories_users_join_fk",
          table: "users",
          mapping: "id",
          rules: {
            onDelete: "NO ACTION",
          },
        },
      },
      repository_id: {
        type: "int",
        notNull: true,
        foreignKey: {
          name: "users_repositories_repositories_join_fk",
          table: "repositories",
          mapping: "id",
          rules: {
            onDelete: "NO ACTION",
          },
        },
      }
    },
    function (err) {
      if (err) return callback(err);
      return callback();
    }
  );
};

exports.down = (db, callback) => {
  db.dropTable("users_repositories", callback);
};
