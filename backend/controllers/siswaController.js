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
  cleanString
} = require('../utils/helper');
const { sendSuccess, sendCreated, sendUpdated, sendDeleted } = require('../utils/response');
const { catchAsync, NotFoundError, BadRequestError, ConflictError } = require('../utils/errorHandler');

/**
 * Get all siswa dengan pagination, filter, dan search
 * GET /api/admin/siswa
 */
const getAllSiswa = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, search = '', kelas_id = '', status = '' } = req.query;
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

  // Only apply status filter if explicitly provided
  if (status && status !== '') {
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
        attributes: ['id', 'username', 'plain_password', 'is_active']
      }
    ],
    offset,
    limit: pageLimit,
    order: [['created_at', 'DESC']]
  });

  const pagination = getPaginationMeta(count, page, limit);

  sendSuccess(res, {
    siswa: rows,
    pagination
  }, 'Data siswa berhasil diambil');
});

/**
 * Get single siswa by ID
 * GET /api/admin/siswa/:id
 */
const getSiswaById = catchAsync(async (req, res) => {
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
        attributes: ['id', 'username', 'plain_password', 'is_active']
      }
    ]
  });

  if (!siswa) {
    throw new NotFoundError('Siswa tidak ditemukan');
  }

  sendSuccess(res, siswa, 'Data siswa berhasil diambil');
});

/**
 * Create siswa baru (manual)
 * POST /api/admin/siswa
 */
const createSiswa = catchAsync(async (req, res) => {
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
      kelas_id,
      status,
      username,
      password
    } = req.body;

    // Validasi input
    if (!nisn || !nama_lengkap || !jenis_kelamin) {
      throw new BadRequestError('NISN, nama lengkap, dan jenis kelamin wajib diisi');
    }

    if (!username || !password) {
      throw new BadRequestError('Username dan password wajib diisi');
    }

    if (password.length < 6) {
      throw new BadRequestError('Password minimal 6 karakter');
    }

    if (!validateNISN(nisn)) {
      throw new BadRequestError('Format NISN tidak valid (harus 10-20 digit angka)');
    }

    // Cek duplikat NISN
    const existingSiswa = await db.Siswa.findOne({ where: { nisn } });
    if (existingSiswa) {
      throw new ConflictError('NISN sudah terdaftar');
    }

    // Cek duplikat username
    const existingUser = await db.User.findOne({ where: { username } });
    if (existingUser) {
      throw new ConflictError('Username sudah terdaftar');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await db.User.create({
      username: cleanString(username),
      password: hashedPassword,
      plain_password: password, // Save plain password untuk admin
      role: 'siswa',
      is_active: status === 1 || status === '1' || status === 'aktif' ? true : false
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
      status: status === 1 || status === '1' ? 'aktif' : 'tidak_aktif'
    }, { transaction });

    await transaction.commit();

    // Fetch siswa dengan relasi
    const siswaWithRelations = await db.Siswa.findByPk(siswa.id, {
      include: [
        {
          model: db.Kelas,
          as: 'kelas',
          attributes: ['id', 'nama_kelas', 'tingkat']
        },
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'username', 'plain_password', 'is_active']
        }
      ]
    });

    sendCreated(res, {
      siswa: siswaWithRelations,
      plainPassword: password // Return plain password untuk informasi admin
    }, 'Siswa berhasil ditambahkan');

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

/**
 * Update siswa
 * PUT /api/admin/siswa/:id
 */
