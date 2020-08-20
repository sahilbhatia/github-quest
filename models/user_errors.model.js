
module.exports = (sequelize, Sequelize) => {
    const errors = sequelize.define(
        "user_errors",
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "users",
            key: "id",
          },
        },
        error: {
            type: Sequelize.TEXT,
            allowNull: true,
          },
      },
      {
        timestamp: false,
        createdAt: false,
        updatedAt: false,
      }
    );
  return errors;
};
