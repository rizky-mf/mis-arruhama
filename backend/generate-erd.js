// generate-erd.js
// Script untuk generate ERD dari Sequelize models

const { sequelize } = require('./config/database');
const models = require('./models');

// Import sequelize-erd
const { writeFileSync } = require('fs');
const path = require('path');

// Fungsi untuk generate ERD
async function generateERD() {
  try {
    console.log('🔄 Generating ERD from Sequelize models...');

    // Import sequelize-erd secara dinamis
    const sequelizeErd = require('sequelize-erd');

    // Konfigurasi ERD
    const options = {
      format: 'svg',  // Bisa: svg, png, jpg, pdf, dot
      engine: 'dot',  // Layout engine: dot, circo, neato, osage, twopi
      arrowShapes: {
        'BelongsToMany': 'none',
        'BelongsTo': 'normal',
        'HasMany': 'crow',
        'HasOne': 'none'
      },
      arrowSize: 1.0,
      lineWidth: 1.0,
      color: 'black',
      edgeColor: 'gray',
    };

    // Generate SVG
    const svgPath = path.join(__dirname, '..', 'ERD_Sequelize.svg');
    const svg = await sequelizeErd({
      source: sequelize,
      format: 'svg',
      engine: 'dot'
    });

    writeFileSync(svgPath, svg);
    console.log(`✅ ERD SVG generated: ${svgPath}`);

    // Generate PNG (jika Graphviz terinstall)
    try {
      const pngPath = path.join(__dirname, '..', 'ERD_Sequelize.png');
      const png = await sequelizeErd({
        source: sequelize,
        format: 'png',
        engine: 'dot'
      });

      writeFileSync(pngPath, png);
      console.log(`✅ ERD PNG generated: ${pngPath}`);
    } catch (pngError) {
      console.log('⚠️  PNG generation failed (Graphviz may not be installed)');
      console.log('   SVG file is available as alternative');
    }

    console.log('\n📊 ERD Generation Complete!');
    console.log('\n📝 Models included:');
    Object.keys(models).forEach(modelName => {
      if (modelName !== 'sequelize') {
        console.log(`   - ${modelName}`);
      }
    });

    process.exit(0);

  } catch (error) {
    console.error('❌ Error generating ERD:', error.message);
    console.error('\n💡 Tips:');
    console.error('   1. Make sure sequelize-erd is installed: npm install sequelize-erd');
    console.error('   2. For PNG output, install Graphviz: https://graphviz.org/download/');
    console.error('   3. SVG format works without Graphviz');
    process.exit(1);
  }
}

// Jalankan generator
generateERD();
