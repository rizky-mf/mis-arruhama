// controllers/kelasController.js
const db = require('../models');
const { Op } = require('sequelize');
const { getPagination, getPaginationMeta, cleanString } = require('../utils/helper');
const { sendSuccess, sendCreated, sendUpdated, sendDeleted, sendNotFound, sendError } = require('../utils/response');
const { catchAsync, NotFoundError, BadRequestError, ConflictError } = require('../utils/errorHandler');

/**
 * Get all kelas dengan pagination dan filter
 * GET /api/admin/kelas
 */
const getAllKelas = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, search = '', tingkat = '', tahun_ajaran = '' } = req.query;
  const { offset, limit: pageLimit } = getPagination(page, limit);

  // Build where clause
  const where = {};

  if (search) {
    where.nama_kelas = { [Op.like]: `%${search}%` };
  }

  if (tingkat) {
    where.tingkat = tingkat;
  }

  if (tahun_ajaran) {
    where.tahun_ajaran = tahun_ajaran;
  }

  // Query dengan relasi
  const { count, rows } = await db.Kelas.findAndCountAll({
    where,
    include: [
      {
        model: db.Guru,
        as: 'wali_kelas',
        attributes: ['id', 'nip', 'nama_lengkap', 'telepon']
      },
      {
        model: db.Siswa,
        as: 'siswa',
        attributes: ['id'],
        separate: true // Untuk count siswa
      }
    ],
    offset,
    limit: pageLimit,
    order: [['tingkat', 'ASC'], ['nama_kelas', 'ASC']]
  });

  // Add siswa count to each kelas
  const kelasWithCount = rows.map(kelas => {
    const kelasData = kelas.toJSON();
    kelasData.jumlah_siswa = kelasData.siswa ? kelasData.siswa.length : 0;
    delete kelasData.siswa; // Remove siswa array, only keep count
    return kelasData;
  });

  const pagination = getPaginationMeta(count, page, limit);

  sendSuccess(res, {
    kelas: kelasWithCount,
    pagination
  }, 'Data kelas berhasil diambil');
});

/**
 * Get single kelas by ID
 * GET /api/admin/kelas/:id
 */
const getKelasById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const kelas = await db.Kelas.findByPk(id, {
    include: [
      {
        model: db.Guru,
        as: 'wali_kelas',
        attributes: ['id', 'nip', 'nama_lengkap', 'telepon', 'email']
      },
      {
        model: db.Siswa,
        as: 'siswa',
        attributes: ['id', 'nisn', 'nama_lengkap', 'jenis_kelamin', 'status'],
        order: [['nama_lengkap', 'ASC']]
      },
      {
        model: db.JadwalPelajaran,
        as: 'jadwal_pelajaran',
        attributes: ['id', 'hari', 'jam_mulai', 'jam_selesai'],
        include: [
          {
            model: db.MataPelajaran,
            as: 'mataPelajaran',
            attributes: ['nama_mapel']
          },
          {
            model: db.Guru,
            as: 'guru',
            attributes: ['nama_lengkap']
          }
        ],
        order: [['hari', 'ASC'], ['jam_mulai', 'ASC']]
      }
    ]
  });

  if (!kelas) {
    throw new NotFoundError('Kelas tidak ditemukan');
  }

  sendSuccess(res, kelas, 'Data kelas berhasil diambil');
});

/**
 * Create kelas baru
 * POST /api/admin/kelas
 */
