// models/index.js
const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

// Import semua models
const User = require('./User')(sequelize, DataTypes);
const ProfilMadrasah = require('./ProfilMadrasah')(sequelize, DataTypes);
const Settings = require('./Settings')(sequelize, DataTypes);
const ActivityLog = require('./ActivityLog')(sequelize, DataTypes);
const Guru = require('./Guru')(sequelize, DataTypes);
const Kelas = require('./Kelas')(sequelize, DataTypes);
const Siswa = require('./Siswa')(sequelize, DataTypes);
const MataPelajaran = require('./MataPelajaran')(sequelize, DataTypes);
const JadwalPelajaran = require('./JadwalPelajaran')(sequelize, DataTypes);
const ListPembayaran = require('./ListPembayaran')(sequelize, DataTypes);
const Pembayaran = require('./Pembayaran')(sequelize, DataTypes);
const InformasiUmum = require('./InformasiUmum')(sequelize, DataTypes);
const InformasiKelas = require('./InformasiKelas')(sequelize, DataTypes);
const Presensi = require('./Presensi')(sequelize, DataTypes);
const Rapor = require('./Rapor')(sequelize, DataTypes);
const ChatbotIntent = require('./ChatbotIntent')(sequelize, DataTypes);
const ChatbotResponse = require('./ChatbotResponse')(sequelize, DataTypes);
const ChatbotLog = require('./ChatbotLog')(sequelize, DataTypes);

// ========================================
// DEFINISI RELASI ANTAR TABEL
// ========================================

// User Relations
User.hasOne(Guru, { foreignKey: 'user_id', as: 'guru' });
User.hasOne(Siswa, { foreignKey: 'user_id', as: 'siswa' });
User.hasMany(ChatbotLog, { foreignKey: 'user_id', as: 'chatbot_logs' });
User.hasMany(ActivityLog, { foreignKey: 'user_id', as: 'activity_logs' });

// ActivityLog Relations
ActivityLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Guru Relations
Guru.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Guru.hasMany(Kelas, { foreignKey: 'guru_id', as: 'kelas_diampu' });
Guru.hasMany(JadwalPelajaran, { foreignKey: 'guru_id', as: 'jadwal_mengajar' });
Guru.hasMany(InformasiKelas, { foreignKey: 'guru_id', as: 'informasi_kelas' });

// Kelas Relations
Kelas.belongsTo(Guru, { foreignKey: 'guru_id', as: 'wali_kelas' });
Kelas.hasMany(Siswa, { foreignKey: 'kelas_id', as: 'siswa' });
Kelas.hasMany(JadwalPelajaran, { foreignKey: 'kelas_id', as: 'jadwal_pelajaran' });
Kelas.hasMany(InformasiKelas, { foreignKey: 'kelas_id', as: 'informasi' });
Kelas.hasMany(Presensi, { foreignKey: 'kelas_id', as: 'presensi' });
Kelas.hasMany(Rapor, { foreignKey: 'kelas_id', as: 'rapor' });

// Siswa Relations
Siswa.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Siswa.belongsTo(Kelas, { foreignKey: 'kelas_id', as: 'kelas' });
Siswa.hasMany(Pembayaran, { foreignKey: 'siswa_id', as: 'pembayaran' });
Siswa.hasMany(Presensi, { foreignKey: 'siswa_id', as: 'presensi' });
Siswa.hasMany(Rapor, { foreignKey: 'siswa_id', as: 'rapor' });

// Mata Pelajaran Relations
MataPelajaran.hasMany(JadwalPelajaran, { foreignKey: 'mata_pelajaran_id', as: 'jadwal' });
MataPelajaran.hasMany(Rapor, { foreignKey: 'mata_pelajaran_id', as: 'nilai' });

// Jadwal Pelajaran Relations
JadwalPelajaran.belongsTo(Kelas, { foreignKey: 'kelas_id', as: 'kelas' });
JadwalPelajaran.belongsTo(MataPelajaran, { foreignKey: 'mata_pelajaran_id', as: 'mata_pelajaran' });
JadwalPelajaran.belongsTo(Guru, { foreignKey: 'guru_id', as: 'guru' });

// List Pembayaran Relations
ListPembayaran.hasMany(Pembayaran, { foreignKey: 'list_pembayaran_id', as: 'transaksi' });

// Pembayaran Relations
Pembayaran.belongsTo(Siswa, { foreignKey: 'siswa_id', as: 'siswa' });
Pembayaran.belongsTo(ListPembayaran, { foreignKey: 'list_pembayaran_id', as: 'jenis_pembayaran' });
Pembayaran.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });

// Informasi Umum Relations
InformasiUmum.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// Informasi Kelas Relations
InformasiKelas.belongsTo(Kelas, { foreignKey: 'kelas_id', as: 'kelas' });
InformasiKelas.belongsTo(Guru, { foreignKey: 'guru_id', as: 'guru' });

// Presensi Relations
Presensi.belongsTo(Siswa, { foreignKey: 'siswa_id', as: 'siswa' });
Presensi.belongsTo(Kelas, { foreignKey: 'kelas_id', as: 'kelas' });
Presensi.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// Rapor Relations
Rapor.belongsTo(Siswa, { foreignKey: 'siswa_id', as: 'siswa' });
Rapor.belongsTo(MataPelajaran, { foreignKey: 'mata_pelajaran_id', as: 'mata_pelajaran' });
Rapor.belongsTo(Kelas, { foreignKey: 'kelas_id', as: 'kelas' });
Rapor.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// Chatbot Relations
ChatbotIntent.hasMany(ChatbotResponse, { foreignKey: 'intent_id', as: 'responses' });
ChatbotIntent.hasMany(ChatbotLog, { foreignKey: 'intent_id', as: 'logs' });

ChatbotResponse.belongsTo(ChatbotIntent, { foreignKey: 'intent_id', as: 'intent' });

ChatbotLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
ChatbotLog.belongsTo(ChatbotIntent, { foreignKey: 'intent_id', as: 'intent' });

// ========================================
// EXPORT MODELS
// ========================================

const db = {
  sequelize,
  User,
  ProfilMadrasah,
  Settings,
  ActivityLog,
  Guru,
  Kelas,
  Siswa,
  MataPelajaran,
  JadwalPelajaran,
  ListPembayaran,
  Pembayaran,
  InformasiUmum,
  InformasiKelas,
  Presensi,
  Rapor,
  ChatbotIntent,
  ChatbotResponse,
  ChatbotLog
};

module.exports = db;