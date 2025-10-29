// controllers/informasiUmumController.js
const db = require('../models');
const { Op } = require('sequelize');
const {
  getPagination,
  getPaginationMeta,
  formatDate,
  cleanString,
  successResponse,
  errorResponse
} = require('../utils/helper');

/**
 * Get all informasi umum dengan pagination dan filter
 * GET /api/admin/informasi-umum
 */
const getAllInformasiUmum = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      jenis = '',
      tanggal_mulai = '',
      tanggal_selesai = ''
    } = req.query;
    
    const { offset, limit: pageLimit } = getPagination(page, limit);

    // Build where clause
    const where = {};
    
    if (search) {
      where[Op.or] = [
        { judul: { [Op.like]: `%${search}%` } },
        { konten: { [Op.like]: `%${search}%` } }
      ];
    }

    if (jenis) {
      where.jenis = jenis;
    }

    // Filter tanggal
    if (tanggal_mulai && tanggal_selesai) {
      where.tanggal_mulai = {
        [Op.between]: [tanggal_mulai, tanggal_selesai]
      };
    }

    // Query dengan relasi
    const { count, rows } = await db.InformasiUmum.findAndCountAll({
      where,
      include: [
        {
          model: db.User,
          as: 'creator',
          attributes: ['id', 'username', 'role']
        }
      ],
      offset,
      limit: pageLimit,
      order: [['created_at', 'DESC']]
    });

    const pagination = getPaginationMeta(count, page, limit);

    successResponse(res, {
      informasi: rows,
      pagination
    }, 'Data informasi umum berhasil diambil');

  } catch (error) {
    console.error('Get all informasi umum error:', error);
    errorResponse(res, 'Gagal mengambil data informasi umum', 500);
  }
};

/**
 * Get informasi umum by jenis
 * GET /api/admin/informasi-umum/jenis/:jenis
 */
const getInformasiByJenis = async (req, res) => {
  try {
    const { jenis } = req.params;
    const { limit = 10 } = req.query;

    // Validasi jenis
    const jenisValid = ['event', 'libur', 'pengumuman'];
    if (!jenisValid.includes(jenis)) {
      return errorResponse(res, 'Jenis tidak valid (event/libur/pengumuman)', 400);
    }

    const informasi = await db.InformasiUmum.findAll({
      where: { jenis },
      include: [
        {
          model: db.User,
          as: 'creator',
          attributes: ['username']
        }
      ],
      limit: parseInt(limit),
      order: [['tanggal_mulai', 'DESC'], ['created_at', 'DESC']]
    });

    successResponse(res, informasi, `Data ${jenis} berhasil diambil`);

  } catch (error) {
    console.error('Get informasi by jenis error:', error);
    errorResponse(res, 'Gagal mengambil data informasi', 500);
  }
};

/**
 * Get informasi umum aktif (upcoming events & announcements)
 * GET /api/admin/informasi-umum/aktif
 */
const getInformasiAktif = async (req, res) => {
  try {
    const today = formatDate(new Date());

    // Get upcoming events dan libur
    const upcomingEvents = await db.InformasiUmum.findAll({
      where: {
        jenis: { [Op.in]: ['event', 'libur'] },
        tanggal_mulai: { [Op.gte]: today }
      },
      include: [
        {
          model: db.User,
          as: 'creator',
          attributes: ['username']
        }
      ],
      limit: 5,
      order: [['tanggal_mulai', 'ASC']]
    });

    // Get recent pengumuman (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentPengumuman = await db.InformasiUmum.findAll({
      where: {
        jenis: 'pengumuman',
        created_at: { [Op.gte]: thirtyDaysAgo }
      },
      include: [
        {
          model: db.User,
          as: 'creator',
          attributes: ['username']
        }
      ],
      limit: 5,
      order: [['created_at', 'DESC']]
    });

    successResponse(res, {
      upcoming_events: upcomingEvents,
      recent_pengumuman: recentPengumuman
    }, 'Data informasi aktif berhasil diambil');

  } catch (error) {
    console.error('Get informasi aktif error:', error);
    errorResponse(res, 'Gagal mengambil data informasi aktif', 500);
  }
};

/**
 * Get single informasi umum by ID
 * GET /api/admin/informasi-umum/:id
 */
const getInformasiById = async (req, res) => {
  try {
    const { id } = req.params;

    const informasi = await db.InformasiUmum.findByPk(id, {
      include: [
        {
          model: db.User,
          as: 'creator',
          attributes: ['id', 'username', 'role']
        }
      ]
    });

    if (!informasi) {
      return errorResponse(res, 'Informasi tidak ditemukan', 404);
    }

    successResponse(res, informasi, 'Data informasi berhasil diambil');

  } catch (error) {
    console.error('Get informasi by id error:', error);
    errorResponse(res, 'Gagal mengambil data informasi', 500);
  }
};

