const db = require('../models');

// ============================================
// LIST PEMBAYARAN MANAGEMENT (Jenis Tagihan)
// ============================================
exports.getAllListPembayaran = async (req, res) => {
  try {
    const { status, tingkat } = req.query;

    const where = {};
    if (status) where.status = status;
    if (tingkat) where.tingkat = tingkat;

    const listPembayaran = await db.ListPembayaran.findAll({
      where,
      order: [['nama_pembayaran', 'ASC']]
    });

    res.json({
      success: true,
      data: listPembayaran
    });
  } catch (error) {
    console.error('Error getting list pembayaran:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memuat data list pembayaran',
      error: error.message
    });
  }
};

exports.getListPembayaranById = async (req, res) => {
  try {
    const { id } = req.params;

    const listPembayaran = await db.ListPembayaran.findByPk(id);

    if (!listPembayaran) {
      return res.status(404).json({
        success: false,
        message: 'List pembayaran tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: listPembayaran
    });
  } catch (error) {
    console.error('Error getting list pembayaran:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memuat data list pembayaran',
      error: error.message
    });
  }
};

exports.createListPembayaran = async (req, res) => {
  try {
    const { nama_pembayaran, nominal, periode, tingkat, deskripsi, status } = req.body;

    // Validation
    if (!nama_pembayaran || !nominal || !periode) {
      return res.status(400).json({
        success: false,
        message: 'Nama pembayaran, nominal, dan periode wajib diisi'
      });
    }

    const listPembayaran = await db.ListPembayaran.create({
      nama_pembayaran,
      nominal,
      periode,
      tingkat: tingkat || 0,
      deskripsi: deskripsi || null,
      status: status || 'aktif'
    });

    res.status(201).json({
      success: true,
      message: 'List pembayaran berhasil ditambahkan',
      data: listPembayaran
    });
  } catch (error) {
    console.error('Error creating list pembayaran:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan list pembayaran',
      error: error.message
    });
  }
};

exports.updateListPembayaran = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_pembayaran, nominal, periode, tingkat, deskripsi, status } = req.body;

    const listPembayaran = await db.ListPembayaran.findByPk(id);
    if (!listPembayaran) {
      return res.status(404).json({
        success: false,
        message: 'List pembayaran tidak ditemukan'
      });
    }

    await listPembayaran.update({
      nama_pembayaran: nama_pembayaran || listPembayaran.nama_pembayaran,
      nominal: nominal !== undefined ? nominal : listPembayaran.nominal,
      periode: periode || listPembayaran.periode,
      tingkat: tingkat !== undefined ? tingkat : listPembayaran.tingkat,
      deskripsi: deskripsi !== undefined ? deskripsi : listPembayaran.deskripsi,
      status: status || listPembayaran.status
    });

    res.json({
      success: true,
      message: 'List pembayaran berhasil diperbarui',
      data: listPembayaran
    });
  } catch (error) {
    console.error('Error updating list pembayaran:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui list pembayaran',
      error: error.message
    });
  }
};

exports.deleteListPembayaran = async (req, res) => {
  try {
    const { id } = req.params;

    const listPembayaran = await db.ListPembayaran.findByPk(id);
    if (!listPembayaran) {
      return res.status(404).json({
        success: false,
        message: 'List pembayaran tidak ditemukan'
      });
    }

    // Check if used in pembayaran
    const pembayaranCount = await db.Pembayaran.count({
      where: { list_pembayaran_id: id }
    });

    if (pembayaranCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Tidak dapat menghapus list pembayaran yang sudah digunakan di ${pembayaranCount} transaksi`
      });
    }

    await listPembayaran.destroy();

    res.json({
      success: true,
      message: 'List pembayaran berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting list pembayaran:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus list pembayaran',
      error: error.message
    });
  }
};

// ============================================
// PEMBAYARAN MANAGEMENT (Transaksi)
// ============================================
exports.getAllPembayaran = async (req, res) => {
  try {
    const { siswa_id, status, list_pembayaran_id } = req.query;

    const where = {};
    if (siswa_id) where.siswa_id = siswa_id;
    if (status) where.status = status;
    if (list_pembayaran_id) where.list_pembayaran_id = list_pembayaran_id;

    const pembayaran = await db.Pembayaran.findAll({
      where,
      include: [
        {
          model: db.Siswa,
          as: 'siswa',
          attributes: ['id', 'nisn', 'nama_lengkap'],
          include: [{
            model: db.Kelas,
            as: 'kelas',
            attributes: ['id', 'nama_kelas']
          }]
        },
        {
          model: db.ListPembayaran,
          as: 'jenis_pembayaran',
          attributes: ['id', 'nama_pembayaran', 'nominal', 'periode']
        },
        {
          model: db.User,
          as: 'approver',
          attributes: ['id', 'username'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: pembayaran
    });
  } catch (error) {
    console.error('Error getting pembayaran:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memuat data pembayaran',
      error: error.message
    });
  }
};

exports.approvePembayaran = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, catatan } = req.body;
    const userId = req.user.id; // From auth middleware

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status harus approved atau rejected'
      });
    }

    const pembayaran = await db.Pembayaran.findByPk(id);
    if (!pembayaran) {
      return res.status(404).json({
        success: false,
        message: 'Pembayaran tidak ditemukan'
      });
    }

    if (pembayaran.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Pembayaran sudah diproses sebelumnya'
      });
    }

    await pembayaran.update({
      status,
      approved_by: userId,
      approved_at: new Date(),
      catatan: catatan || pembayaran.catatan
    });

    const updatedPembayaran = await db.Pembayaran.findByPk(id, {
      include: [
        {
          model: db.Siswa,
          as: 'siswa',
          attributes: ['id', 'nisn', 'nama_lengkap']
        },
        {
          model: db.ListPembayaran,
          as: 'jenis_pembayaran',
          attributes: ['id', 'nama_pembayaran', 'nominal']
        },
        {
          model: db.User,
          as: 'approver',
          attributes: ['id', 'username']
        }
      ]
    });

    res.json({
      success: true,
      message: `Pembayaran berhasil di${status === 'approved' ? 'setujui' : 'tolak'}`,
      data: updatedPembayaran
    });
  } catch (error) {
    console.error('Error approving pembayaran:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memproses pembayaran',
      error: error.message
    });
  }
};

exports.deletePembayaran = async (req, res) => {
  try {
    const { id } = req.params;

    const pembayaran = await db.Pembayaran.findByPk(id);
    if (!pembayaran) {
      return res.status(404).json({
        success: false,
        message: 'Pembayaran tidak ditemukan'
      });
    }

    // Only allow delete if status is pending or rejected
    if (pembayaran.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Pembayaran yang sudah approved tidak dapat dihapus'
      });
    }

    await pembayaran.destroy();

    res.json({
      success: true,
      message: 'Pembayaran berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting pembayaran:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus pembayaran',
      error: error.message
    });
  }
};
