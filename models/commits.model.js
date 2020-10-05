module.exports = (sequelize, Sequelize) => {
  const Commits = sequelize.define(
    "commits",
    {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      commit_id: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      commit: {
        type: Sequelize.TEXT,
        allowNull: false,
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
  return Commits;
};
