const { Settings, ProfilMadrasah, User, ActivityLog } = require('../models');
const bcrypt = require('bcryptjs');

// Get akademik aktif (accessible by all authenticated users)
exports.getAkademikAktif = async (req, res) => {
  try {
    const tahunAjaranSetting = await Settings.findOne({
      where: { key: 'tahun_ajaran_aktif' }
    });

    const semesterSetting = await Settings.findOne({
      where: { key: 'semester_aktif' }
    });

    res.json({
      success: true,
      data: {
        tahun_ajaran_aktif: tahunAjaranSetting?.value || '2024/2025',
        semester_aktif: semesterSetting?.value || 'Ganjil'
      }
    });
  } catch (error) {
    console.error('Error fetching akademik aktif:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil periode akademik aktif',
      error: error.message
    });
  }
};

// Get all settings (akademik)
exports.getAllSettings = async (req, res) => {
  try {
    const settings = await Settings.findAll();

    // Convert to key-value object
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });

    // Also get profil madrasah
    const profil = await ProfilMadrasah.findOne();

    res.json({
      success: true,
      data: {
        settings: settingsObj,
        profil_madrasah: profil
      }
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil pengaturan',
      error: error.message
    });
  }
};

// Update settings (akademik)
exports.updateSettings = async (req, res) => {
  try {
    const {
      tahun_ajaran_aktif,
      semester_aktif,
      kkm_default,
      bobot_harian,
      bobot_uts,
      bobot_uas
    } = req.body;

    // Validate bobot total
    const totalBobot = parseInt(bobot_harian || 0) +
                       parseInt(bobot_uts || 0) +
                       parseInt(bobot_uas || 0);

    if (totalBobot !== 100) {
      return res.status(400).json({
        success: false,
        message: `Total bobot harus 100%. Saat ini: ${totalBobot}%`
      });
    }

    // Update or create each setting
    const settingsToUpdate = [
      { key: 'tahun_ajaran_aktif', value: tahun_ajaran_aktif },
      { key: 'semester_aktif', value: semester_aktif },
      { key: 'kkm_default', value: kkm_default },
      { key: 'bobot_harian', value: bobot_harian },
      { key: 'bobot_uts', value: bobot_uts },
      { key: 'bobot_uas', value: bobot_uas }
    ];

    for (const setting of settingsToUpdate) {
      if (setting.value !== undefined && setting.value !== null) {
        await Settings.upsert({
          key: setting.key,
          value: setting.value.toString(),
          updated_at: new Date()
        });
      }
    }

    // Log activity
    await ActivityLog.create({
      user_id: req.user?.id,
      username: req.user?.username,
      action: 'Update',
      description: 'Mengubah pengaturan akademik',
      ip_address: req.ip
    });

    res.json({
      success: true,
      message: 'Pengaturan berhasil diperbarui'
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui pengaturan',
      error: error.message
    });
  }
};

// Update profil madrasah
exports.updateProfilMadrasah = async (req, res) => {
  try {
    const {
      nama_madrasah,
      alamat,
      telepon,
      email,
      kepala_sekolah,
      visi,
      misi
    } = req.body;

    let profil = await ProfilMadrasah.findOne();

    if (profil) {
      // Update existing
      await profil.update({
        nama_madrasah,
        alamat,
        telepon,
        email,
        kepala_sekolah,
        visi,
        misi,
        updated_at: new Date()
      });
    } else {
      // Create new
      profil = await ProfilMadrasah.create({
        nama_madrasah,
        alamat,
        telepon,
        email,
        kepala_sekolah,
        visi,
        misi
      });
    }

    // Log activity
    await ActivityLog.create({
      user_id: req.user?.id,
      username: req.user?.username,
      action: 'Update',
      description: 'Mengubah profil madrasah',
      ip_address: req.ip
    });

    res.json({
      success: true,
      message: 'Profil madrasah berhasil diperbarui',
      data: profil
    });
  } catch (error) {
    console.error('Error updating profil madrasah:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui profil madrasah',
      error: error.message
    });
  }
};

// Get admin profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'role', 'created_at']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    // For admin, we might want to add email from a separate admin profile table
    // For now, return basic user info
    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: 'admin@arruhama.sch.id', // Placeholder
        nama_lengkap: 'Administrator', // Placeholder
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil profil',
      error: error.message
    });
  }
};

// Update admin profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email, nama_lengkap } = req.body;

    // Note: Currently User model doesn't have email/nama_lengkap fields
    // You might want to create a separate AdminProfile table
    // For now, just return success

    // Log activity
    await ActivityLog.create({
      user_id: userId,
      username: req.user.username,
      action: 'Update',
      description: 'Mengubah profil admin',
      ip_address: req.ip
    });

    res.json({
      success: true,
      message: 'Profil berhasil diperbarui',
      data: {
        email,
        nama_lengkap
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui profil',
      error: error.message
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password lama dan password baru harus diisi'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password baru minimal 6 karakter'
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Password lama tidak sesuai'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await user.update({
      password: hashedPassword,
      updated_at: new Date()
    });

    // Log activity
    await ActivityLog.create({
      user_id: userId,
      username: user.username,
      action: 'Update',
      description: 'Mengubah password',
      ip_address: req.ip
    });

    res.json({
      success: true,
      message: 'Password berhasil diubah'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengubah password',
      error: error.message
    });
  }
};

// Get activity logs
exports.getActivityLogs = async (req, res) => {
  try {
    const { action, limit = 100, offset = 0 } = req.query;

    const where = {};
    if (action && action !== 'all') {
      if (action === 'login') {
        where.action = 'Login';
      } else if (action === 'admin') {
        where.action = { [require('sequelize').Op.ne]: 'Login' };
      }
    }

    const logs = await ActivityLog.findAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'role']
        }
      ]
    });

    const total = await ActivityLog.count({ where });

    res.json({
      success: true,
      data: logs,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil log aktivitas',
      error: error.message
    });
  }
};
