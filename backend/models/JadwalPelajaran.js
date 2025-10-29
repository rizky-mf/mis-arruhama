module.exports = (sequelize, DataTypes) => {
  const JadwalPelajaran = sequelize.define('jadwal_pelajaran', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    kelas_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'kelas', key: 'id' } },
    mata_pelajaran_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'mata_pelajaran', key: 'id' } },
    guru_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'guru', key: 'id' } },
    hari: { type: DataTypes.ENUM('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'), allowNull: false },
    jam_mulai: { type: DataTypes.TIME, allowNull: false },
    jam_selesai: { type: DataTypes.TIME, allowNull: false },
    ruangan: { type: DataTypes.STRING(50) },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, { timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });
  return JadwalPelajaran;
};