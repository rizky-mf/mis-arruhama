// test-db.js
require('dotenv').config();

console.log('Environment Variables:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD === '' ? '(empty)' : process.env.DB_PASSWORD);

const { sequelize } = require('./config/database');

sequelize.authenticate()
  .then(() => {
    console.log('\n✅ Database connection successful!');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Database connection failed:', err.message);
    process.exit(1);
  });