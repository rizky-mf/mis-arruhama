module.exports = (sequelize, DataTypes) => {
  const Settings = sequelize.define('settings', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: 'Setting key (e.g., tahun_ajaran_aktif, semester_aktif)'
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Setting value'
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Description of the setting'
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    timestamps: true,
    createdAt: false,
    updatedAt: 'updated_at'
  });

  return Settings;
};
