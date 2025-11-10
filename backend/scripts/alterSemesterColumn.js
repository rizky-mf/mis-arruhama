const { sequelize } = require('../config/database');

async function alterSemesterColumn() {
  try {
    console.log('Altering semester column in rapor table...');

    // Alter the ENUM column to include 'Ganjil' and 'Genap'
    await sequelize.query(`
      ALTER TABLE \`rapor\`
      MODIFY COLUMN \`semester\` ENUM('1', '2', 'Ganjil', 'Genap') NOT NULL;
    `);

    console.log('✅ Semester column altered successfully!');
    console.log('   Accepted values: 1, 2, Ganjil, Genap');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error altering semester column:', error);
    process.exit(1);
  }
}

alterSemesterColumn();
