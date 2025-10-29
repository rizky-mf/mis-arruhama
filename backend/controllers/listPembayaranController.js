// controllers/listPembayaranController.js
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
 * Get all list pembayaran dengan pagination dan filter
 * GET /api/admin/list-pembayaran
 */
const getAllListPembayaran = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', periode = '', tingkat = '', status = 'aktif' } = req.query;
    const { offset, limit: pageLimit } = getPagination(page, limit);

    // Build where clause
    const where = {};
    
    if (search) {
      where.nama_pembayaran = { [Op.like]: `%${search}%` };
    }

    if (periode) {
      where.periode = periode;
    }

    if (tingkat) {
      where.tingkat = tingkat;
    }

    if (status) {
      where.status = status;
    }

    // Query dengan pagination
    const { count, rows } = await db.ListPembayaran.findAndCountAll({
      where,
      offset,
      limit: pageLimit,
      order: [['created_at', 'DESC']]
    });

    const pagination = getPaginationMeta(count, page, limit);

    successResponse(res, {
      list_pembayaran: rows,
      pagination
    }, 'Data list pembayaran berhasil diambil');

  } catch (error) {
    console.error('Get all list pembayaran error:', error);
    errorResponse(res, 'Gagal mengambil data list pembayaran', 500);
  }
};

/**
 * Get single list pembayaran by ID
 * GET /api/admin/list-pembayaran/:id
 */
const getListPembayaranById = async (req, res) => {
  try {
    const { id } = req.params;

    const listPembayaran = await db.ListPembayaran.findByPk(id, {
      include: [
        {
          model: db.Pembayaran,
          as: 'transaksi',
          attributes: ['id', 'siswa_id', 'jumlah_bayar', 'status', 'tanggal_bayar'],
          limit: 10,
          order: [['tanggal_bayar', 'DESC']]
        }
      ]
    });

    if (!listPembayaran) {
      return errorResponse(res, 'List pembayaran tidak ditemukan', 404);
    }

    successResponse(res, listPembayaran, 'Data list pembayaran berhasil diambil');

  } catch (error) {
    console.error('Get list pembayaran by id error:', error);
    errorResponse(res, 'Gagal mengambil data list pembayaran', 500);
  }
};

/**
 * Create list pembayaran baru
 * POST /api/admin/list-pembayaran
 */
const createListPembayaran = async (req, res) => {
  try {
    const {
      nama_pembayaran,
      nominal,
      periode,
      tingkat,
      deskripsi
    } = req.body;

    // Validasi input
    if (!nama_pembayaran || !nominal || !periode) {
      return errorResponse(res, 'Nama pembayaran, nominal, dan periode wajib diisi', 400);
    }

    // Validasi periode
    const periodeValid = ['bulanan', 'semester', 'tahunan'];
    if (!periodeValid.includes(periode)) {
      return errorResponse(res, 'Periode harus: bulanan, semester, atau tahunan', 400);
    }

    // Validasi nominal
    if (parseFloat(nominal) <= 0) {
      return errorResponse(res, 'Nominal harus lebih dari 0', 400);
    }

    // Validasi tingkat (0 = semua tingkat, 1-6 = tingkat tertentu)
    if (tingkat && (tingkat < 0 || tingkat > 6)) {
      return errorResponse(res, 'Tingkat harus antara 0-6', 400);
    }

    // Create list pembayaran
    const listPembayaran = await db.ListPembayaran.create({
      nama_pembayaran: cleanString(nama_pembayaran),
      nominal: parseFloat(nominal),
      periode,
      tingkat: tingkat || 0,
      deskripsi: deskripsi || null,
      status: 'aktif'
    });

    successResponse(res, listPembayaran, 'List pembayaran berhasil ditambahkan', 201);

  } catch (error) {
    console.error('Create list pembayaran error:', error);
    errorResponse(res, 'Gagal menambahkan list pembayaran', 500);
  }
};

/**
 * Update list pembayaran
 * PUT /api/admin/list-pembayaran/:id
 */
