// controllers/jadwalPelajaranController.js
const db = require('../models');
const { Op } = require('sequelize');
const {
  getPagination,
  getPaginationMeta,
  successResponse,
  errorResponse
} = require('../utils/helper');

/**
 * Get all jadwal pelajaran dengan pagination dan filter
 * GET /api/admin/jadwal-pelajaran
 */
const getAllJadwalPelajaran = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      kelas_id = '', 
      guru_id = '', 
      hari = '',
      mata_pelajaran_id = '' 
    } = req.query;
    
    const { offset, limit: pageLimit } = getPagination(page, limit);

    // Build where clause
    const where = {};
    
    if (kelas_id) where.kelas_id = kelas_id;
    if (guru_id) where.guru_id = guru_id;
    if (hari) where.hari = hari;
    if (mata_pelajaran_id) where.mata_pelajaran_id = mata_pelajaran_id;

    // Query dengan relasi
    const { count, rows } = await db.JadwalPelajaran.findAndCountAll({
      where,
      include: [
        {
          model: db.Kelas,
          as: 'kelas',
          attributes: ['id', 'nama_kelas', 'tingkat']
        },
        {
          model: db.MataPelajaran,
          as: 'mataPelajaran',
          attributes: ['id', 'kode_mapel', 'nama_mapel']
        },
        {
          model: db.Guru,
          as: 'guru',
          attributes: ['id', 'nip', 'nama_lengkap']
        }
      ],
      offset,
      limit: pageLimit,
      order: [
        ['hari', 'ASC'],
        ['jam_mulai', 'ASC']
      ]
    });

    const pagination = getPaginationMeta(count, page, limit);

    successResponse(res, {
      jadwal_pelajaran: rows,
      pagination
    }, 'Data jadwal pelajaran berhasil diambil');

  } catch (error) {
    console.error('Get all jadwal pelajaran error:', error);
    errorResponse(res, 'Gagal mengambil data jadwal pelajaran', 500);
  }
};

/**
 * Get jadwal pelajaran by kelas
 * GET /api/admin/jadwal-pelajaran/kelas/:kelas_id
 */
const getJadwalByKelas = async (req, res) => {
  try {
    const { kelas_id } = req.params;

    // Cek kelas exists
    const kelas = await db.Kelas.findByPk(kelas_id, {
      attributes: ['id', 'nama_kelas', 'tingkat', 'tahun_ajaran'],
      include: [
        {
          model: db.Guru,
          as: 'wali_kelas',
          attributes: ['nama_lengkap']
        }
      ]
    });

    if (!kelas) {
      return errorResponse(res, 'Kelas tidak ditemukan', 404);
    }

    // Get jadwal
    const jadwal = await db.JadwalPelajaran.findAll({
      where: { kelas_id },
      include: [
        {
          model: db.MataPelajaran,
          as: 'mataPelajaran',
          attributes: ['kode_mapel', 'nama_mapel']
        },
        {
          model: db.Guru,
          as: 'guru',
          attributes: ['nama_lengkap', 'telepon']
        }
      ],
      order: [
        ['hari', 'ASC'],
        ['jam_mulai', 'ASC']
      ]
    });

    // Group by hari
    const hariOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const jadwalByHari = {};
    
    hariOrder.forEach(hari => {
      jadwalByHari[hari] = jadwal.filter(j => j.hari === hari);
    });

    successResponse(res, {
      kelas,
      jadwal_by_hari: jadwalByHari,
      total_jadwal: jadwal.length
    }, 'Jadwal pelajaran berhasil diambil');

  } catch (error) {
    console.error('Get jadwal by kelas error:', error);
    errorResponse(res, 'Gagal mengambil jadwal pelajaran', 500);
  }
};

/**
 * Get jadwal pelajaran by guru
 * GET /api/admin/jadwal-pelajaran/guru/:guru_id
 */
const getJadwalByGuru = async (req, res) => {
  try {
    const { guru_id } = req.params;

    // Cek guru exists
    const guru = await db.Guru.findByPk(guru_id, {
      attributes: ['id', 'nip', 'nama_lengkap']
    });

    if (!guru) {
      return errorResponse(res, 'Guru tidak ditemukan', 404);
    }

    // Get jadwal
    const jadwal = await db.JadwalPelajaran.findAll({
      where: { guru_id },
      include: [
        {
          model: db.Kelas,
          as: 'kelas',
          attributes: ['nama_kelas', 'tingkat']
        },
        {
          model: db.MataPelajaran,
          as: 'mataPelajaran',
          attributes: ['kode_mapel', 'nama_mapel']
        }
      ],
      order: [
        ['hari', 'ASC'],
        ['jam_mulai', 'ASC']
      ]
    });

    // Group by hari
    const hariOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const jadwalByHari = {};
    
    hariOrder.forEach(hari => {
      jadwalByHari[hari] = jadwal.filter(j => j.hari === hari);
    });

    successResponse(res, {
      guru,
      jadwal_by_hari: jadwalByHari,
      total_jadwal: jadwal.length
    }, 'Jadwal mengajar berhasil diambil');

  } catch (error) {
    console.error('Get jadwal by guru error:', error);
    errorResponse(res, 'Gagal mengambil jadwal mengajar', 500);
  }
};

