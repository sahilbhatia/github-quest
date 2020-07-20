"use strict";

let dbm;

exports.setup = (
  options
) => {
  dbm = options.dbmigrate;
};
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
      name: {
        type: "string",
        length: 50,
        notNull: true,
      },
      description: {
        type: "text",
        notNull: true,
      },
      is_forked: {
        type: "boolean",
        notNull: true,
      },
      is_forked: {
        type: "boolean",
        notNull: true,
      },
      is_archived: {
        type: "boolean",
        notNull: true,
      },
      is_disabled: {
        type: "boolean",
        notNull: true,
      },
      parent_id: {
        type: "int",
        notNull: false,
        foreignKey: {
          name: "repositories_self_join_fk",
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
  db.dropTable("repositories", callback);
};