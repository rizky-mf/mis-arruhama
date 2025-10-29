// seeders/reset-admin.js
const bcrypt = require('bcryptjs');
const db = require('../models');

/**
 * Script untuk RESET admin user
 * Hapus admin lama dan buat baru dengan password ter-hash
 * Run: node seeders/reset-admin.js
 */

const resetAdmin = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Database connected');

    // Hapus admin lama (jika ada)
    const deleted = await db.User.destroy({
      where: { username: 'admin' }
    });

    if (deleted > 0) {
      console.log('🗑️  Old admin user deleted');
    }

    // Hash password dengan bcrypt
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    console.log('Generated hash:', hashedPassword);

    // Create admin user baru
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
    console.log('🧪 Test dengan Postman:');
    console.log('   POST http://localhost:5000/api/auth/login');
    console.log('   Body: { "username": "admin", "password": "admin123" }');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting admin:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

resetAdmin();