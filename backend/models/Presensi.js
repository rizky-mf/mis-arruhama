module.exports = (sequelize, DataTypes) => {
  const Presensi = sequelize.define('presensi', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    siswa_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'siswa', key: 'id' } },
    kelas_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'kelas', key: 'id' } },
    tanggal: { type: DataTypes.DATEONLY, allowNull: false },
    status: { type: DataTypes.ENUM('hadir', 'sakit', 'izin', 'alpa'), allowNull: false },
    keterangan: { type: DataTypes.TEXT },
    created_by: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, { timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });
  return Presensi;
};