const updateListPembayaran = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nama_pembayaran,
      nominal,
      periode,
      tingkat,
      deskripsi,
      status
    } = req.body;

    const listPembayaran = await db.ListPembayaran.findByPk(id);
    if (!listPembayaran) {
      return errorResponse(res, 'List pembayaran tidak ditemukan', 404);
    }

    // Validasi periode jika diupdate
    if (periode) {
      const periodeValid = ['bulanan', 'semester', 'tahunan'];
      if (!periodeValid.includes(periode)) {
        return errorResponse(res, 'Periode harus: bulanan, semester, atau tahunan', 400);
      }
    }

    // Validasi nominal jika diupdate
    if (nominal && parseFloat(nominal) <= 0) {
      return errorResponse(res, 'Nominal harus lebih dari 0', 400);
    }

    // Validasi tingkat jika diupdate
    if (tingkat !== undefined && (tingkat < 0 || tingkat > 6)) {
      return errorResponse(res, 'Tingkat harus antara 0-6', 400);
    }

    // Validasi status jika diupdate
    if (status) {
      const statusValid = ['aktif', 'nonaktif'];
      if (!statusValid.includes(status)) {
        return errorResponse(res, 'Status harus: aktif atau nonaktif', 400);
      }
    }

    // Update data
    await listPembayaran.update({
      nama_pembayaran: nama_pembayaran ? cleanString(nama_pembayaran) : listPembayaran.nama_pembayaran,
      nominal: nominal ? parseFloat(nominal) : listPembayaran.nominal,
      periode: periode || listPembayaran.periode,
      tingkat: tingkat !== undefined ? tingkat : listPembayaran.tingkat,
      deskripsi: deskripsi !== undefined ? deskripsi : listPembayaran.deskripsi,
      status: status || listPembayaran.status
    });

    successResponse(res, listPembayaran, 'List pembayaran berhasil diupdate');

  } catch (error) {
    console.error('Update list pembayaran error:', error);
    errorResponse(res, 'Gagal mengupdate list pembayaran', 500);
  }
};

/**
 * Delete list pembayaran
 * DELETE /api/admin/list-pembayaran/:id
 */
const deleteListPembayaran = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { id } = req.params;

    const listPembayaran = await db.ListPembayaran.findByPk(id);
    if (!listPembayaran) {
      return errorResponse(res, 'List pembayaran tidak ditemukan', 404);
    }

    // Cek apakah masih ada transaksi pembayaran
    const transaksiCount = await db.Pembayaran.count({ 
      where: { list_pembayaran_id: id } 
    });
    
    if (transaksiCount > 0) {
      return errorResponse(res, 'List pembayaran masih memiliki transaksi. Tidak dapat dihapus.', 400);
    }

    // Delete list pembayaran
    await listPembayaran.destroy({ transaction });

    await transaction.commit();

    successResponse(res, null, 'List pembayaran berhasil dihapus');

  } catch (error) {
    await transaction.rollback();
    console.error('Delete list pembayaran error:', error);
    errorResponse(res, 'Gagal menghapus list pembayaran', 500);
  }
};

/**
 * Toggle status list pembayaran (aktif/nonaktif)
 * PUT /api/admin/list-pembayaran/:id/toggle-status
 */
const toggleStatusListPembayaran = async (req, res) => {
  try {
    const { id } = req.params;

    const listPembayaran = await db.ListPembayaran.findByPk(id);
    if (!listPembayaran) {
      return errorResponse(res, 'List pembayaran tidak ditemukan', 404);
    }

    // Toggle status
    const newStatus = listPembayaran.status === 'aktif' ? 'nonaktif' : 'aktif';
    await listPembayaran.update({ status: newStatus });

    successResponse(res, listPembayaran, `List pembayaran berhasil diubah menjadi ${newStatus}`);

  } catch (error) {
    console.error('Toggle status error:', error);
    errorResponse(res, 'Gagal mengubah status list pembayaran', 500);
  }
};

/**
 * Get list pembayaran by tingkat
 * GET /api/admin/list-pembayaran/tingkat/:tingkat
 */
const getListPembayaranByTingkat = async (req, res) => {
  try {
    const { tingkat } = req.params;

    // Validasi tingkat
    if (tingkat < 1 || tingkat > 6) {
      return errorResponse(res, 'Tingkat harus antara 1-6', 400);
    }

    // Ambil list pembayaran untuk tingkat tertentu atau tingkat 0 (semua tingkat)
    const listPembayaran = await db.ListPembayaran.findAll({
      where: {
        [Op.or]: [
          { tingkat: tingkat },
          { tingkat: 0 } // Pembayaran untuk semua tingkat
        ],
        status: 'aktif'
      },
      order: [['nama_pembayaran', 'ASC']]
    });

    successResponse(res, listPembayaran, `Data list pembayaran tingkat ${tingkat} berhasil diambil`);

  } catch (error) {
    console.error('Get list pembayaran by tingkat error:', error);
    errorResponse(res, 'Gagal mengambil data list pembayaran', 500);
  }
};

module.exports = {
  getAllListPembayaran,
  getListPembayaranById,
  createListPembayaran,
  updateListPembayaran,
  deleteListPembayaran,
  toggleStatusListPembayaran,
  getListPembayaranByTingkat
};