/**
 * Create informasi umum baru
 * POST /api/admin/informasi-umum
 */
const createInformasiUmum = async (req, res) => {
  try {
    const {
      judul,
      konten,
      jenis,
      tanggal_mulai,
      tanggal_selesai
    } = req.body;

    const created_by = req.user.id;

    // Validasi input
    if (!judul || !konten || !jenis) {
      return errorResponse(res, 'Judul, konten, dan jenis wajib diisi', 400);
    }

    // Validasi jenis
    const jenisValid = ['event', 'libur', 'pengumuman'];
    if (!jenisValid.includes(jenis)) {
      return errorResponse(res, 'Jenis tidak valid (event/libur/pengumuman)', 400);
    }

    // Untuk event dan libur, tanggal_mulai wajib diisi
    if ((jenis === 'event' || jenis === 'libur') && !tanggal_mulai) {
      return errorResponse(res, 'Tanggal mulai wajib diisi untuk event/libur', 400);
    }

    // Validasi tanggal
    if (tanggal_mulai && tanggal_selesai) {
      if (new Date(tanggal_selesai) < new Date(tanggal_mulai)) {
        return errorResponse(res, 'Tanggal selesai harus lebih besar atau sama dengan tanggal mulai', 400);
      }
    }

    // Create informasi
    const informasi = await db.InformasiUmum.create({
      judul: cleanString(judul),
      konten: cleanString(konten),
      jenis,
      tanggal_mulai: tanggal_mulai || null,
      tanggal_selesai: tanggal_selesai || null,
      created_by
    });

    // Get informasi with relations
    const informasiWithRelations = await db.InformasiUmum.findByPk(informasi.id, {
      include: [
        {
          model: db.User,
          as: 'creator',
          attributes: ['username']
        }
      ]
    });

    successResponse(res, informasiWithRelations, 'Informasi berhasil ditambahkan', 201);

  } catch (error) {
    console.error('Create informasi umum error:', error);
    errorResponse(res, 'Gagal menambahkan informasi', 500);
  }
};

/**
 * Update informasi umum
 * PUT /api/admin/informasi-umum/:id
 */
const updateInformasiUmum = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      judul,
      konten,
      jenis,
      tanggal_mulai,
      tanggal_selesai
    } = req.body;

    const informasi = await db.InformasiUmum.findByPk(id);
    if (!informasi) {
      return errorResponse(res, 'Informasi tidak ditemukan', 404);
    }

    // Validasi jenis jika diupdate
    if (jenis) {
      const jenisValid = ['event', 'libur', 'pengumuman'];
      if (!jenisValid.includes(jenis)) {
        return errorResponse(res, 'Jenis tidak valid', 400);
      }
    }

    // Validasi tanggal jika diupdate
    const newTanggalMulai = tanggal_mulai || informasi.tanggal_mulai;
    const newTanggalSelesai = tanggal_selesai || informasi.tanggal_selesai;

    if (newTanggalMulai && newTanggalSelesai) {
      if (new Date(newTanggalSelesai) < new Date(newTanggalMulai)) {
        return errorResponse(res, 'Tanggal selesai harus lebih besar atau sama dengan tanggal mulai', 400);
      }
    }

    // Update data
    await informasi.update({
      judul: judul ? cleanString(judul) : informasi.judul,
      konten: konten ? cleanString(konten) : informasi.konten,
      jenis: jenis || informasi.jenis,
      tanggal_mulai: tanggal_mulai !== undefined ? tanggal_mulai : informasi.tanggal_mulai,
      tanggal_selesai: tanggal_selesai !== undefined ? tanggal_selesai : informasi.tanggal_selesai
    });

    // Get updated informasi with relations
    const updatedInformasi = await db.InformasiUmum.findByPk(id, {
      include: [
        {
          model: db.User,
          as: 'creator',
          attributes: ['username']
        }
      ]
    });

    successResponse(res, updatedInformasi, 'Informasi berhasil diupdate');

  } catch (error) {
    console.error('Update informasi umum error:', error);
    errorResponse(res, 'Gagal mengupdate informasi', 500);
  }
};

/**
 * Delete informasi umum
 * DELETE /api/admin/informasi-umum/:id
 */
const deleteInformasiUmum = async (req, res) => {
  try {
    const { id } = req.params;

    const informasi = await db.InformasiUmum.findByPk(id);
    if (!informasi) {
      return errorResponse(res, 'Informasi tidak ditemukan', 404);
    }

    await informasi.destroy();

    successResponse(res, null, 'Informasi berhasil dihapus');

  } catch (error) {
    console.error('Delete informasi umum error:', error);
    errorResponse(res, 'Gagal menghapus informasi', 500);
  }
};

module.exports = {
  getAllInformasiUmum,
  getInformasiByJenis,
  getInformasiAktif,
  getInformasiById,
  createInformasiUmum,
  updateInformasiUmum,
  deleteInformasiUmum
};