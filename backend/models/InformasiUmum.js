module.exports = (sequelize, DataTypes) => {
  const InformasiUmum = sequelize.define('informasi_umum', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    judul: { type: DataTypes.STRING(255), allowNull: false },
    konten: { type: DataTypes.TEXT, allowNull: false },
    jenis: { type: DataTypes.ENUM('event', 'libur', 'pengumuman'), allowNull: false },
    tanggal_mulai: { type: DataTypes.DATEONLY },
    tanggal_selesai: { type: DataTypes.DATEONLY },
    created_by: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, { timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });
  return InformasiUmum;
};