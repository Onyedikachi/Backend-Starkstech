module.exports = {
    use_env_variable: process.env.DATABASE_URL_DEV,
    dbName : process.env.DATABASE_NAME,
    dbPass: process.env.DATABASE_PASS,
    dbHost: process.env.DATABASE_HOST,
    dbUser: process.env.DATABASE_USER,
    dbPort: process.env.DATABASE_PORT,
    dialect: 'mysql',
    logging: true,
    dialectOptions: {
      ssl: true
    }
};