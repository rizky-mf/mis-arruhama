module.exports = (sequelize, DataTypes) => {
  const Rapor = sequelize.define('rapor', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    siswa_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'siswa', key: 'id' } },
    mata_pelajaran_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'mata_pelajaran', key: 'id' } },
    kelas_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'kelas', key: 'id' } },
    semester: { type: DataTypes.ENUM('1', '2'), allowNull: false },
    tahun_ajaran: { type: DataTypes.STRING(20), allowNull: false },
    nilai_harian: { type: DataTypes.DECIMAL(5, 2) },
    nilai_uts: { type: DataTypes.DECIMAL(5, 2) },
    nilai_uas: { type: DataTypes.DECIMAL(5, 2) },
    nilai_akhir: { type: DataTypes.DECIMAL(5, 2) },
    predikat: { type: DataTypes.STRING(2) },
    catatan: { type: DataTypes.TEXT },
    created_by: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, { timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });
  return Rapor;
};