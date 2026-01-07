// controllers/kelasController.js
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
 * Get all kelas dengan pagination dan filter
 * GET /api/admin/kelas
 */
const getAllKelas = async (req, res) => {
  try {
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

    successResponse(res, {
      kelas: kelasWithCount,
      pagination
    }, 'Data kelas berhasil diambil');

  } catch (error) {
    console.error('Get all kelas error:', error);
    errorResponse(res, 'Gagal mengambil data kelas', 500);
  }
};

/**
 * Get single kelas by ID
 * GET /api/admin/kelas/:id
 */
const getKelasById = async (req, res) => {
  try {
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
      return errorResponse(res, 'Kelas tidak ditemukan', 404);
    }

    successResponse(res, kelas, 'Data kelas berhasil diambil');

  } catch (error) {
    console.error('Get kelas by id error:', error);
    errorResponse(res, 'Gagal mengambil data kelas', 500);
  }
};

/**
 * Create kelas baru
 * POST /api/admin/kelas
 */
const createKelas = async (req, res) => {
  try {
    const {
      nama_kelas,
      tingkat,
      guru_id,
      tahun_ajaran
    } = req.body;

    // Validasi input
    if (!nama_kelas || !tingkat || !tahun_ajaran) {
      return errorResponse(res, 'Nama kelas, tingkat, dan tahun ajaran wajib diisi', 400);
    }

    // Validasi tingkat (1-6)
    if (tingkat < 1 || tingkat > 6) {
      return errorResponse(res, 'Tingkat harus antara 1-6', 400);
    }

    // Cek duplikat nama kelas di tahun ajaran yang sama
    const existingKelas = await db.Kelas.findOne({
      where: {
        nama_kelas: cleanString(nama_kelas),
        tahun_ajaran
      }
    });

    if (existingKelas) {
      return errorResponse(res, 'Nama kelas sudah ada di tahun ajaran ini', 400);
    }

    // Jika ada guru_id, validasi guru exists
    if (guru_id) {
      const guru = await db.Guru.findByPk(guru_id);
      if (!guru) {
        return errorResponse(res, 'Guru tidak ditemukan', 404);
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

    successResponse(res, kelasWithRelations, 'Kelas berhasil ditambahkan', 201);

  } catch (error) {
    console.error('Create kelas error:', error);
    errorResponse(res, 'Gagal menambahkan kelas', 500);
  }
};

/**
 * Update kelas
 * PUT /api/admin/kelas/:id
 */
const updateKelas = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nama_kelas,
      tingkat,
      guru_id,
      tahun_ajaran
    } = req.body;

    const kelas = await db.Kelas.findByPk(id);
    if (!kelas) {
      return errorResponse(res, 'Kelas tidak ditemukan', 404);
    }

    // Validasi tingkat jika diupdate
    if (tingkat && (tingkat < 1 || tingkat > 6)) {
      return errorResponse(res, 'Tingkat harus antara 1-6', 400);
    }

    // Jika update guru_id, validasi guru exists
    if (guru_id !== undefined && guru_id !== null) {
      const guru = await db.Guru.findByPk(guru_id);
      if (!guru) {
        return errorResponse(res, 'Guru tidak ditemukan', 404);
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
          return errorResponse(res, 'Nama kelas sudah ada di tahun ajaran ini', 400);
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

    successResponse(res, updatedKelas, 'Data kelas berhasil diupdate');

  } catch (error) {
    console.error('Update kelas error:', error);
    errorResponse(res, 'Gagal mengupdate kelas', 500);
  }
};

/**
 * Delete kelas
 * DELETE /api/admin/kelas/:id
 */
const deleteKelas = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { id } = req.params;

    const kelas = await db.Kelas.findByPk(id);
    if (!kelas) {
      return errorResponse(res, 'Kelas tidak ditemukan', 404);
    }

    // Cek apakah masih ada siswa di kelas ini
    const siswaCount = await db.Siswa.count({ where: { kelas_id: id } });
    if (siswaCount > 0) {
      return errorResponse(res, `Kelas masih memiliki ${siswaCount} siswa. Pindahkan siswa terlebih dahulu.`, 400);
    }

    // Cek apakah masih ada jadwal pelajaran
    const jadwalCount = await db.JadwalPelajaran.count({ where: { kelas_id: id } });
    if (jadwalCount > 0) {
      return errorResponse(res, 'Kelas masih memiliki jadwal pelajaran. Hapus jadwal terlebih dahulu.', 400);
    }

    // Delete kelas
    await kelas.destroy({ transaction });

    await transaction.commit();

    successResponse(res, null, 'Kelas berhasil dihapus');

  } catch (error) {
    await transaction.rollback();
    console.error('Delete kelas error:', error);
    errorResponse(res, 'Gagal menghapus kelas', 500);
  }
};

/**
 * Get siswa by kelas
 * GET /api/admin/kelas/:id/siswa
 */
const getSiswaByKelas = async (req, res) => {
  try {
    const { id } = req.params;
    const { status = 'aktif' } = req.query;

    const kelas = await db.Kelas.findByPk(id);
    if (!kelas) {
      return errorResponse(res, 'Kelas tidak ditemukan', 404);
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

    successResponse(res, {
      kelas: {
        id: kelas.id,
        nama_kelas: kelas.nama_kelas,
        tingkat: kelas.tingkat
      },
      jumlah_siswa: siswa.length,
      siswa
    }, 'Data siswa berhasil diambil');

  } catch (error) {
    console.error('Get siswa by kelas error:', error);
    errorResponse(res, 'Gagal mengambil data siswa', 500);
  }
};

/**
 * Assign siswa ke kelas (bulk)
 * POST /api/admin/kelas/:id/siswa
 */
const assignSiswaToKelas = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { siswa_ids } = req.body; // Array of siswa IDs

    if (!siswa_ids || !Array.isArray(siswa_ids) || siswa_ids.length === 0) {
      return errorResponse(res, 'siswa_ids harus berupa array dan tidak boleh kosong', 400);
    }

    const kelas = await db.Kelas.findByPk(id);
    if (!kelas) {
      return errorResponse(res, 'Kelas tidak ditemukan', 404);
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

    successResponse(res, {
      updated_count: updatedCount,
      kelas: {
        id: kelas.id,
        nama_kelas: kelas.nama_kelas
      }
    }, `${updatedCount} siswa berhasil di-assign ke kelas ${kelas.nama_kelas}`);

  } catch (error) {
    await transaction.rollback();
    console.error('Assign siswa to kelas error:', error);
    errorResponse(res, 'Gagal assign siswa ke kelas', 500);
  }
};

/**
 * Remove siswa dari kelas (set kelas_id = null)
 * DELETE /api/admin/kelas/:id/siswa/:siswa_id
 */
const removeSiswaFromKelas = async (req, res) => {
  try {
    const { id, siswa_id } = req.params;

    const siswa = await db.Siswa.findOne({
      where: {
        id: siswa_id,
        kelas_id: id
      }
    });

    if (!siswa) {
      return errorResponse(res, 'Siswa tidak ditemukan di kelas ini', 404);
    }

    // Set kelas_id = null
    await siswa.update({ kelas_id: null });

    successResponse(res, null, 'Siswa berhasil dikeluarkan dari kelas');

  } catch (error) {
    console.error('Remove siswa from kelas error:', error);
    errorResponse(res, 'Gagal mengeluarkan siswa dari kelas', 500);
  }
};

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