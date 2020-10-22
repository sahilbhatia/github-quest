module.exports = (sequelize, Sequelize) => {
  const Projects = sequelize.define(
    "projects",
    {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      org_project_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(70),
        allowNull: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      project_manager: {
        type: Sequelize.INTEGER,
        defaultValue: null,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
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
  Projects.associate = (models) => {
    Projects.hasMany(models.projects_repositories, {
      foreignKey: { name: "project_id", allowNull: true },
    });
    Projects.belongsTo(models.users, {
      foreignKey: { name: "project_manager", allowNull: true },
    });
    Projects.hasMany(models.users_projects, {
      foreignKey: { name: "project_id", allowNull: true },
    });
  };
  return Projects;
};
