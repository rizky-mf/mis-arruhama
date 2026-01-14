// controllers/listPembayaranController.js
const db = require('../models');
const { Op } = require('sequelize');
const { getPagination, getPaginationMeta, cleanString } = require('../utils/helper');
const { sendSuccess, sendCreated, sendUpdated, sendDeleted } = require('../utils/response');
const { catchAsync, NotFoundError, BadRequestError } = require('../utils/errorHandler');

/**
 * Get all list pembayaran dengan pagination dan filter
 * GET /api/admin/list-pembayaran
 */
const getAllListPembayaran = catchAsync(async (req, res) => {
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

  sendSuccess(res, {
    list_pembayaran: rows,
    pagination
  }, 'Data list pembayaran berhasil diambil');
});

/**
 * Get single list pembayaran by ID
 * GET /api/admin/list-pembayaran/:id
 */
const getListPembayaranById = catchAsync(async (req, res) => {
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
    throw new NotFoundError('List pembayaran tidak ditemukan');
  }

  sendSuccess(res, listPembayaran, 'Data list pembayaran berhasil diambil');
});

/**
 * Create list pembayaran baru
 * POST /api/admin/list-pembayaran
 */
const createListPembayaran = catchAsync(async (req, res) => {
  const {
    nama_pembayaran,
    nominal,
    periode,
    tingkat,
    deskripsi
  } = req.body;

  // Validasi input
  if (!nama_pembayaran || !nominal || !periode) {
    throw new BadRequestError('Nama pembayaran, nominal, dan periode wajib diisi');
  }

  // Validasi periode
  const periodeValid = ['bulanan', 'semester', 'tahunan'];
  if (!periodeValid.includes(periode)) {
    throw new BadRequestError('Periode harus: bulanan, semester, atau tahunan');
  }

  // Validasi nominal
  if (parseFloat(nominal) <= 0) {
    throw new BadRequestError('Nominal harus lebih dari 0');
  }

  // Validasi tingkat (0 = semua tingkat, 1-6 = tingkat tertentu)
  if (tingkat && (tingkat < 0 || tingkat > 6)) {
    throw new BadRequestError('Tingkat harus antara 0-6');
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

  sendCreated(res, listPembayaran, 'List pembayaran berhasil ditambahkan');
});

/**
 * Update list pembayaran
 * PUT /api/admin/list-pembayaran/:id
 */
const updateListPembayaran = catchAsync(async (req, res) => {
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
    throw new NotFoundError('List pembayaran tidak ditemukan');
  }

  // Validasi periode jika diupdate
  if (periode) {
    const periodeValid = ['bulanan', 'semester', 'tahunan'];
    if (!periodeValid.includes(periode)) {
      throw new BadRequestError('Periode harus: bulanan, semester, atau tahunan');
    }
  }

  // Validasi nominal jika diupdate
  if (nominal && parseFloat(nominal) <= 0) {
    throw new BadRequestError('Nominal harus lebih dari 0');
  }

  // Validasi tingkat jika diupdate
  if (tingkat !== undefined && (tingkat < 0 || tingkat > 6)) {
    throw new BadRequestError('Tingkat harus antara 0-6');
  }

  // Validasi status jika diupdate
  if (status) {
    const statusValid = ['aktif', 'nonaktif'];
    if (!statusValid.includes(status)) {
      throw new BadRequestError('Status harus: aktif atau nonaktif');
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

  sendUpdated(res, listPembayaran, 'List pembayaran berhasil diupdate');
});

/**
 * Delete list pembayaran
 * DELETE /api/admin/list-pembayaran/:id
 */
const deleteListPembayaran = catchAsync(async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const { id } = req.params;

    const listPembayaran = await db.ListPembayaran.findByPk(id);
    if (!listPembayaran) {
      throw new NotFoundError('List pembayaran tidak ditemukan');
    }

    // Cek apakah masih ada transaksi pembayaran
    const transaksiCount = await db.Pembayaran.count({
      where: { list_pembayaran_id: id }
    });

    if (transaksiCount > 0) {
      throw new BadRequestError('List pembayaran masih memiliki transaksi. Tidak dapat dihapus.');
    }

    // Delete list pembayaran
    await listPembayaran.destroy({ transaction });

    await transaction.commit();

    sendDeleted(res, 'List pembayaran berhasil dihapus');

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

/**
 * Toggle status list pembayaran (aktif/nonaktif)
 * PUT /api/admin/list-pembayaran/:id/toggle-status
 */
const toggleStatusListPembayaran = catchAsync(async (req, res) => {
  const { id } = req.params;

  const listPembayaran = await db.ListPembayaran.findByPk(id);
  if (!listPembayaran) {
    throw new NotFoundError('List pembayaran tidak ditemukan');
  }

  // Toggle status
  const newStatus = listPembayaran.status === 'aktif' ? 'nonaktif' : 'aktif';
  await listPembayaran.update({ status: newStatus });

  sendSuccess(res, listPembayaran, `List pembayaran berhasil diubah menjadi ${newStatus}`);
});

/**
 * Get list pembayaran by tingkat
 * GET /api/admin/list-pembayaran/tingkat/:tingkat
 */
const getListPembayaranByTingkat = catchAsync(async (req, res) => {
  const { tingkat } = req.params;

  // Validasi tingkat
  if (tingkat < 1 || tingkat > 6) {
    throw new BadRequestError('Tingkat harus antara 1-6');
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

  sendSuccess(res, listPembayaran, `Data list pembayaran tingkat ${tingkat} berhasil diambil`);
});

module.exports = {
  getAllListPembayaran,
  getListPembayaranById,
  createListPembayaran,
  updateListPembayaran,
  deleteListPembayaran,
  toggleStatusListPembayaran,
  getListPembayaranByTingkat
};
