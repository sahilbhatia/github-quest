"use strict";

exports.up = (db, callback) => {
  db.createTable(
    "forked_repositories",
    {
      id: {
        type: "int",
        notNull: true,
        primaryKey: true,
        autoIncrement: true,
      },
      repo_id: {
        type: "int",
        notNull: true,
        foreignKey: {
          name: "forked_repositories_repositories_join_fk",
          table: "repositories",
          mapping: "id",
          rules: {
            onDelete: "NO ACTION",
          },
        },
      },
      github_parent_repo_id: {
        type: "bigint",
        notNull: true,
      },
      is_private_parent_repo: {
        type: "boolean",
        notNull: true,
      },
    },
    function (err) {
      if (err) return callback(err);
      return callback();
    }
  );
};

exports.down = (db, callback) => {
  db.dropTable("forked_repositories", callback);
};
