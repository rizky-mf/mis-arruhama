// controllers/mataPelajaranController.js
const db = require('../models');
const { Op } = require('sequelize');
const {
  getPagination,
  getPaginationMeta,
  cleanString,
  successResponse,
  errorResponse
} = require('../utils/helper');

/**
 * Get all mata pelajaran dengan pagination dan filter
 * GET /api/admin/mata-pelajaran
 */
const getAllMataPelajaran = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', tingkat = '' } = req.query;
    const { offset, limit: pageLimit } = getPagination(page, limit);

    // Build where clause
    const where = {};
    
    if (search) {
      where[Op.or] = [
        { kode_mapel: { [Op.like]: `%${search}%` } },
        { nama_mapel: { [Op.like]: `%${search}%` } }
      ];
    }

    if (tingkat) {
      where.tingkat = tingkat;
    }

    // Query dengan pagination
    const { count, rows } = await db.MataPelajaran.findAndCountAll({
      where,
      offset,
      limit: pageLimit,
      order: [['tingkat', 'ASC'], ['nama_mapel', 'ASC']]
    });

    const pagination = getPaginationMeta(count, page, limit);

    successResponse(res, {
      mata_pelajaran: rows,
      pagination
    }, 'Data mata pelajaran berhasil diambil');

  } catch (error) {
    console.error('Get all mata pelajaran error:', error);
    errorResponse(res, 'Gagal mengambil data mata pelajaran', 500);
  }
};

/**
 * Get single mata pelajaran by ID
 * GET /api/admin/mata-pelajaran/:id
 */
const getMataPelajaranById = async (req, res) => {
  try {
    const { id } = req.params;

    const mataPelajaran = await db.MataPelajaran.findByPk(id, {
      include: [
        {
          model: db.JadwalPelajaran,
          as: 'jadwal',
          attributes: ['id', 'hari', 'jam_mulai', 'jam_selesai'],
          include: [
            {
              model: db.Kelas,
              as: 'kelas',
              attributes: ['nama_kelas', 'tingkat']
            },
            {
              model: db.Guru,
              as: 'guru',
              attributes: ['nama_lengkap']
            }
          ]
        }
      ]
    });

    if (!mataPelajaran) {
      return errorResponse(res, 'Mata pelajaran tidak ditemukan', 404);
    }

    successResponse(res, mataPelajaran, 'Data mata pelajaran berhasil diambil');

  } catch (error) {
    console.error('Get mata pelajaran by id error:', error);
    errorResponse(res, 'Gagal mengambil data mata pelajaran', 500);
  }
};

/**
 * Create mata pelajaran baru
 * POST /api/admin/mata-pelajaran
 */
const createMataPelajaran = async (req, res) => {
  try {
    const {
      kode_mapel,
      nama_mapel,
      tingkat,
      deskripsi
    } = req.body;

    // Validasi input
    if (!kode_mapel || !nama_mapel) {
      return errorResponse(res, 'Kode dan nama mata pelajaran wajib diisi', 400);
    }

    // Validasi tingkat (0 = semua tingkat, 1-6 = tingkat tertentu)
    if (tingkat && (tingkat < 0 || tingkat > 6)) {
      return errorResponse(res, 'Tingkat harus antara 0-6', 400);
    }

    // Cek duplikat kode_mapel
    const existing = await db.MataPelajaran.findOne({ 
      where: { kode_mapel: cleanString(kode_mapel) } 
    });
    
    if (existing) {
      return errorResponse(res, 'Kode mata pelajaran sudah terdaftar', 400);
    }

    // Create mata pelajaran
    const mataPelajaran = await db.MataPelajaran.create({
      kode_mapel: cleanString(kode_mapel).toUpperCase(),
      nama_mapel: cleanString(nama_mapel),
      tingkat: tingkat || 0,
      deskripsi: deskripsi || null
    });

    successResponse(res, mataPelajaran, 'Mata pelajaran berhasil ditambahkan', 201);

  } catch (error) {
    console.error('Create mata pelajaran error:', error);
    errorResponse(res, 'Gagal menambahkan mata pelajaran', 500);
  }
};

