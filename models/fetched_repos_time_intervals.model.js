module.exports = (sequelize, Sequelize) => {
    const Fetched_Repos_time_intervals = sequelize.define(
        "fetched_Repos_time_intervals",
        {
          id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
          },
          last_time_fetched_at: {
            type: 'TIMESTAMP',
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          }
        },
      {
        timestamp: false,
        createdAt: false,
        updatedAt: false,
      }
    );
    return Fetched_Repos_time_intervals;
  };
  