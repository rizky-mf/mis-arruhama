// controllers/siswaController.js
const db = require('../models');
const { Op } = require('sequelize');
const {
  generatePassword,
  hashPassword,
  generateUsernameFromNISN,
  getPagination,
  getPaginationMeta,
  validateNISN,
  cleanString,
  successResponse,
  errorResponse
} = require('../utils/helper');

/**
 * Get all siswa dengan pagination, filter, dan search
 * GET /api/admin/siswa
 */
const getAllSiswa = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', kelas_id = '', status = 'aktif' } = req.query;
    const { offset, limit: pageLimit } = getPagination(page, limit);

    // Build where clause
    const where = {};
    
    if (search) {
      where[Op.or] = [
        { nisn: { [Op.like]: `%${search}%` } },
        { nama_lengkap: { [Op.like]: `%${search}%` } }
      ];
    }

    if (kelas_id) {
      where.kelas_id = kelas_id;
    }

    if (status) {
      where.status = status;
    }

    // Query dengan relasi
    const { count, rows } = await db.Siswa.findAndCountAll({
      where,
      include: [
        {
          model: db.Kelas,
          as: 'kelas',
          attributes: ['id', 'nama_kelas', 'tingkat'],
          include: [
            {
              model: db.Guru,
              as: 'wali_kelas',
              attributes: ['id', 'nama_lengkap']
            }
          ]
        },
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'username', 'is_active']
        }
      ],
      offset,
      limit: pageLimit,
      order: [['created_at', 'DESC']]
    });

    const pagination = getPaginationMeta(count, page, limit);

    successResponse(res, {
      siswa: rows,
      pagination
    }, 'Data siswa berhasil diambil');

  } catch (error) {
    console.error('Get all siswa error:', error);
    errorResponse(res, 'Gagal mengambil data siswa', 500);
  }
};

/**
 * Get single siswa by ID
 * GET /api/admin/siswa/:id
 */
const getSiswaById = async (req, res) => {
  try {
    const { id } = req.params;

    const siswa = await db.Siswa.findByPk(id, {
      include: [
        {
          model: db.Kelas,
          as: 'kelas',
          include: [{ model: db.Guru, as: 'wali_kelas' }]
        },
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'username', 'is_active']
        }
      ]
    });

    if (!siswa) {
      return errorResponse(res, 'Siswa tidak ditemukan', 404);
    }

    successResponse(res, siswa, 'Data siswa berhasil diambil');

  } catch (error) {
    console.error('Get siswa by id error:', error);
    errorResponse(res, 'Gagal mengambil data siswa', 500);
  }
};

/**
 * Create siswa baru (manual)
 * POST /api/admin/siswa
 */
const createSiswa = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const {
      nisn,
      nama_lengkap,
      jenis_kelamin,
      tanggal_lahir,
      alamat,
      nama_orang_tua,
      telepon_orang_tua,
      kelas_id
    } = req.body;

    // Validasi input
    if (!nisn || !nama_lengkap || !jenis_kelamin) {
      return errorResponse(res, 'NISN, nama lengkap, dan jenis kelamin wajib diisi', 400);
    }

    if (!validateNISN(nisn)) {
      return errorResponse(res, 'Format NISN tidak valid (harus 10-20 digit angka)', 400);
    }

    // Cek duplikat NISN
    const existingSiswa = await db.Siswa.findOne({ where: { nisn } });
    if (existingSiswa) {
      return errorResponse(res, 'NISN sudah terdaftar', 400);
    }

    // Generate username dan password
    const username = generateUsernameFromNISN(nisn);
    const plainPassword = generatePassword(8);
    const hashedPassword = await hashPassword(plainPassword);

    // Cek duplikat username
    const existingUser = await db.User.findOne({ where: { username } });
    if (existingUser) {
      return errorResponse(res, 'Username sudah ada', 400);
    }

    // Create user
    const user = await db.User.create({
      username,
      password: hashedPassword,
      role: 'siswa',
      is_active: true
    }, { transaction });

    // Create siswa
    const siswa = await db.Siswa.create({
      user_id: user.id,
      nisn: cleanString(nisn),
      nama_lengkap: cleanString(nama_lengkap),
      jenis_kelamin,
      tanggal_lahir: tanggal_lahir || null,
      alamat: alamat || null,
      nama_orang_tua: nama_orang_tua || null,
      telepon_orang_tua: telepon_orang_tua || null,
      kelas_id: kelas_id || null,
      status: 'aktif'
    }, { transaction });

    await transaction.commit();

    successResponse(res, {
      siswa,
      credentials: {
        username,
        password: plainPassword // Return plain password untuk diberitahu ke siswa
      }
    }, 'Siswa berhasil ditambahkan', 201);

  } catch (error) {
    await transaction.rollback();
    console.error('Create siswa error:', error);
    errorResponse(res, 'Gagal menambahkan siswa', 500);
  }
};