/**
 * Get single jadwal by ID
 * GET /api/admin/jadwal-pelajaran/:id
 */
const getJadwalById = async (req, res) => {
  try {
    const { id } = req.params;

    const jadwal = await db.JadwalPelajaran.findByPk(id, {
      include: [
        {
          model: db.Kelas,
          as: 'kelas',
          attributes: ['id', 'nama_kelas', 'tingkat']
        },
        {
          model: db.MataPelajaran,
          as: 'mataPelajaran',
          attributes: ['id', 'kode_mapel', 'nama_mapel']
        },
        {
          model: db.Guru,
          as: 'guru',
          attributes: ['id', 'nip', 'nama_lengkap', 'telepon']
        }
      ]
    });

    if (!jadwal) {
      return errorResponse(res, 'Jadwal pelajaran tidak ditemukan', 404);
    }

    successResponse(res, jadwal, 'Data jadwal pelajaran berhasil diambil');

  } catch (error) {
    console.error('Get jadwal by id error:', error);
    errorResponse(res, 'Gagal mengambil data jadwal pelajaran', 500);
  }
};

/**
 * Create jadwal pelajaran baru
 * POST /api/admin/jadwal-pelajaran
 */
const createJadwalPelajaran = async (req, res) => {
  try {
    const {
      kelas_id,
      mata_pelajaran_id,
      guru_id,
      hari,
      jam_mulai,
      jam_selesai,
      ruangan
    } = req.body;

    // Validasi input
    if (!kelas_id || !mata_pelajaran_id || !guru_id || !hari || !jam_mulai || !jam_selesai) {
      return errorResponse(res, 'Semua field wajib diisi kecuali ruangan', 400);
    }

    // Validasi hari
    const hariValid = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    if (!hariValid.includes(hari)) {
      return errorResponse(res, 'Hari tidak valid', 400);
    }

    // Validasi jam (jam_selesai harus lebih besar dari jam_mulai)
    if (jam_selesai <= jam_mulai) {
      return errorResponse(res, 'Jam selesai harus lebih besar dari jam mulai', 400);
    }

    // Cek kelas exists
    const kelas = await db.Kelas.findByPk(kelas_id);
    if (!kelas) {
      return errorResponse(res, 'Kelas tidak ditemukan', 404);
    }

    // Cek mata pelajaran exists
    const mataPelajaran = await db.MataPelajaran.findByPk(mata_pelajaran_id);
    if (!mataPelajaran) {
      return errorResponse(res, 'Mata pelajaran tidak ditemukan', 404);
    }

    // Cek guru exists
    const guru = await db.Guru.findByPk(guru_id);
    if (!guru) {
      return errorResponse(res, 'Guru tidak ditemukan', 404);
    }

    // Cek bentrok jadwal kelas (di hari dan jam yang sama)
    const bentrokKelas = await db.JadwalPelajaran.findOne({
      where: {
        kelas_id,
        hari,
        [Op.or]: [
          {
            // Jam mulai baru di antara jadwal existing
            jam_mulai: {
              [Op.lte]: jam_mulai
            },
            jam_selesai: {
              [Op.gt]: jam_mulai
            }
          },
          {
            // Jam selesai baru di antara jadwal existing
            jam_mulai: {
              [Op.lt]: jam_selesai
            },
            jam_selesai: {
              [Op.gte]: jam_selesai
            }
          },
          {
            // Jadwal baru mencakup jadwal existing
            jam_mulai: {
              [Op.gte]: jam_mulai
            },
            jam_selesai: {
              [Op.lte]: jam_selesai
            }
          }
        ]
      }
    });

    if (bentrokKelas) {
      return errorResponse(res, `Bentrok jadwal! Kelas ${kelas.nama_kelas} sudah ada jadwal di hari ${hari} jam ${bentrokKelas.jam_mulai}-${bentrokKelas.jam_selesai}`, 400);
    }

    // Cek bentrok jadwal guru (guru mengajar di kelas lain di waktu yang sama)
    const bentrokGuru = await db.JadwalPelajaran.findOne({
      where: {
        guru_id,
        hari,
        [Op.or]: [
          {
            jam_mulai: {
              [Op.lte]: jam_mulai
            },
            jam_selesai: {
              [Op.gt]: jam_mulai
            }
          },
          {
            jam_mulai: {
              [Op.lt]: jam_selesai
            },
            jam_selesai: {
              [Op.gte]: jam_selesai
            }
          },
          {
            jam_mulai: {
              [Op.gte]: jam_mulai
            },
            jam_selesai: {
              [Op.lte]: jam_selesai
            }
          }
        ]
      },
      include: [
        {
          model: db.Kelas,
          as: 'kelas',
          attributes: ['nama_kelas']
        }
      ]
    });

    if (bentrokGuru) {
      return errorResponse(res, `Bentrok jadwal! Guru ${guru.nama_lengkap} sudah mengajar di kelas ${bentrokGuru.kelas.nama_kelas} pada hari ${hari} jam ${bentrokGuru.jam_mulai}-${bentrokGuru.jam_selesai}`, 400);
    }

    // Create jadwal
    const jadwal = await db.JadwalPelajaran.create({
      kelas_id,
      mata_pelajaran_id,
      guru_id,
      hari,
      jam_mulai,
      jam_selesai,
      ruangan: ruangan || null
    });

    // Get jadwal with relations
    const jadwalWithRelations = await db.JadwalPelajaran.findByPk(jadwal.id, {
      include: [
        {
          model: db.Kelas,
          as: 'kelas',
          attributes: ['nama_kelas', 'tingkat']
        },
        {
          model: db.MataPelajaran,
          as: 'mataPelajaran',
          attributes: ['kode_mapel', 'nama_mapel']
        },
        {
          model: db.Guru,
          as: 'guru',
          attributes: ['nama_lengkap']
        }
      ]
    });

    successResponse(res, jadwalWithRelations, 'Jadwal pelajaran berhasil ditambahkan', 201);

  } catch (error) {
    console.error('Create jadwal pelajaran error:', error);
    errorResponse(res, 'Gagal menambahkan jadwal pelajaran', 500);
  }
};

