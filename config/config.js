module.exports = {
  development: {
    username: "root",
    password: "root",
    database: "questgithub",
    host: "127.0.0.1",
    dialect: "postgres",
    logging: true,
  },
  test: {
    username: process.env.DB_USER_NAME,
    password: process.env.TEST_DB_PASSWORD,
    database: process.env.TEST_DB_NAME,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false,
  },
  production: {
    username: process.env.DB_USER_NAME,
    password: process.env.PRODUCTION_DB_PASSWORD,
    database: process.env.PRODUCTION_DB_NAME,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false,
  },
};
