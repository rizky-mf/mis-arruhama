module.exports = (sequelize, DataTypes) => {
  const ProfilMadrasah = sequelize.define('profil_madrasah', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nama_madrasah: { type: DataTypes.STRING(255), allowNull: false },
    alamat: { type: DataTypes.TEXT },
    telepon: { type: DataTypes.STRING(20) },
    email: { type: DataTypes.STRING(100) },
    kepala_sekolah: { type: DataTypes.STRING(100) },
    visi: { type: DataTypes.TEXT },
    misi: { type: DataTypes.TEXT },
    logo: { type: DataTypes.STRING(255) },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, { timestamps: false });
  return ProfilMadrasah;
};