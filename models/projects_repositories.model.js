module.exports = (sequelize, Sequelize) => {
  const ProjectRepositories = sequelize.define(
    "projects_repositories",
    {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      repository_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      host: {
        type: Sequelize.STRING(70),
        allowNull: true,
      },
      project_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "projects",
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
  ProjectRepositories.associate = (models) => {
    ProjectRepositories.belongsTo(models.projects, {
      foreignKey: { name: "project_id", allowNull: true },
    });
  };
  return ProjectRepositories;
};