const createKelas = catchAsync(async (req, res) => {
  const {
    nama_kelas,
    tingkat,
    guru_id,
    tahun_ajaran
  } = req.body;

  // Validasi input
  if (!nama_kelas || !tingkat || !tahun_ajaran) {
    throw new BadRequestError('Nama kelas, tingkat, dan tahun ajaran wajib diisi');
  }

  // Validasi tingkat (1-6)
  if (tingkat < 1 || tingkat > 6) {
    throw new BadRequestError('Tingkat harus antara 1-6');
  }

  // Cek duplikat nama kelas di tahun ajaran yang sama
  const existingKelas = await db.Kelas.findOne({
    where: {
      nama_kelas: cleanString(nama_kelas),
      tahun_ajaran
    }
  });

  if (existingKelas) {
    throw new ConflictError('Nama kelas sudah ada di tahun ajaran ini');
  }

  // Jika ada guru_id, validasi guru exists
  if (guru_id) {
    const guru = await db.Guru.findByPk(guru_id);
    if (!guru) {
      throw new NotFoundError('Guru tidak ditemukan');
    }
  }

  // Create kelas
  const kelas = await db.Kelas.create({
    nama_kelas: cleanString(nama_kelas),
    tingkat: parseInt(tingkat),
    guru_id: guru_id || null,
    tahun_ajaran: cleanString(tahun_ajaran)
  });

  // Get kelas with relations
  const kelasWithRelations = await db.Kelas.findByPk(kelas.id, {
    include: [
      {
        model: db.Guru,
        as: 'wali_kelas',
        attributes: ['id', 'nama_lengkap']
      }
    ]
  });

  sendCreated(res, kelasWithRelations, 'Kelas berhasil ditambahkan');
});

/**
 * Update kelas
 * PUT /api/admin/kelas/:id
 */
const updateKelas = catchAsync(async (req, res) => {
  const { id } = req.params;
  const {
    nama_kelas,
    tingkat,
    guru_id,
    tahun_ajaran
  } = req.body;

  const kelas = await db.Kelas.findByPk(id);
  if (!kelas) {
    throw new NotFoundError('Kelas tidak ditemukan');
  }

  // Validasi tingkat jika diupdate
  if (tingkat && (tingkat < 1 || tingkat > 6)) {
    throw new BadRequestError('Tingkat harus antara 1-6');
  }

  // Jika update guru_id, validasi guru exists
  if (guru_id !== undefined && guru_id !== null) {
    const guru = await db.Guru.findByPk(guru_id);
    if (!guru) {
      throw new NotFoundError('Guru tidak ditemukan');
    }
  }

  // Cek duplikat nama kelas (jika nama_kelas atau tahun_ajaran berubah)
  if (nama_kelas || tahun_ajaran) {
    const newNamaKelas = nama_kelas ? cleanString(nama_kelas) : kelas.nama_kelas;
    const newTahunAjaran = tahun_ajaran || kelas.tahun_ajaran;

    if (newNamaKelas !== kelas.nama_kelas || newTahunAjaran !== kelas.tahun_ajaran) {
      const existingKelas = await db.Kelas.findOne({
        where: {
          nama_kelas: newNamaKelas,
          tahun_ajaran: newTahunAjaran,
          id: { [Op.ne]: id }
        }
      });

      if (existingKelas) {
        throw new ConflictError('Nama kelas sudah ada di tahun ajaran ini');
      }
    }
  }

  // Update data
  await kelas.update({
    nama_kelas: nama_kelas ? cleanString(nama_kelas) : kelas.nama_kelas,
    tingkat: tingkat || kelas.tingkat,
    guru_id: guru_id !== undefined ? guru_id : kelas.guru_id,
    tahun_ajaran: tahun_ajaran || kelas.tahun_ajaran
  });

  // Get updated kelas with relations
  const updatedKelas = await db.Kelas.findByPk(id, {
    include: [
      {
        model: db.Guru,
        as: 'wali_kelas',
        attributes: ['id', 'nama_lengkap']
      }
    ]
  });

  sendUpdated(res, updatedKelas, 'Data kelas berhasil diupdate');
});

/**
 * Delete kelas
 * DELETE /api/admin/kelas/:id
 */
