// controllers/pembayaranController.js
const db = require('../models');
const { Op } = require('sequelize');
const {
  getPagination,
  getPaginationMeta,
  formatDate,
  successResponse,
  errorResponse
} = require('../utils/helper');

/**
 * Get all pembayaran dengan pagination dan filter
 * GET /api/admin/pembayaran
 */
const getAllPembayaran = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      siswa_id = '',
      list_pembayaran_id = '',
      status = '',
      tanggal_mulai = '',
      tanggal_selesai = ''
    } = req.query;
    
    const { offset, limit: pageLimit } = getPagination(page, limit);

    // Build where clause
    const where = {};
    
    if (siswa_id) where.siswa_id = siswa_id;
    if (list_pembayaran_id) where.list_pembayaran_id = list_pembayaran_id;
    if (status) where.status = status;
    
    // Filter tanggal
    if (tanggal_mulai && tanggal_selesai) {
      where.tanggal_bayar = {
        [Op.between]: [tanggal_mulai, tanggal_selesai]
      };
    } else if (tanggal_mulai) {
      where.tanggal_bayar = {
        [Op.gte]: tanggal_mulai
      };
    } else if (tanggal_selesai) {
      where.tanggal_bayar = {
        [Op.lte]: tanggal_selesai
      };
    }

    // Query dengan relasi
    const { count, rows } = await db.Pembayaran.findAndCountAll({
      where,
      include: [
        {
          model: db.Siswa,
          as: 'siswa',
          attributes: ['id', 'nisn', 'nama_lengkap'],
          include: [
            {
              model: db.Kelas,
              as: 'kelas',
              attributes: ['nama_kelas', 'tingkat']
            }
          ]
        },
        {
          model: db.ListPembayaran,
          as: 'jenis_pembayaran',
          attributes: ['id', 'nama_pembayaran', 'nominal', 'periode']
        },
        {
          model: db.User,
          as: 'approver',
          attributes: ['username', 'role']
        }
      ],
      offset,
      limit: pageLimit,
      order: [['tanggal_bayar', 'DESC'], ['created_at', 'DESC']]
    });

    const pagination = getPaginationMeta(count, page, limit);

    successResponse(res, {
      pembayaran: rows,
      pagination
    }, 'Data pembayaran berhasil diambil');

  } catch (error) {
    console.error('Get all pembayaran error:', error);
    errorResponse(res, 'Gagal mengambil data pembayaran', 500);
  }
};

/**
 * Get pembayaran by siswa
 * GET /api/admin/pembayaran/siswa/:siswa_id
 */
const getPembayaranBySiswa = async (req, res) => {
  try {
    const { siswa_id } = req.params;
    const { status, tahun } = req.query;

    // Cek siswa exists
    const siswa = await db.Siswa.findByPk(siswa_id, {
      attributes: ['id', 'nisn', 'nama_lengkap', 'status'],
      include: [
        {
          model: db.Kelas,
          as: 'kelas',
          attributes: ['nama_kelas', 'tingkat', 'tahun_ajaran']
        }
      ]
    });

    if (!siswa) {
      return errorResponse(res, 'Siswa tidak ditemukan', 404);
    }

    // Build where clause
    const where = { siswa_id };
    
    if (status) where.status = status;
    
    // Filter tahun (dari tanggal_bayar)
    if (tahun) {
      where.tanggal_bayar = {
        [Op.between]: [`${tahun}-01-01`, `${tahun}-12-31`]
      };
    }

    // Get pembayaran
    const pembayaran = await db.Pembayaran.findAll({
      where,
      include: [
        {
          model: db.ListPembayaran,
          as: 'jenis_pembayaran',
          attributes: ['nama_pembayaran', 'nominal', 'periode']
        },
        {
          model: db.User,
          as: 'approver',
          attributes: ['username']
        }
      ],
      order: [['tanggal_bayar', 'DESC']]
    });

    // Hitung statistik
    const stats = {
      total_pembayaran: pembayaran.length,
      total_nominal: pembayaran.reduce((sum, p) => sum + parseFloat(p.jumlah_bayar || 0), 0),
      approved: pembayaran.filter(p => p.status === 'approved').length,
      pending: pembayaran.filter(p => p.status === 'pending').length,
      rejected: pembayaran.filter(p => p.status === 'rejected').length
    };

    successResponse(res, {
      siswa,
      pembayaran,
      statistik: stats
    }, 'Data pembayaran siswa berhasil diambil');

  } catch (error) {
    console.error('Get pembayaran by siswa error:', error);
    errorResponse(res, 'Gagal mengambil data pembayaran siswa', 500);
  }
};

