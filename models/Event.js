module.exports = (sequelize, DataTypes) => {
  const Events = sequelize.define(
    "events",
    {
      eventId: {  
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
      },
      summary: {  
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false
      },
      timeZone: {
        type: DataTypes.STRING
      },
      startTime: {
           type: DataTypes.DATE
      },
      endTime: {
        type: DataTypes.DATE
      }
    },
  );
  return Events;
};