const deleteKelas = catchAsync(async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const { id } = req.params;

    const kelas = await db.Kelas.findByPk(id);
    if (!kelas) {
      throw new NotFoundError('Kelas tidak ditemukan');
    }

    // Cek apakah masih ada siswa di kelas ini
    const siswaCount = await db.Siswa.count({ where: { kelas_id: id } });
    if (siswaCount > 0) {
      throw new BadRequestError(`Kelas masih memiliki ${siswaCount} siswa. Pindahkan siswa terlebih dahulu.`);
    }

    // Cek apakah masih ada jadwal pelajaran
    const jadwalCount = await db.JadwalPelajaran.count({ where: { kelas_id: id } });
    if (jadwalCount > 0) {
      throw new BadRequestError('Kelas masih memiliki jadwal pelajaran. Hapus jadwal terlebih dahulu.');
    }

    // Delete kelas
    await kelas.destroy({ transaction });

    await transaction.commit();

    sendDeleted(res, 'Kelas berhasil dihapus');

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

/**
 * Get siswa by kelas
 * GET /api/admin/kelas/:id/siswa
 */
const getSiswaByKelas = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status = 'aktif' } = req.query;

  const kelas = await db.Kelas.findByPk(id);
  if (!kelas) {
    throw new NotFoundError('Kelas tidak ditemukan');
  }

  const where = { kelas_id: id };
  if (status) {
    where.status = status;
  }

  const siswa = await db.Siswa.findAll({
    where,
    attributes: ['id', 'nisn', 'nama_lengkap', 'jenis_kelamin', 'status'],
    include: [
      {
        model: db.User,
        as: 'user',
        attributes: ['username', 'is_active']
      }
    ],
    order: [['nama_lengkap', 'ASC']]
  });

  sendSuccess(res, {
    kelas: {
      id: kelas.id,
      nama_kelas: kelas.nama_kelas,
      tingkat: kelas.tingkat
    },
    jumlah_siswa: siswa.length,
    siswa
  }, 'Data siswa berhasil diambil');
});

/**
 * Assign siswa ke kelas (bulk)
 * POST /api/admin/kelas/:id/siswa
 */
const assignSiswaToKelas = catchAsync(async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const { id } = req.params;
    const { siswa_ids } = req.body; // Array of siswa IDs

    if (!siswa_ids || !Array.isArray(siswa_ids) || siswa_ids.length === 0) {
      throw new BadRequestError('siswa_ids harus berupa array dan tidak boleh kosong');
    }

    const kelas = await db.Kelas.findByPk(id);
    if (!kelas) {
      throw new NotFoundError('Kelas tidak ditemukan');
    }

    // Update siswa kelas_id
    const [updatedCount] = await db.Siswa.update(
      { kelas_id: id },
      {
        where: {
          id: { [Op.in]: siswa_ids }
        },
        transaction
      }
    );

    await transaction.commit();

    sendSuccess(res, {
      updated_count: updatedCount,
      kelas: {
        id: kelas.id,
        nama_kelas: kelas.nama_kelas
      }
    }, `${updatedCount} siswa berhasil di-assign ke kelas ${kelas.nama_kelas}`);

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

/**
 * Remove siswa dari kelas (set kelas_id = null)
 * DELETE /api/admin/kelas/:id/siswa/:siswa_id
 */
const removeSiswaFromKelas = catchAsync(async (req, res) => {
  const { id, siswa_id } = req.params;

  const siswa = await db.Siswa.findOne({
    where: {
      id: siswa_id,
      kelas_id: id
    }
  });

  if (!siswa) {
    throw new NotFoundError('Siswa tidak ditemukan di kelas ini');
  }

  // Set kelas_id = null
  await siswa.update({ kelas_id: null });

  sendSuccess(res, null, 'Siswa berhasil dikeluarkan dari kelas');
});

module.exports = {
  getAllKelas,
  getKelasById,
  createKelas,
  updateKelas,
  deleteKelas,
  getSiswaByKelas,
  assignSiswaToKelas,
  removeSiswaFromKelas
};