/**
 * Update siswa
 * PUT /api/admin/siswa/:id
 */
const updateSiswa = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nama_lengkap,
      jenis_kelamin,
      tanggal_lahir,
      alamat,
      nama_orang_tua,
      telepon_orang_tua,
      kelas_id,
      status
    } = req.body;

    const siswa = await db.Siswa.findByPk(id);
    if (!siswa) {
      return errorResponse(res, 'Siswa tidak ditemukan', 404);
    }

    // Update data
    await siswa.update({
      nama_lengkap: nama_lengkap || siswa.nama_lengkap,
      jenis_kelamin: jenis_kelamin || siswa.jenis_kelamin,
      tanggal_lahir: tanggal_lahir || siswa.tanggal_lahir,
      alamat: alamat || siswa.alamat,
      nama_orang_tua: nama_orang_tua || siswa.nama_orang_tua,
      telepon_orang_tua: telepon_orang_tua || siswa.telepon_orang_tua,
      kelas_id: kelas_id !== undefined ? kelas_id : siswa.kelas_id,
      status: status || siswa.status
    });

    successResponse(res, siswa, 'Data siswa berhasil diupdate');

  } catch (error) {
    console.error('Update siswa error:', error);
    errorResponse(res, 'Gagal mengupdate siswa', 500);
  }
};

/**
 * Delete siswa (soft delete via status)
 * DELETE /api/admin/siswa/:id
 */
const deleteSiswa = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { id } = req.params;

    const siswa = await db.Siswa.findByPk(id);
    if (!siswa) {
      return errorResponse(res, 'Siswa tidak ditemukan', 404);
    }

    // Soft delete: ubah status jadi "pindah"
    await siswa.update({ status: 'pindah' }, { transaction });

    // Non-aktifkan user
    await db.User.update(
      { is_active: false },
      { where: { id: siswa.user_id }, transaction }
    );

    await transaction.commit();

    successResponse(res, null, 'Siswa berhasil dihapus');

  } catch (error) {
    await transaction.rollback();
    console.error('Delete siswa error:', error);
    errorResponse(res, 'Gagal menghapus siswa', 500);
  }
};

/**
 * Reset password siswa
 * PUT /api/admin/siswa/:id/reset-password
 */
const resetPasswordSiswa = async (req, res) => {
  try {
    const { id } = req.params;

    const siswa = await db.Siswa.findByPk(id);
    if (!siswa) {
      return errorResponse(res, 'Siswa tidak ditemukan', 404);
    }

    // Generate password baru
    const newPassword = generatePassword(8);
    const hashedPassword = await hashPassword(newPassword);

    // Update password di tabel users
    await db.User.update(
      { password: hashedPassword },
      { where: { id: siswa.user_id } }
    );

    successResponse(res, {
      username: `id_${siswa.nisn}`,
      new_password: newPassword
    }, 'Password berhasil direset');

  } catch (error) {
    console.error('Reset password error:', error);
    errorResponse(res, 'Gagal mereset password', 500);
  }
};

module.exports = {
  getAllSiswa,
  getSiswaById,
  createSiswa,
  updateSiswa,
  deleteSiswa,
  resetPasswordSiswa
};