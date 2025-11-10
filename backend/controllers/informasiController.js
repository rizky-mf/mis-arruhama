const db = require('../models');

// ============================================
// INFORMASI UMUM (General Announcements)
// ============================================

// Get all informasi umum with filters
exports.getAllInformasiUmum = async (req, res) => {
  try {
    const { jenis, tanggal_mulai, tanggal_selesai } = req.query;

    const where = {};
    if (jenis) where.jenis = jenis;
    if (tanggal_mulai) where.tanggal_mulai = { [db.Sequelize.Op.gte]: tanggal_mulai };
    if (tanggal_selesai) where.tanggal_selesai = { [db.Sequelize.Op.lte]: tanggal_selesai };

    const informasiUmum = await db.InformasiUmum.findAll({
      where,
      include: [
        {
          model: db.User,
          as: 'creator',
          attributes: ['id', 'username', 'role']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: informasiUmum
    });
  } catch (error) {
    console.error('Error fetching informasi umum:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data informasi umum',
      error: error.message
    });
  }
};

// Get single informasi umum by ID
exports.getInformasiUmumById = async (req, res) => {
  try {
    const { id } = req.params;

    const informasiUmum = await db.InformasiUmum.findByPk(id, {
      include: [
        {
          model: db.User,
          as: 'creator',
          attributes: ['id', 'username', 'role']
        }
      ]
    });

    if (!informasiUmum) {
      return res.status(404).json({
        success: false,
        message: 'Informasi umum tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: informasiUmum
    });
  } catch (error) {
    console.error('Error fetching informasi umum:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data informasi umum',
      error: error.message
    });
  }
};

// Create new informasi umum
exports.createInformasiUmum = async (req, res) => {
  try {
    const { judul, konten, jenis, tanggal_mulai, tanggal_selesai } = req.body;
    const userId = req.user.id;

    // Validation
    if (!judul || !konten || !jenis) {
      return res.status(400).json({
        success: false,
        message: 'Judul, konten, dan jenis wajib diisi'
      });
    }

    if (!['event', 'libur', 'pengumuman'].includes(jenis)) {
      return res.status(400).json({
        success: false,
        message: 'Jenis harus salah satu dari: event, libur, pengumuman'
      });
    }

    const newInformasiUmum = await db.InformasiUmum.create({
      judul,
      konten,
      jenis,
      tanggal_mulai: tanggal_mulai || null,
      tanggal_selesai: tanggal_selesai || null,
      created_by: userId
    });

    res.status(201).json({
      success: true,
      message: 'Informasi umum berhasil dibuat',
      data: newInformasiUmum
    });
  } catch (error) {
    console.error('Error creating informasi umum:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal membuat informasi umum',
      error: error.message
    });
  }
};

// Update informasi umum
exports.updateInformasiUmum = async (req, res) => {
  try {
    const { id } = req.params;
    const { judul, konten, jenis, tanggal_mulai, tanggal_selesai } = req.body;

    const informasiUmum = await db.InformasiUmum.findByPk(id);

    if (!informasiUmum) {
      return res.status(404).json({
        success: false,
        message: 'Informasi umum tidak ditemukan'
      });
    }

    // Validation for jenis if provided
    if (jenis && !['event', 'libur', 'pengumuman'].includes(jenis)) {
      return res.status(400).json({
        success: false,
        message: 'Jenis harus salah satu dari: event, libur, pengumuman'
      });
    }

    await informasiUmum.update({
      judul: judul || informasiUmum.judul,
      konten: konten || informasiUmum.konten,
      jenis: jenis || informasiUmum.jenis,
      tanggal_mulai: tanggal_mulai !== undefined ? tanggal_mulai : informasiUmum.tanggal_mulai,
      tanggal_selesai: tanggal_selesai !== undefined ? tanggal_selesai : informasiUmum.tanggal_selesai
    });

    res.json({
      success: true,
      message: 'Informasi umum berhasil diperbarui',
      data: informasiUmum
    });
  } catch (error) {
    console.error('Error updating informasi umum:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui informasi umum',
      error: error.message
    });
  }
};

// Delete informasi umum
exports.deleteInformasiUmum = async (req, res) => {
  try {
    const { id } = req.params;

    const informasiUmum = await db.InformasiUmum.findByPk(id);

    if (!informasiUmum) {
      return res.status(404).json({
        success: false,
        message: 'Informasi umum tidak ditemukan'
      });
    }

    await informasiUmum.destroy();

    res.json({
      success: true,
      message: 'Informasi umum berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting informasi umum:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus informasi umum',
      error: error.message
    });
  }
};

// ============================================
// INFORMASI KELAS (Class-specific Announcements)
// ============================================

