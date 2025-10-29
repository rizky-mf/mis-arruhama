module.exports = (sequelize, DataTypes) => {
  const InformasiKelas = sequelize.define('informasi_kelas', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    kelas_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'kelas', key: 'id' } },
    guru_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'guru', key: 'id' } },
    judul: { type: DataTypes.STRING(255), allowNull: false },
    konten: { type: DataTypes.TEXT, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, { timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });
  return InformasiKelas;
};