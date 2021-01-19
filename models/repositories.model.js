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
      source_repo_id: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      source_type: {
        type: Sequelize.ENUM,
        values: ["github", "gitlab", "bitbucket"],
        allowNull: true,
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      url: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
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
      is_suspicious: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      manual_review: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      review: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      reviewed_at: {
        type: "TIMESTAMP",
        allowNull: true,
      },
      reviewed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      is_private: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      parent_repo_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "repositories",
          key: "id",
        },
      },
      error_details: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: "TIMESTAMP",
      },
      updated_at: {
        type: "TIMESTAMP",
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
      foreignKey: { name: "repository_id", allowNull: true },
    });
    Repositories.hasMany(models.projects_repositories, {
      foreignKey: { name: "repository_id", allowNull: true },
    });
    Repositories.belongsTo(models.repositories, {
      foreignKey: "parent_repo_id",
      as: "parent",
    });
    Repositories.hasMany(models.repositories, {
      foreignKey: "parent_repo_id",
      as: "children",
    });
    Repositories.hasMany(models.commits, {
      foreignKey: { name: "repository_id", allowNull: true },
    });
  };
  return Repositories;
};