/**
 * Get single pembayaran by ID
 * GET /api/admin/pembayaran/:id
 */
const getPembayaranById = async (req, res) => {
  try {
    const { id } = req.params;

    const pembayaran = await db.Pembayaran.findByPk(id, {
      include: [
        {
          model: db.Siswa,
          as: 'siswa',
          attributes: ['id', 'nisn', 'nama_lengkap'],
          include: [
            {
              model: db.Kelas,
              as: 'kelas',
              attributes: ['nama_kelas', 'tingkat']
            }
          ]
        },
        {
          model: db.ListPembayaran,
          as: 'jenis_pembayaran',
          attributes: ['id', 'nama_pembayaran', 'nominal', 'periode', 'deskripsi']
        },
        {
          model: db.User,
          as: 'approver',
          attributes: ['username', 'role']
        }
      ]
    });

    if (!pembayaran) {
      return errorResponse(res, 'Pembayaran tidak ditemukan', 404);
    }

    successResponse(res, pembayaran, 'Data pembayaran berhasil diambil');

  } catch (error) {
    console.error('Get pembayaran by id error:', error);
    errorResponse(res, 'Gagal mengambil data pembayaran', 500);
  }
};

/**
 * Create pembayaran baru (oleh admin/guru atau upload siswa)
 * POST /api/admin/pembayaran
 */
const createPembayaran = async (req, res) => {
  try {
    const {
      siswa_id,
      list_pembayaran_id,
      jumlah_bayar,
      tanggal_bayar,
      catatan
    } = req.body;

    // Validasi input
    if (!siswa_id || !list_pembayaran_id || !jumlah_bayar || !tanggal_bayar) {
      return errorResponse(res, 'siswa_id, list_pembayaran_id, jumlah_bayar, dan tanggal_bayar wajib diisi', 400);
    }

    // Cek siswa exists
    const siswa = await db.Siswa.findByPk(siswa_id);
    if (!siswa) {
      return errorResponse(res, 'Siswa tidak ditemukan', 404);
    }

    // Cek list pembayaran exists
    const listPembayaran = await db.ListPembayaran.findByPk(list_pembayaran_id);
    if (!listPembayaran) {
      return errorResponse(res, 'Jenis pembayaran tidak ditemukan', 404);
    }

    // Validasi jumlah bayar
    if (parseFloat(jumlah_bayar) <= 0) {
      return errorResponse(res, 'Jumlah bayar harus lebih dari 0', 400);
    }

    // Get bukti_bayar dari multer (jika ada)
    const buktiBayar = req.file ? req.file.filename : null;

    // Status default: pending jika ada bukti bayar, approved jika admin langsung input
    const status = req.user.role === 'admin' ? 'approved' : 'pending';
    const approved_by = req.user.role === 'admin' ? req.user.id : null;
    const approved_at = req.user.role === 'admin' ? new Date() : null;

    // Create pembayaran
    const pembayaran = await db.Pembayaran.create({
      siswa_id,
      list_pembayaran_id,
      jumlah_bayar,
      tanggal_bayar,
      bukti_bayar: buktiBayar,
      status,
      approved_by,
      approved_at,
      catatan: catatan || null
    });

    // Get pembayaran with relations
    const pembayaranWithRelations = await db.Pembayaran.findByPk(pembayaran.id, {
      include: [
        {
          model: db.Siswa,
          as: 'siswa',
          attributes: ['nisn', 'nama_lengkap']
        },
        {
          model: db.ListPembayaran,
          as: 'jenis_pembayaran',
          attributes: ['nama_pembayaran', 'nominal']
        }
      ]
    });

    successResponse(res, pembayaranWithRelations, 'Pembayaran berhasil ditambahkan', 201);

  } catch (error) {
    console.error('Create pembayaran error:', error);
    errorResponse(res, 'Gagal menambahkan pembayaran', 500);
  }
};

/**
 * Update pembayaran (untuk edit jumlah, tanggal, catatan)
 * PUT /api/admin/pembayaran/:id
 */