/**
 * Update jadwal pelajaran
 * PUT /api/admin/jadwal-pelajaran/:id
 */
const updateJadwalPelajaran = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      mata_pelajaran_id,
      guru_id,
      hari,
      jam_mulai,
      jam_selesai,
      ruangan
    } = req.body;

    const jadwal = await db.JadwalPelajaran.findByPk(id);
    if (!jadwal) {
      return errorResponse(res, 'Jadwal pelajaran tidak ditemukan', 404);
    }

    // Validasi hari jika diupdate
    if (hari) {
      const hariValid = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      if (!hariValid.includes(hari)) {
        return errorResponse(res, 'Hari tidak valid', 400);
      }
    }

    // Validasi jam
    const newJamMulai = jam_mulai || jadwal.jam_mulai;
    const newJamSelesai = jam_selesai || jadwal.jam_selesai;
    
    if (newJamSelesai <= newJamMulai) {
      return errorResponse(res, 'Jam selesai harus lebih besar dari jam mulai', 400);
    }

    // Validasi mata pelajaran jika diupdate
    if (mata_pelajaran_id) {
      const mataPelajaran = await db.MataPelajaran.findByPk(mata_pelajaran_id);
      if (!mataPelajaran) {
        return errorResponse(res, 'Mata pelajaran tidak ditemukan', 404);
      }
    }

    // Validasi guru jika diupdate
    if (guru_id) {
      const guru = await db.Guru.findByPk(guru_id);
      if (!guru) {
        return errorResponse(res, 'Guru tidak ditemukan', 404);
      }
    }

    // Cek bentrok jadwal (skip jadwal yang sedang diupdate)
    const newHari = hari || jadwal.hari;
    const bentrok = await db.JadwalPelajaran.findOne({
      where: {
        id: { [Op.ne]: id },
        kelas_id: jadwal.kelas_id,
        hari: newHari,
        [Op.or]: [
          {
            jam_mulai: {
              [Op.lte]: newJamMulai
            },
            jam_selesai: {
              [Op.gt]: newJamMulai
            }
          },
          {
            jam_mulai: {
              [Op.lt]: newJamSelesai
            },
            jam_selesai: {
              [Op.gte]: newJamSelesai
            }
          },
          {
            jam_mulai: {
              [Op.gte]: newJamMulai
            },
            jam_selesai: {
              [Op.lte]: newJamSelesai
            }
          }
        ]
      }
    });

    if (bentrok) {
      return errorResponse(res, `Bentrok jadwal! Sudah ada jadwal di hari ${newHari} jam ${bentrok.jam_mulai}-${bentrok.jam_selesai}`, 400);
    }

    // Update data
    await jadwal.update({
      mata_pelajaran_id: mata_pelajaran_id || jadwal.mata_pelajaran_id,
      guru_id: guru_id || jadwal.guru_id,
      hari: hari || jadwal.hari,
      jam_mulai: jam_mulai || jadwal.jam_mulai,
      jam_selesai: jam_selesai || jadwal.jam_selesai,
      ruangan: ruangan !== undefined ? ruangan : jadwal.ruangan
    });

    // Get updated jadwal with relations
    const updatedJadwal = await db.JadwalPelajaran.findByPk(id, {
      include: [
        {
          model: db.Kelas,
          as: 'kelas',
          attributes: ['nama_kelas', 'tingkat']
        },
        {
          model: db.MataPelajaran,
          as: 'mataPelajaran',
          attributes: ['kode_mapel', 'nama_mapel']
        },
        {
          model: db.Guru,
          as: 'guru',
          attributes: ['nama_lengkap']
        }
      ]
    });

    successResponse(res, updatedJadwal, 'Jadwal pelajaran berhasil diupdate');

  } catch (error) {
    console.error('Update jadwal pelajaran error:', error);
    errorResponse(res, 'Gagal mengupdate jadwal pelajaran', 500);
  }
};

