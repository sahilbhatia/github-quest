module.exports = (sequelize, Sequelize) => {
  const Users = sequelize.define(
    "users",
    {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      github_handle: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      gitlab_handle: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      bitbucket_handle: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      error_details: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      org_user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "roles",
          key: "id",
        },
      },
      last_fetched_at: {
        type: "TIMESTAMP",
      },
      created_at: {
        type: "TIMESTAMP",
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: "TIMESTAMP",
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      timestamp: false,
      createdAt: false,
      updatedAt: false,
    }
  );
  Users.associate = (models) => {
    Users.hasMany(models.projects, {
      foreignKey: { name: "project_manager", allowNull: true },
    });
    Users.hasMany(models.users_projects, {
      foreignKey: { name: "user_id", allowNull: true },
    });
    Users.hasMany(models.users_repositories, {
      foreignKey: { name: "user_id", allowNull: true },
    });
  };
  return Users;
};
