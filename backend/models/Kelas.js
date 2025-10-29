module.exports = (sequelize, DataTypes) => {
  const Kelas = sequelize.define('kelas', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nama_kelas: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    tingkat: { type: DataTypes.INTEGER, allowNull: false },
    guru_id: { type: DataTypes.INTEGER, references: { model: 'guru', key: 'id' }, onDelete: 'SET NULL' },
    tahun_ajaran: { type: DataTypes.STRING(20), allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, { timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });
  return Kelas;
};