module.exports = (sequelize, DataTypes) => {
  const Pembayaran = sequelize.define('pembayaran', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    siswa_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'siswa', key: 'id' } },
    list_pembayaran_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'list_pembayaran', key: 'id' } },
    jumlah_bayar: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    tanggal_bayar: { type: DataTypes.DATEONLY, allowNull: false },
    bukti_bayar: { type: DataTypes.STRING(255) },
    status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
    approved_by: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
    approved_at: { type: DataTypes.DATE },
    catatan: { type: DataTypes.TEXT },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, { timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });
  return Pembayaran;
};