const updateSiswa = catchAsync(async (req, res) => {
  const transaction = await db.sequelize.transaction();

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
      status,
      username,
      password
    } = req.body;

    const siswa = await db.Siswa.findByPk(id);
    if (!siswa) {
      throw new NotFoundError('Siswa tidak ditemukan');
    }

    // Update data siswa
    await siswa.update({
      nama_lengkap: nama_lengkap || siswa.nama_lengkap,
      jenis_kelamin: jenis_kelamin || siswa.jenis_kelamin,
      tanggal_lahir: tanggal_lahir || siswa.tanggal_lahir,
      alamat: alamat || siswa.alamat,
      nama_orang_tua: nama_orang_tua || siswa.nama_orang_tua,
      telepon_orang_tua: telepon_orang_tua || siswa.telepon_orang_tua,
      kelas_id: kelas_id !== undefined ? kelas_id : siswa.kelas_id,
      status: status === 1 || status === '1' ? 'aktif' : status === 0 || status === '0' ? 'tidak_aktif' : siswa.status
    }, { transaction });

    // Update user credentials if provided
    if (username || password) {
      const user = await db.User.findByPk(siswa.user_id);
      if (user) {
        const updateData = {};

        // Check jika username berubah
        if (username && username !== user.username) {
          // Cek duplikat username
          const existingUser = await db.User.findOne({ where: { username } });
          if (existingUser && existingUser.id !== user.id) {
            throw new ConflictError('Username sudah digunakan oleh user lain');
          }
          updateData.username = cleanString(username);
        }

        // Update password jika diisi
        if (password && password.length >= 6) {
          updateData.password = await hashPassword(password);
          updateData.plain_password = password; // Save plain password untuk admin
        }

        // Update is_active based on status
        updateData.is_active = status === 1 || status === '1' || status === 'aktif' ? true : false;

        await user.update(updateData, { transaction });
      }
    }

    await transaction.commit();

    // Fetch updated siswa dengan relasi
    const updatedSiswa = await db.Siswa.findByPk(id, {
      include: [
        {
          model: db.Kelas,
          as: 'kelas',
          attributes: ['id', 'nama_kelas', 'tingkat']
        },
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'username', 'plain_password', 'is_active']
        }
      ]
    });

    sendUpdated(res, updatedSiswa, 'Data siswa berhasil diupdate');

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

/**
 * Delete siswa (hard delete - permanently remove from database)
 * DELETE /api/admin/siswa/:id
 */
const deleteSiswa = catchAsync(async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const { id } = req.params;

    const siswa = await db.Siswa.findByPk(id);
    if (!siswa) {
      throw new NotFoundError('Siswa tidak ditemukan');
    }

    const userId = siswa.user_id;

    console.log(`Deleting siswa ID: ${id}, User ID: ${userId}`);

    // Step 1: Delete related records first (to avoid foreign key constraints)
    // Delete from pembayaran
    await db.Pembayaran.destroy({
      where: { siswa_id: id },
      transaction
    });

    // Delete from presensi
    await db.Presensi.destroy({
      where: { siswa_id: id },
      transaction
    });

    // Delete from rapor
    await db.Rapor.destroy({
      where: { siswa_id: id },
      transaction
    });

    // Step 2: Delete siswa record
    await siswa.destroy({ transaction });

    // Step 3: Delete user account
    if (userId) {
      await db.User.destroy({
        where: { id: userId },
        transaction
      });
    }

    await transaction.commit();

    console.log(`Successfully deleted siswa ID: ${id} and user ID: ${userId}`);
    sendDeleted(res, 'Siswa berhasil dihapus secara permanen dari database');

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

/**
 * Reset password siswa
 * PUT /api/admin/siswa/:id/reset-password
 */
const resetPasswordSiswa = catchAsync(async (req, res) => {
  const { id } = req.params;

  const siswa = await db.Siswa.findByPk(id);
  if (!siswa) {
    throw new NotFoundError('Siswa tidak ditemukan');
  }

  // Generate password baru
  const newPassword = generatePassword(8);
  const hashedPassword = await hashPassword(newPassword);

  // Update password di tabel users
  await db.User.update(
    { password: hashedPassword },
    { where: { id: siswa.user_id } }
  );

  sendSuccess(res, {
    username: `id_${siswa.nisn}`,
    new_password: newPassword
  }, 'Password berhasil direset');
});

module.exports = {
  getAllSiswa,
  getSiswaById,
  createSiswa,
  updateSiswa,
  deleteSiswa,
  resetPasswordSiswa
};
