// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models');

/**
 * Login user (admin, guru, siswa)
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validasi input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Cari user berdasarkan username
    const user = await db.User.findOne({
      where: { username },
      attributes: ['id', 'username', 'password', 'role', 'is_active']
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Cek apakah user aktif
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account is inactive. Please contact administrator.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Get detail user berdasarkan role
    let userData = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    if (user.role === 'guru') {
      const guru = await db.Guru.findOne({
        where: { user_id: user.id },
        attributes: ['id', 'nip', 'nama_lengkap', 'foto']
      });
      userData.profile = guru;
    } else if (user.role === 'siswa') {
      const siswa = await db.Siswa.findOne({
        where: { user_id: user.id },
        attributes: ['id', 'nisn', 'nama_lengkap', 'foto', 'kelas_id'],
        include: [
          {
            model: db.Kelas,
            as: 'kelas',
            attributes: ['id', 'nama_kelas', 'tingkat']
          }
        ]
      });
      userData.profile = siswa;
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: userData
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await db.User.findByPk(userId, {
      attributes: ['id', 'username', 'role', 'is_active', 'created_at']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let profileData = user.toJSON();

    // Get detail berdasarkan role
    if (user.role === 'guru') {
      const guru = await db.Guru.findOne({
        where: { user_id: userId },
        include: [
          {
            model: db.Kelas,
            as: 'kelas_diampu',
            attributes: ['id', 'nama_kelas', 'tingkat', 'tahun_ajaran']
          }
        ]
      });
      profileData.profile = guru;
    } else if (user.role === 'siswa') {
      const siswa = await db.Siswa.findOne({
        where: { user_id: userId },
        include: [
          {
            model: db.Kelas,
            as: 'kelas',
            attributes: ['id', 'nama_kelas', 'tingkat', 'tahun_ajaran'],
            include: [
              {
                model: db.Guru,
                as: 'wali_kelas',
                attributes: ['id', 'nama_lengkap']
              }
            ]
          }
        ]
      });
      profileData.profile = siswa;
    }

    res.json({
      success: true,
      data: profileData
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Change password
 * PUT /api/auth/change-password
 */
const changePassword = async (req, res) => {
  try {
    const { old_password, new_password, confirm_password } = req.body;
    const userId = req.user.id;

    // Validasi input
    if (!old_password || !new_password || !confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password do not match'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Get user
    const user = await db.User.findByPk(userId);

    // Verify old password
    const isPasswordValid = await bcrypt.compare(old_password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Old password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password
    await user.update({ password: hashedPassword });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Logout (client-side harus hapus token)
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful. Please remove the token from client.'
  });
};

module.exports = {
  login,
  getProfile,
  changePassword,
  logout
};