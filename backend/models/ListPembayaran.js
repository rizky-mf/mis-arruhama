module.exports = (sequelize, DataTypes) => {
  const ListPembayaran = sequelize.define('list_pembayaran', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nama_pembayaran: { type: DataTypes.STRING(100), allowNull: false },
    nominal: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    periode: { type: DataTypes.ENUM('bulanan', 'semester', 'tahunan'), allowNull: false },
    tingkat: { type: DataTypes.INTEGER, defaultValue: 0 },
    deskripsi: { type: DataTypes.TEXT },
    status: { type: DataTypes.ENUM('aktif', 'nonaktif'), defaultValue: 'aktif' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, { timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });
  return ListPembayaran;
};