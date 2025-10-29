// controllers/guruController.js
const db = require('../models');
const { Op } = require('sequelize');
const {
  generatePassword,
  hashPassword,
  getPagination,
  getPaginationMeta,
  cleanString,
  successResponse,
  errorResponse
} = require('../utils/helper');

/**
 * Get all guru dengan pagination, filter, dan search
 * GET /api/admin/guru
 */
const getAllGuru = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const { offset, limit: pageLimit } = getPagination(page, limit);

    // Build where clause
    const where = {};
    
    if (search) {
      where[Op.or] = [
        { nip: { [Op.like]: `%${search}%` } },
        { nama_lengkap: { [Op.like]: `%${search}%` } }
      ];
    }

    // Query dengan relasi
    const { count, rows } = await db.Guru.findAndCountAll({
      where,
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'username', 'is_active']
        },
        {
          model: db.Kelas,
          as: 'kelas_diampu',
          attributes: ['id', 'nama_kelas', 'tingkat', 'tahun_ajaran']
        }
      ],
      offset,
      limit: pageLimit,
      order: [['created_at', 'DESC']]
    });

    const pagination = getPaginationMeta(count, page, limit);

    successResponse(res, {
      guru: rows,
      pagination
    }, 'Data guru berhasil diambil');

  } catch (error) {
    console.error('Get all guru error:', error);
    errorResponse(res, 'Gagal mengambil data guru', 500);
  }
};

/**
 * Get single guru by ID
 * GET /api/admin/guru/:id
 */
const getGuruById = async (req, res) => {
  try {
    const { id } = req.params;

    const guru = await db.Guru.findByPk(id, {
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'username', 'is_active']
        },
        {
          model: db.Kelas,
          as: 'kelas_diampu',
          attributes: ['id', 'nama_kelas', 'tingkat', 'tahun_ajaran']
        },
        {
          model: db.JadwalPelajaran,
          as: 'jadwal_mengajar',
          attributes: ['id', 'hari', 'jam_mulai', 'jam_selesai'],
          include: [
            {
              model: db.Kelas,
              as: 'kelas',
              attributes: ['nama_kelas']
            },
            {
              model: db.MataPelajaran,
              as: 'mata_pelajaran',
              attributes: ['nama_mapel']
            }
          ]
        }
      ]
    });

    if (!guru) {
      return errorResponse(res, 'Guru tidak ditemukan', 404);
    }

    successResponse(res, guru, 'Data guru berhasil diambil');

  } catch (error) {
    console.error('Get guru by id error:', error);
    errorResponse(res, 'Gagal mengambil data guru', 500);
  }
};

/**
 * Create guru baru
 * POST /api/admin/guru
 */
const createGuru = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const {
      nip,
      nama_lengkap,
      jenis_kelamin,
      tanggal_lahir,
      alamat,
      telepon,
      email,
      username // optional, jika tidak diisi akan auto-generate dari NIP
    } = req.body;

    // Validasi input
    if (!nip || !nama_lengkap || !jenis_kelamin) {
      return errorResponse(res, 'NIP, nama lengkap, dan jenis kelamin wajib diisi', 400);
    }

    // Validasi NIP (harus numeric)
    if (!/^[0-9]+$/.test(nip)) {
      return errorResponse(res, 'Format NIP tidak valid (harus angka)', 400);
    }

    // Cek duplikat NIP
    const existingGuru = await db.Guru.findOne({ where: { nip } });
    if (existingGuru) {
      return errorResponse(res, 'NIP sudah terdaftar', 400);
    }

    // Generate username (gunakan input atau auto dari NIP)
    const generatedUsername = username || `guru_${nip}`;
    const plainPassword = generatePassword(8);
    const hashedPassword = await hashPassword(plainPassword);

    // Cek duplikat username
    const existingUser = await db.User.findOne({ where: { username: generatedUsername } });
    if (existingUser) {
      return errorResponse(res, 'Username sudah ada', 400);
    }

    // Create user
    const user = await db.User.create({
      username: generatedUsername,
      password: hashedPassword,
      role: 'guru',
      is_active: true
    }, { transaction });

    // Create guru
    const guru = await db.Guru.create({
      user_id: user.id,
      nip: cleanString(nip),
      nama_lengkap: cleanString(nama_lengkap),
      jenis_kelamin,
      tanggal_lahir: tanggal_lahir || null,
      alamat: alamat || null,
      telepon: telepon || null,
      email: email || null
    }, { transaction });

    await transaction.commit();

    successResponse(res, {
      guru,
      credentials: {
        username: generatedUsername,
        password: plainPassword // Return plain password untuk diberitahu ke guru
      }
    }, 'Guru berhasil ditambahkan', 201);

  } catch (error) {
    await transaction.rollback();
    console.error('Create guru error:', error);
    errorResponse(res, 'Gagal menambahkan guru', 500);
  }
};

