// models/Siswa.js
module.exports = (sequelize, DataTypes) => {
  const Siswa = sequelize.define('siswa', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    nisn: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    nama_lengkap: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    jenis_kelamin: {
      type: DataTypes.ENUM('L', 'P'),
      allowNull: false
    },
    tanggal_lahir: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    alamat: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    nama_orang_tua: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    telepon_orang_tua: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    kelas_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'kelas',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    foto: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('aktif', 'lulus', 'pindah'),
      defaultValue: 'aktif'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['nisn'] },
      { fields: ['kelas_id'] },
      { fields: ['status'] }
    ]
  });

  return Siswa;
};