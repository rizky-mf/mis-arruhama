// migrations/add-warna-to-mata-pelajaran.js
const db = require('../models');

async function addWarnaColumn() {
  try {
    console.log('Adding warna column to mata_pelajaran table...');

    await db.sequelize.query(`
      ALTER TABLE mata_pelajaran
      ADD COLUMN IF NOT EXISTS warna VARCHAR(7) DEFAULT '#3B82F6' COMMENT 'Hex color code for schedule display'
    `);

    // Update existing mata pelajaran with default colors
    const colors = [
      '#EF4444', // red
      '#F59E0B', // amber
      '#10B981', // green
      '#3B82F6', // blue
      '#8B5CF6', // violet
      '#EC4899', // pink
      '#06B6D4', // cyan
      '#84CC16', // lime
      '#F97316', // orange
      '#6366F1'  // indigo
    ];

    const mataPelajaran = await db.MataPelajaran.findAll();

    for (let i = 0; i < mataPelajaran.length; i++) {
      const mapel = mataPelajaran[i];
      const colorIndex = i % colors.length;
      await mapel.update({ warna: colors[colorIndex] });
    }

    console.log('✓ Successfully added warna column and updated existing data');
    process.exit(0);
  } catch (error) {
    console.error('Error adding warna column:', error);
    process.exit(1);
  }
}

addWarnaColumn();
