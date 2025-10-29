// seeders/seed-admin.js
const bcrypt = require('bcryptjs');
const db = require('../models');

/**
 * Script untuk create admin user pertama kali
 * Run: node seeders/seed-admin.js
 */

const createAdmin = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Database connected');

    // Cek apakah admin sudah ada
    const existingAdmin = await db.User.findOne({
      where: { username: 'admin' }
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      console.log('   Username: admin');
      console.log('   You can use this account to login');
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin user
    const admin = await db.User.create({
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      is_active: true
    });

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('='.repeat(50));
    console.log('📝 Login Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('='.repeat(50));
    console.log('');
    console.log('⚠️  IMPORTANT: Change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();