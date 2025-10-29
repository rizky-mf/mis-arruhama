const db = require('./models');

const testModels = async () => {
  try {
    // Test koneksi
    await db.sequelize.authenticate();
    console.log('✅ Database connected');

    // List semua models
    console.log('\n📦 Available Models:');
    Object.keys(db).forEach(modelName => {
      if (modelName !== 'sequelize' && modelName !== 'Sequelize') {
        console.log(`   - ${modelName}`);
      }
    });

    // Test query simple
    const userCount = await db.User.count();
    console.log(`\n👤 Total users: ${userCount}`);

    console.log('\n✅ Models loaded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

testModels();