/**
 * Delete jadwal pelajaran
 * DELETE /api/admin/jadwal-pelajaran/:id
 */
const deleteJadwalPelajaran = async (req, res) => {
  try {
    const { id } = req.params;

    const jadwal = await db.JadwalPelajaran.findByPk(id);
    if (!jadwal) {
      return errorResponse(res, 'Jadwal pelajaran tidak ditemukan', 404);
    }

    await jadwal.destroy();

    successResponse(res, null, 'Jadwal pelajaran berhasil dihapus');

  } catch (error) {
    console.error('Delete jadwal pelajaran error:', error);
    errorResponse(res, 'Gagal menghapus jadwal pelajaran', 500);
  }
};

/**
 * Bulk create jadwal pelajaran
 * POST /api/admin/jadwal-pelajaran/bulk
 */
const bulkCreateJadwal = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { jadwal_list } = req.body;

    if (!Array.isArray(jadwal_list) || jadwal_list.length === 0) {
      return errorResponse(res, 'jadwal_list harus berupa array dan tidak boleh kosong', 400);
    }

    const createdJadwal = [];
    const errors = [];

    for (let i = 0; i < jadwal_list.length; i++) {
      const item = jadwal_list[i];
      
      try {
        // Validasi basic
        if (!item.kelas_id || !item.mata_pelajaran_id || !item.guru_id || 
            !item.hari || !item.jam_mulai || !item.jam_selesai) {
          errors.push({
            index: i,
            error: 'Field tidak lengkap'
          });
          continue;
        }

        // Create jadwal
        const jadwal = await db.JadwalPelajaran.create({
          kelas_id: item.kelas_id,
          mata_pelajaran_id: item.mata_pelajaran_id,
          guru_id: item.guru_id,
          hari: item.hari,
          jam_mulai: item.jam_mulai,
          jam_selesai: item.jam_selesai,
          ruangan: item.ruangan || null
        }, { transaction });

        createdJadwal.push(jadwal);

      } catch (error) {
        errors.push({
          index: i,
          error: error.message
        });
      }
    }

    if (errors.length > 0 && createdJadwal.length === 0) {
      await transaction.rollback();
      return errorResponse(res, 'Semua jadwal gagal ditambahkan', 400, errors);
    }

    await transaction.commit();

    successResponse(res, {
      created: createdJadwal.length,
      failed: errors.length,
      errors: errors.length > 0 ? errors : null
    }, `Berhasil menambahkan ${createdJadwal.length} jadwal${errors.length > 0 ? `, ${errors.length} gagal` : ''}`, 201);

  } catch (error) {
    await transaction.rollback();
    console.error('Bulk create jadwal error:', error);
    errorResponse(res, 'Gagal menambahkan jadwal pelajaran', 500);
  }
};

module.exports = {
  getAllJadwalPelajaran,
  getJadwalByKelas,
  getJadwalByGuru,
  getJadwalById,
  createJadwalPelajaran,
  updateJadwalPelajaran,
  deleteJadwalPelajaran,
  bulkCreateJadwal
};