module.exports = (sequelize, Sequelize) => {
  const Repositories = sequelize.define(
    "repositories",
    {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      github_repo_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      url: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      is_forked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      is_archived: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      is_disabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      parent_repo_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      created_at: {
        type: 'TIMESTAMP',
      },
      updated_at: {
        type: 'TIMESTAMP',
      },
    },
    {
      timestamp: false,
      createdAt: false,
      updatedAt: false,
    }
  );
  Repositories.associate = (models) => {
    Repositories.hasMany(models.users_repositories, {
      foreignKey: "repository_id",
    });
    Repositories.belongsTo(models.parent_Repositories, {
      foreignKey: "parent_repo_id",
    });
  };
  return Repositories;
};