const updatePembayaran = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      jumlah_bayar,
      tanggal_bayar,
      catatan
    } = req.body;

    const pembayaran = await db.Pembayaran.findByPk(id);
    if (!pembayaran) {
      return errorResponse(res, 'Pembayaran tidak ditemukan', 404);
    }

    // Hanya bisa update jika status masih pending
    if (pembayaran.status !== 'pending') {
      return errorResponse(res, `Tidak bisa mengupdate pembayaran yang sudah ${pembayaran.status}`, 400);
    }

    // Get bukti bayar baru jika diupload
    const buktiBayar = req.file ? req.file.filename : pembayaran.bukti_bayar;

    // Update data
    await pembayaran.update({
      jumlah_bayar: jumlah_bayar || pembayaran.jumlah_bayar,
      tanggal_bayar: tanggal_bayar || pembayaran.tanggal_bayar,
      bukti_bayar: buktiBayar,
      catatan: catatan !== undefined ? catatan : pembayaran.catatan
    });

    // Get updated pembayaran with relations
    const updatedPembayaran = await db.Pembayaran.findByPk(id, {
      include: [
        {
          model: db.Siswa,
          as: 'siswa',
          attributes: ['nisn', 'nama_lengkap']
        },
        {
          model: db.ListPembayaran,
          as: 'jenis_pembayaran',
          attributes: ['nama_pembayaran', 'nominal']
        }
      ]
    });

    successResponse(res, updatedPembayaran, 'Pembayaran berhasil diupdate');

  } catch (error) {
    console.error('Update pembayaran error:', error);
    errorResponse(res, 'Gagal mengupdate pembayaran', 500);
  }
};

/**
 * Approve pembayaran
 * PUT /api/admin/pembayaran/:id/approve
 */
const approvePembayaran = async (req, res) => {
  try {
    const { id } = req.params;
    const { catatan } = req.body;

    const pembayaran = await db.Pembayaran.findByPk(id);
    if (!pembayaran) {
      return errorResponse(res, 'Pembayaran tidak ditemukan', 404);
    }

    // Validasi status
    if (pembayaran.status !== 'pending') {
      return errorResponse(res, `Pembayaran sudah ${pembayaran.status}`, 400);
    }

    // Update status
    await pembayaran.update({
      status: 'approved',
      approved_by: req.user.id,
      approved_at: new Date(),
      catatan: catatan || pembayaran.catatan
    });

    // Get updated pembayaran
    const updatedPembayaran = await db.Pembayaran.findByPk(id, {
      include: [
        {
          model: db.Siswa,
          as: 'siswa',
          attributes: ['nisn', 'nama_lengkap']
        },
        {
          model: db.ListPembayaran,
          as: 'jenis_pembayaran',
          attributes: ['nama_pembayaran', 'nominal']
        },
        {
          model: db.User,
          as: 'approver',
          attributes: ['username']
        }
      ]
    });

    successResponse(res, updatedPembayaran, 'Pembayaran berhasil disetujui');

  } catch (error) {
    console.error('Approve pembayaran error:', error);
    errorResponse(res, 'Gagal menyetujui pembayaran', 500);
  }
};

/**
 * Reject pembayaran
 * PUT /api/admin/pembayaran/:id/reject
 */
const rejectPembayaran = async (req, res) => {
  try {
    const { id } = req.params;
    const { catatan } = req.body;

    if (!catatan) {
      return errorResponse(res, 'Catatan penolakan wajib diisi', 400);
    }

    const pembayaran = await db.Pembayaran.findByPk(id);
    if (!pembayaran) {
      return errorResponse(res, 'Pembayaran tidak ditemukan', 404);
    }

    // Validasi status
    if (pembayaran.status !== 'pending') {
      return errorResponse(res, `Pembayaran sudah ${pembayaran.status}`, 400);
    }

    // Update status
    await pembayaran.update({
      status: 'rejected',
      approved_by: req.user.id,
      approved_at: new Date(),
      catatan
    });

    // Get updated pembayaran
    const updatedPembayaran = await db.Pembayaran.findByPk(id, {
      include: [
        {
          model: db.Siswa,
          as: 'siswa',
          attributes: ['nisn', 'nama_lengkap']
        },
        {
          model: db.ListPembayaran,
          as: 'jenis_pembayaran',
          attributes: ['nama_pembayaran', 'nominal']
        },
        {
          model: db.User,
          as: 'approver',
          attributes: ['username']
        }
      ]
    });

    successResponse(res, updatedPembayaran, 'Pembayaran ditolak');

  } catch (error) {
    console.error('Reject pembayaran error:', error);
    errorResponse(res, 'Gagal menolak pembayaran', 500);
  }
};

