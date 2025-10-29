// config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Konfigurasi koneksi database
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false, // set true untuk melihat query SQL
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    timezone: '+07:00', // Timezone Jakarta
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true // Nama tabel tidak otomatis plural
    }
  }
);

// Test koneksi database
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to database:', error.message);
    return false;
  }

};

module.exports = { sequelize, testConnection };