/**
 * Update guru
 * PUT /api/admin/guru/:id
 */
const updateGuru = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nama_lengkap,
      jenis_kelamin,
      tanggal_lahir,
      alamat,
      telepon,
      email
    } = req.body;

    const guru = await db.Guru.findByPk(id);
    if (!guru) {
      return errorResponse(res, 'Guru tidak ditemukan', 404);
    }

    // Update data
    await guru.update({
      nama_lengkap: nama_lengkap || guru.nama_lengkap,
      jenis_kelamin: jenis_kelamin || guru.jenis_kelamin,
      tanggal_lahir: tanggal_lahir || guru.tanggal_lahir,
      alamat: alamat || guru.alamat,
      telepon: telepon || guru.telepon,
      email: email || guru.email
    });

    successResponse(res, guru, 'Data guru berhasil diupdate');

  } catch (error) {
    console.error('Update guru error:', error);
    errorResponse(res, 'Gagal mengupdate guru', 500);
  }
};

/**
 * Delete guru (soft delete)
 * DELETE /api/admin/guru/:id
 */
const deleteGuru = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { id } = req.params;

    const guru = await db.Guru.findByPk(id);
    if (!guru) {
      return errorResponse(res, 'Guru tidak ditemukan', 404);
    }

    // Cek apakah guru masih jadi wali kelas
    const kelasCount = await db.Kelas.count({ where: { guru_id: id } });
    if (kelasCount > 0) {
      return errorResponse(res, 'Guru masih menjadi wali kelas. Hapus atau pindahkan wali kelas terlebih dahulu.', 400);
    }

    // Cek apakah guru masih punya jadwal mengajar
    const jadwalCount = await db.JadwalPelajaran.count({ where: { guru_id: id } });
    if (jadwalCount > 0) {
      return errorResponse(res, 'Guru masih memiliki jadwal mengajar. Hapus jadwal terlebih dahulu.', 400);
    }

    // Non-aktifkan user
    await db.User.update(
      { is_active: false },
      { where: { id: guru.user_id }, transaction }
    );

    // Delete guru (hard delete karena tidak ada status)
    await guru.destroy({ transaction });

    await transaction.commit();

    successResponse(res, null, 'Guru berhasil dihapus');

  } catch (error) {
    await transaction.rollback();
    console.error('Delete guru error:', error);
    errorResponse(res, 'Gagal menghapus guru', 500);
  }
};

/**
 * Reset password guru
 * PUT /api/admin/guru/:id/reset-password
 */
const resetPasswordGuru = async (req, res) => {
  try {
    const { id } = req.params;

    const guru = await db.Guru.findByPk(id, {
      include: [{ model: db.User, as: 'user', attributes: ['username'] }]
    });

    if (!guru) {
      return errorResponse(res, 'Guru tidak ditemukan', 404);
    }

    // Generate password baru
    const newPassword = generatePassword(8);
    const hashedPassword = await hashPassword(newPassword);

    // Update password di tabel users
    await db.User.update(
      { password: hashedPassword },
      { where: { id: guru.user_id } }
    );

    successResponse(res, {
      username: guru.user.username,
      new_password: newPassword
    }, 'Password berhasil direset');

  } catch (error) {
    console.error('Reset password error:', error);
    errorResponse(res, 'Gagal mereset password', 500);
  }
};

/**
 * Get kelas yang diampu oleh guru
 * GET /api/admin/guru/:id/kelas
 */
const getKelasByGuru = async (req, res) => {
  try {
    const { id } = req.params;

    const guru = await db.Guru.findByPk(id);
    if (!guru) {
      return errorResponse(res, 'Guru tidak ditemukan', 404);
    }

    // Get kelas sebagai wali kelas
    const kelasWali = await db.Kelas.findAll({
      where: { guru_id: id },
      include: [
        {
          model: db.Siswa,
          as: 'siswa',
          attributes: ['id', 'nisn', 'nama_lengkap']
        }
      ]
    });

    // Get kelas dari jadwal mengajar
    const jadwal = await db.JadwalPelajaran.findAll({
      where: { guru_id: id },
      include: [
        {
          model: db.Kelas,
          as: 'kelas',
          attributes: ['id', 'nama_kelas', 'tingkat']
        },
        {
          model: db.MataPelajaran,
          as: 'mata_pelajaran',
          attributes: ['nama_mapel']
        }
      ]
    });

    successResponse(res, {
      kelas_wali: kelasWali,
      jadwal_mengajar: jadwal
    }, 'Data kelas guru berhasil diambil');

  } catch (error) {
    console.error('Get kelas by guru error:', error);
    errorResponse(res, 'Gagal mengambil data kelas guru', 500);
  }
};

module.exports = {
  getAllGuru,
  getGuruById,
  createGuru,
  updateGuru,
  deleteGuru,
  resetPasswordGuru,
  getKelasByGuru
};