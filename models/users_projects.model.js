module.exports = (sequelize, Sequelize) => {
  const Users_Projects = sequelize.define(
    "users_projects",
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
      project_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "projects",
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
  Users_Projects.associate = (models) => {
    Users_Projects.belongsTo(models.projects, {
      foreignKey: { name: "project_id", allowNull: true },
    });
    Users_Projects.belongsTo(models.users, {
      foreignKey: { name: "user_id", allowNull: true },
    });
  };
  return Users_Projects;
};