// Get all informasi kelas with filters
exports.getAllInformasiKelas = async (req, res) => {
  try {
    const { kelas_id, guru_id } = req.query;

    const where = {};
    if (kelas_id) where.kelas_id = kelas_id;
    if (guru_id) where.guru_id = guru_id;

    const informasiKelas = await db.InformasiKelas.findAll({
      where,
      include: [
        {
          model: db.Kelas,
          as: 'kelas',
          attributes: ['id', 'nama_kelas', 'tingkat']
        },
        {
          model: db.Guru,
          as: 'guru',
          attributes: ['id', 'nama_lengkap', 'nip']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: informasiKelas
    });
  } catch (error) {
    console.error('Error fetching informasi kelas:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data informasi kelas',
      error: error.message
    });
  }
};

// Get single informasi kelas by ID
exports.getInformasiKelasById = async (req, res) => {
  try {
    const { id } = req.params;

    const informasiKelas = await db.InformasiKelas.findByPk(id, {
      include: [
        {
          model: db.Kelas,
          as: 'kelas',
          attributes: ['id', 'nama_kelas', 'tingkat']
        },
        {
          model: db.Guru,
          as: 'guru',
          attributes: ['id', 'nama_lengkap', 'nip']
        }
      ]
    });

    if (!informasiKelas) {
      return res.status(404).json({
        success: false,
        message: 'Informasi kelas tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: informasiKelas
    });
  } catch (error) {
    console.error('Error fetching informasi kelas:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data informasi kelas',
      error: error.message
    });
  }
};

// Create new informasi kelas
exports.createInformasiKelas = async (req, res) => {
  try {
    const { kelas_id, guru_id, judul, konten } = req.body;

    // Validation
    if (!kelas_id || !guru_id || !judul || !konten) {
      return res.status(400).json({
        success: false,
        message: 'Kelas, guru, judul, dan konten wajib diisi'
      });
    }

    // Verify kelas exists
    const kelas = await db.Kelas.findByPk(kelas_id);
    if (!kelas) {
      return res.status(404).json({
        success: false,
        message: 'Kelas tidak ditemukan'
      });
    }

    // Verify guru exists
    const guru = await db.Guru.findByPk(guru_id);
    if (!guru) {
      return res.status(404).json({
        success: false,
        message: 'Guru tidak ditemukan'
      });
    }

    const newInformasiKelas = await db.InformasiKelas.create({
      kelas_id,
      guru_id,
      judul,
      konten
    });

    res.status(201).json({
      success: true,
      message: 'Informasi kelas berhasil dibuat',
      data: newInformasiKelas
    });
  } catch (error) {
    console.error('Error creating informasi kelas:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal membuat informasi kelas',
      error: error.message
    });
  }
};

// Update informasi kelas
exports.updateInformasiKelas = async (req, res) => {
  try {
    const { id } = req.params;
    const { kelas_id, guru_id, judul, konten } = req.body;

    const informasiKelas = await db.InformasiKelas.findByPk(id);

    if (!informasiKelas) {
      return res.status(404).json({
        success: false,
        message: 'Informasi kelas tidak ditemukan'
      });
    }

    // Verify kelas exists if kelas_id is provided
    if (kelas_id) {
      const kelas = await db.Kelas.findByPk(kelas_id);
      if (!kelas) {
        return res.status(404).json({
          success: false,
          message: 'Kelas tidak ditemukan'
        });
      }
    }

    // Verify guru exists if guru_id is provided
    if (guru_id) {
      const guru = await db.Guru.findByPk(guru_id);
      if (!guru) {
        return res.status(404).json({
          success: false,
          message: 'Guru tidak ditemukan'
        });
      }
    }

    await informasiKelas.update({
      kelas_id: kelas_id || informasiKelas.kelas_id,
      guru_id: guru_id || informasiKelas.guru_id,
      judul: judul || informasiKelas.judul,
      konten: konten || informasiKelas.konten
    });

    res.json({
      success: true,
      message: 'Informasi kelas berhasil diperbarui',
      data: informasiKelas
    });
  } catch (error) {
    console.error('Error updating informasi kelas:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui informasi kelas',
      error: error.message
    });
  }
};

// Delete informasi kelas
exports.deleteInformasiKelas = async (req, res) => {
  try {
    const { id } = req.params;

    const informasiKelas = await db.InformasiKelas.findByPk(id);

    if (!informasiKelas) {
      return res.status(404).json({
        success: false,
        message: 'Informasi kelas tidak ditemukan'
      });
    }

    await informasiKelas.destroy();

    res.json({
      success: true,
      message: 'Informasi kelas berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting informasi kelas:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus informasi kelas',
      error: error.message
    });
  }
};
