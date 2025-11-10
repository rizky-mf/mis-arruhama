// Run migration script to add plain_password column
const db = require('./models');

async function runMigration() {
  try {
    console.log('Running migration: Add plain_password to users table...');

    // Check if column exists
    const [results] = await db.sequelize.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'plain_password'
    `);

    if (results.length > 0) {
      console.log('Column plain_password already exists. Skipping migration.');
      process.exit(0);
    }

    // Add column
    await db.sequelize.query(`
      ALTER TABLE users
      ADD COLUMN plain_password VARCHAR(255) NULL
      COMMENT 'Plain text password for admin reference (siswa only)'
    `);

    console.log('✅ Migration completed successfully!');
    console.log('Column plain_password has been added to users table.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
