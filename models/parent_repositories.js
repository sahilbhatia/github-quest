module.exports = (sequelize, Sequelize) => {
  const Parent_Repositories = sequelize.define(
    "parent_repositories",
    {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      github_repo_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      url: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      is_private: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      }
    },
    {
      timestamp: false,
      createdAt: false,
      updatedAt: false,
    }
  );
  Parent_Repositories.associate = (models) => {
    Parent_Repositories.hasMany(models.repositories, {
      foreignKey: "parent_repo_id",
    });
  };
  return Parent_Repositories;
};
