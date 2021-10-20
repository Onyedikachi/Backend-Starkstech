const Sequelize = require("sequelize");
const {dbName,
    dbPass,
    dbHost,
    dbUser,
    dbPort,
    dialect,
    logging,
   } = require("./config.js");

const sequelize = new Sequelize(dbName, dbUser, dbPass, {
  host: dbHost,
  dialect: dialect,
  operatorsAliases: 0,
  logging: logging,
  port: dbPort,
  pool: {
    max: 300,
    min: 10,
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

//  Models/tables
//db.Appointments =require("./models/Appointments")(sequelize, Sequelize);

module.exports = db;