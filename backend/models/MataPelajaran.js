module.exports = (sequelize, DataTypes) => {
  const MataPelajaran = sequelize.define('mata_pelajaran', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    kode_mapel: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    nama_mapel: { type: DataTypes.STRING(100), allowNull: false },
    tingkat: { type: DataTypes.INTEGER, defaultValue: 0 },
    deskripsi: { type: DataTypes.TEXT },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, { timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });
  return MataPelajaran;
};