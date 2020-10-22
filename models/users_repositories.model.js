module.exports = (sequelize, Sequelize) => {
  const Users_Repositories = sequelize.define(
    "users_repositories",
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
      repository_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "repositories",
          key: "id",
        },
      },
    },
    {
      timestamp: false,
      createdAt: false,
      updatedAt: false,
    }
  );
  Users_Repositories.associate = (models) => {
    Users_Repositories.belongsTo(models.repositories, {
      foreignKey: { name: "repository_id", allowNull: true },
    });
    Users_Repositories.belongsTo(models.users, {
      foreignKey: { name: "user_id", allowNull: true },
    });
  };
  return Users_Repositories;
};
