"use strict";

exports.up = (db, callback) => {
  db.createTable(
    "repositories",
    {
      id: {
        type: "int",
        notNull: true,
        primaryKey: true,
        autoIncrement: true,
      },
      github_repo_id: {
        type: "bigint",
        notNull: true,
        unique: true,
      },
      name: {
        type: "string",
        length: 50,
        notNull: true,
      },
      url: {
        type: "text",
        notNull: true,
      },
      description: {
        type: "text",
        notNull: false,
      },
      is_forked: {
        type: "boolean",
        defaultValue: false,
        notNull: true,
      },
      is_archived: {
        type: "boolean",
        notNull: true,
        defaultValue: false,
      },
      is_disabled: {
        type: "boolean",
        notNull: true,
        defaultValue: false,
      },
      created_at: {
        type: "timestamp",
      },
      updated_at: {
        type: "timestamp",
      }
    },
    function (err) {
      if (err) return callback(err);
      return callback();
    }
  );
};

exports.down = (db, callback) => {
  db.dropTable("repositories", callback);
};
