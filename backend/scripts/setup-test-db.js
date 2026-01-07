// scripts/setup-test-db.js
// Script untuk setup database testing

const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.test' });

async function setupTestDatabase() {
  console.log('🚀 Setting up test database...\n');

  let connection;

  try {
    // Connect to MySQL without selecting database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });

    console.log('✓ Connected to MySQL');

    // Drop test database if exists
    const dbName = process.env.DB_NAME || 'mis_arruhama_test';
    await connection.query(`DROP DATABASE IF EXISTS ${dbName}`);
    console.log(`✓ Dropped existing database: ${dbName}`);

    // Create test database
    await connection.query(`CREATE DATABASE ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✓ Created database: ${dbName}`);

    await connection.end();

    // Run migrations
    console.log('\n📦 Running migrations...');
    const db = require('../models');
    await db.sequelize.sync({ force: true });
    console.log('✓ Migrations completed');

    // Run seeders
    console.log('\n🌱 Running seeders...');
    await seedTestData(db);
    console.log('✓ Seeders completed');

    console.log('\n✅ Test database setup completed successfully!\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error setting up test database:', error);
    process.exit(1);
  }
}

async function seedTestData(db) {
  const bcrypt = require('bcryptjs');

  try {
    // Create test users
    const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);
    const hashedPasswordGuru = await bcrypt.hash('guru123', 10);
    const hashedPasswordSiswa = await bcrypt.hash('siswa123', 10);

    // Admin user
    const adminUser = await db.User.create({
      username: 'admin',
      password: hashedPasswordAdmin,
      email: 'admin@test.com',
      role: 'admin'
    });
    console.log('  ✓ Created admin user');

    // Mata Pelajaran
    const mataPelajaran1 = await db.MataPelajaran.create({
      nama: 'Matematika',
      kode: 'MTK'
    });

    const mataPelajaran2 = await db.MataPelajaran.create({
      nama: 'Bahasa Indonesia',
      kode: 'BIN'
    });
    console.log('  ✓ Created mata pelajaran');

    // Guru user and profile
    const guruUser = await db.User.create({
      username: 'guru',
      password: hashedPasswordGuru,
      email: 'guru@test.com',
      role: 'guru'
    });

    const guru = await db.Guru.create({
      user_id: guruUser.id,
      nip: '198501012010011001',
      nama: 'Budi Santoso S.Pd',
      jenis_kelamin: 'L',
      tanggal_lahir: '1985-01-01',
      alamat: 'Jl. Pendidikan No. 45',
      no_telp: '081234567890',
      email: 'guru@test.com',
      mata_pelajaran_id: mataPelajaran1.id
    });
    console.log('  ✓ Created guru user and profile');

    // Kelas
    const kelas = await db.Kelas.create({
      nama_kelas: 'X IPA 1',
      tingkat: 10,
      tahun_ajaran: '2024/2025',
      guru_id: guru.id,
      kapasitas: 30
    });
    console.log('  ✓ Created kelas');

    // Siswa user and profile
    const siswaUser = await db.User.create({
      username: 'siswa',
      password: hashedPasswordSiswa,
      email: 'siswa@test.com',
      role: 'siswa'
    });

    const siswa = await db.Siswa.create({
      user_id: siswaUser.id,
      nis: '2024001',
      nama: 'Ahmad Rizki',
      kelas_id: kelas.id,
      jenis_kelamin: 'L',
      tanggal_lahir: '2010-05-15',
      alamat: 'Jl. Merdeka No. 123',
      nama_wali: 'Bapak Ahmad',
      no_telp_wali: '081234567890',
      email: 'siswa@test.com'
    });
    console.log('  ✓ Created siswa user and profile');

    // Jadwal Pelajaran
    await db.JadwalPelajaran.create({
      kelas_id: kelas.id,
      mata_pelajaran_id: mataPelajaran1.id,
      guru_id: guru.id,
      hari: 'Senin',
      jam_mulai: '08:00',
      jam_selesai: '09:30',
      ruangan: 'R101'
    });
    console.log('  ✓ Created jadwal pelajaran');

    // List Pembayaran
    const listPembayaran = await db.ListPembayaran.create({
      nama_pembayaran: 'SPP Bulanan',
      jumlah: 500000,
      keterangan: 'Pembayaran SPP per bulan',
      tingkat: 10
    });
    console.log('  ✓ Created list pembayaran');

    // Presensi
    await db.Presensi.create({
      siswa_id: siswa.id,
      kelas_id: kelas.id,
      mata_pelajaran_id: mataPelajaran1.id,
      tanggal: new Date(),
      status: 'Hadir',
      keterangan: 'Hadir tepat waktu'
    });
    console.log('  ✓ Created presensi');

    // Rapor/Nilai
    await db.Rapor.create({
      siswa_id: siswa.id,
      mata_pelajaran_id: mataPelajaran1.id,
      semester: 1,
      tahun_ajaran: '2024/2025',
      nilai_tugas: 85,
      nilai_uts: 80,
      nilai_uas: 88,
      nilai_akhir: 84
    });
    console.log('  ✓ Created rapor/nilai');

    // Pembayaran
    await db.Pembayaran.create({
      siswa_id: siswa.id,
      list_pembayaran_id: listPembayaran.id,
      jumlah: 500000,
      tanggal_bayar: new Date(),
      metode_pembayaran: 'Transfer Bank',
      status: 'approved',
      bukti_pembayaran: 'bukti_test.jpg'
    });
    console.log('  ✓ Created pembayaran');

  } catch (error) {
    console.error('  ❌ Error seeding data:', error);
    throw error;
  }
}

// Run setup
setupTestDatabase();
