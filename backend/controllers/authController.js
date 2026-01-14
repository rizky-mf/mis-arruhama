// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models');
const { sendSuccess, sendError, sendUnauthorized, sendForbidden, sendNotFound } = require('../utils/response');
const { catchAsync, BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError } = require('../utils/errorHandler');

/**
 * Login user (admin, guru, siswa)
 * POST /api/auth/login
 */
const login = catchAsync(async (req, res) => {
  const { username, password } = req.body;

  // Validasi input
  if (!username || !password) {
    throw new BadRequestError('Username dan password wajib diisi');
  }

  // Cari user berdasarkan username
  const user = await db.User.findOne({
    where: { username },
    attributes: ['id', 'username', 'password', 'role', 'is_active']
  });

  if (!user) {
    throw new UnauthorizedError('Username atau password salah');
  }

  // Cek apakah user aktif
  if (!user.is_active) {
    throw new ForbiddenError('Akun Anda tidak aktif. Silakan hubungi administrator.');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Username atau password salah');
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

  // Clear chat history saat login (fresh start)
  await db.ChatbotLog.destroy({
    where: { user_id: user.id }
  });

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

  sendSuccess(res, {
    token,
    user: userData
  }, 'Login berhasil');
});

/**
 * Get current user profile
 * GET /api/auth/me
 */
const getProfile = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const user = await db.User.findByPk(userId, {
    attributes: ['id', 'username', 'role', 'is_active', 'created_at']
  });

  if (!user) {
    throw new NotFoundError('User tidak ditemukan');
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

  sendSuccess(res, profileData, 'Profil berhasil diambil');
});

/**
 * Change password
 * PUT /api/auth/change-password
 */
const changePassword = catchAsync(async (req, res) => {
  const { old_password, new_password, confirm_password } = req.body;
  const userId = req.user.id;

  // Validasi input
  if (!old_password || !new_password || !confirm_password) {
    throw new BadRequestError('Semua field wajib diisi');
  }

  if (new_password !== confirm_password) {
    throw new BadRequestError('Password baru dan konfirmasi password tidak cocok');
  }

  if (new_password.length < 6) {
    throw new BadRequestError('Password minimal 6 karakter');
  }

  // Get user
  const user = await db.User.findByPk(userId);

  if (!user) {
    throw new NotFoundError('User tidak ditemukan');
  }

  // Verify old password
  const isPasswordValid = await bcrypt.compare(old_password, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Password lama salah');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(new_password, 10);

  // Update password
  await user.update({ password: hashedPassword });

  sendSuccess(res, null, 'Password berhasil diubah');
});

/**
 * Logout (client-side harus hapus token)
 * POST /api/auth/logout
 */
const logout = catchAsync(async (req, res) => {
  sendSuccess(res, null, 'Logout berhasil. Silakan hapus token dari client.');
});

module.exports = {
  login,
  getProfile,
  changePassword,
  logout
};