/**
 * Delete pembayaran
 * DELETE /api/admin/pembayaran/:id
 */
const deletePembayaran = async (req, res) => {
  try {
    const { id } = req.params;

    const pembayaran = await db.Pembayaran.findByPk(id);
    if (!pembayaran) {
      return errorResponse(res, 'Pembayaran tidak ditemukan', 404);
    }

    // Hanya bisa delete jika status pending atau rejected
    if (pembayaran.status === 'approved') {
      return errorResponse(res, 'Tidak bisa menghapus pembayaran yang sudah disetujui', 400);
    }

    await pembayaran.destroy();

    successResponse(res, null, 'Pembayaran berhasil dihapus');

  } catch (error) {
    console.error('Delete pembayaran error:', error);
    errorResponse(res, 'Gagal menghapus pembayaran', 500);
  }
};

/**
 * Get rekap pembayaran (statistik)
 * GET /api/admin/pembayaran/rekap/statistik
 */
const getRekapPembayaran = async (req, res) => {
  try {
    const { tahun, bulan, kelas_id } = req.query;

    // Build where clause untuk filter
    const where = {};
    
    if (tahun && bulan) {
      const startDate = `${tahun}-${String(bulan).padStart(2, '0')}-01`;
      const endDate = new Date(tahun, bulan, 0);
      const endDateStr = formatDate(endDate);
      
      where.tanggal_bayar = {
        [Op.between]: [startDate, endDateStr]
      };
    } else if (tahun) {
      where.tanggal_bayar = {
        [Op.between]: [`${tahun}-01-01`, `${tahun}-12-31`]
      };
    }

    // Filter by kelas (via siswa)
    const include = [
      {
        model: db.Siswa,
        as: 'siswa',
        attributes: ['id', 'nama_lengkap'],
        ...(kelas_id && {
          where: { kelas_id },
          required: true
        })
      },
      {
        model: db.ListPembayaran,
        as: 'jenis_pembayaran',
        attributes: ['nama_pembayaran']
      }
    ];

    // Get all pembayaran
    const pembayaran = await db.Pembayaran.findAll({
      where,
      include,
      attributes: ['id', 'jumlah_bayar', 'status', 'tanggal_bayar']
    });

    // Hitung statistik
    const stats = {
      total_transaksi: pembayaran.length,
      total_nominal: pembayaran.reduce((sum, p) => sum + parseFloat(p.jumlah_bayar || 0), 0),
      approved: {
        count: pembayaran.filter(p => p.status === 'approved').length,
        nominal: pembayaran
          .filter(p => p.status === 'approved')
          .reduce((sum, p) => sum + parseFloat(p.jumlah_bayar || 0), 0)
      },
      pending: {
        count: pembayaran.filter(p => p.status === 'pending').length,
        nominal: pembayaran
          .filter(p => p.status === 'pending')
          .reduce((sum, p) => sum + parseFloat(p.jumlah_bayar || 0), 0)
      },
      rejected: {
        count: pembayaran.filter(p => p.status === 'rejected').length,
        nominal: pembayaran
          .filter(p => p.status === 'rejected')
          .reduce((sum, p) => sum + parseFloat(p.jumlah_bayar || 0), 0)
      }
    };

    successResponse(res, {
      periode: {
        tahun: tahun || 'Semua',
        bulan: bulan || 'Semua'
      },
      statistik: stats
    }, 'Rekap pembayaran berhasil diambil');

  } catch (error) {
    console.error('Get rekap pembayaran error:', error);
    errorResponse(res, 'Gagal mengambil rekap pembayaran', 500);
  }
};

module.exports = {
  getAllPembayaran,
  getPembayaranBySiswa,
  getPembayaranById,
  createPembayaran,
  updatePembayaran,
  approvePembayaran,
  rejectPembayaran,
  deletePembayaran,
  getRekapPembayaran
};