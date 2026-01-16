require("dotenv").config();

const config = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
  dbPath: process.env.DB_PATH || "./data/tasks.db",
};

module.exports = config;