/**
 * Update mata pelajaran
 * PUT /api/admin/mata-pelajaran/:id
 */
const updateMataPelajaran = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nama_mapel,
      tingkat,
      deskripsi
    } = req.body;

    const mataPelajaran = await db.MataPelajaran.findByPk(id);
    if (!mataPelajaran) {
      return errorResponse(res, 'Mata pelajaran tidak ditemukan', 404);
    }

    // Validasi tingkat jika diupdate
    if (tingkat !== undefined && (tingkat < 0 || tingkat > 6)) {
      return errorResponse(res, 'Tingkat harus antara 0-6', 400);
    }

    // Update data
    await mataPelajaran.update({
      nama_mapel: nama_mapel ? cleanString(nama_mapel) : mataPelajaran.nama_mapel,
      tingkat: tingkat !== undefined ? tingkat : mataPelajaran.tingkat,
      deskripsi: deskripsi !== undefined ? deskripsi : mataPelajaran.deskripsi
    });

    successResponse(res, mataPelajaran, 'Mata pelajaran berhasil diupdate');

  } catch (error) {
    console.error('Update mata pelajaran error:', error);
    errorResponse(res, 'Gagal mengupdate mata pelajaran', 500);
  }
};

/**
 * Delete mata pelajaran
 * DELETE /api/admin/mata-pelajaran/:id
 */
const deleteMataPelajaran = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { id } = req.params;

    const mataPelajaran = await db.MataPelajaran.findByPk(id);
    if (!mataPelajaran) {
      return errorResponse(res, 'Mata pelajaran tidak ditemukan', 404);
    }

    // Cek apakah masih ada jadwal pelajaran
    const jadwalCount = await db.JadwalPelajaran.count({ 
      where: { mata_pelajaran_id: id } 
    });
    
    if (jadwalCount > 0) {
      return errorResponse(res, 'Mata pelajaran masih digunakan di jadwal. Hapus jadwal terlebih dahulu.', 400);
    }

    // Cek apakah masih ada rapor
    const raporCount = await db.Rapor.count({ 
      where: { mata_pelajaran_id: id } 
    });
    
    if (raporCount > 0) {
      return errorResponse(res, 'Mata pelajaran masih memiliki data nilai. Tidak dapat dihapus.', 400);
    }

    // Delete mata pelajaran
    await mataPelajaran.destroy({ transaction });

    await transaction.commit();

    successResponse(res, null, 'Mata pelajaran berhasil dihapus');

  } catch (error) {
    await transaction.rollback();
    console.error('Delete mata pelajaran error:', error);
    errorResponse(res, 'Gagal menghapus mata pelajaran', 500);
  }
};

/**
 * Get mata pelajaran by tingkat
 * GET /api/admin/mata-pelajaran/tingkat/:tingkat
 */
const getMataPelajaranByTingkat = async (req, res) => {
  try {
    const { tingkat } = req.params;

    // Validasi tingkat
    if (tingkat < 1 || tingkat > 6) {
      return errorResponse(res, 'Tingkat harus antara 1-6', 400);
    }

    // Ambil mapel untuk tingkat tertentu atau tingkat 0 (semua tingkat)
    const mataPelajaran = await db.MataPelajaran.findAll({
      where: {
        [Op.or]: [
          { tingkat: tingkat },
          { tingkat: 0 } // Mapel untuk semua tingkat
        ]
      },
      order: [['nama_mapel', 'ASC']]
    });

    successResponse(res, mataPelajaran, `Data mata pelajaran tingkat ${tingkat} berhasil diambil`);

  } catch (error) {
    console.error('Get mata pelajaran by tingkat error:', error);
    errorResponse(res, 'Gagal mengambil data mata pelajaran', 500);
  }
};

module.exports = {
  getAllMataPelajaran,
  getMataPelajaranById,
  createMataPelajaran,
  updateMataPelajaran,
  deleteMataPelajaran,
  getMataPelajaranByTingkat
};