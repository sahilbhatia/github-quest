module.exports = (sequelize, Sequelize) => {
  const FileConstants = sequelize.define(
    "file_constants",
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
      type: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      content_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      path: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      tech_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
    },
    {
      timestamp: false,
      createdAt: false,
      updatedAt: false,
    }
  );
  return FileConstants;
};
