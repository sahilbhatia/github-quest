"use strict";

let dbm;

exports.setup = (
  options
) => {
  dbm = options.dbmigrate;
};
exports.up = (db, callback) => {
  db.createTable(
    "users",
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
      email: {
        type: "string",
        length: 50,
        notNull: true,
      },
      github_handle: {
        type: "string",
        length: 30,
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
  db.dropTable("users", callback);
};
