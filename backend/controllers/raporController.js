// controllers/raporController.js
const db = require('../models');
const { Op } = require('sequelize');
const {
  getPagination,
  getPaginationMeta,
  successResponse,
  errorResponse
} = require('../utils/helper');

/**
 * Get all rapor dengan pagination dan filter
 * GET /api/admin/rapor
 */
const getAllRapor = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      siswa_id = '',
      kelas_id = '',
      mata_pelajaran_id = '',
      semester = '',
      tahun_ajaran = ''
    } = req.query;
    
    const { offset, limit: pageLimit } = getPagination(page, limit);

    // Build where clause
    const where = {};
    
    if (siswa_id) where.siswa_id = siswa_id;
    if (kelas_id) where.kelas_id = kelas_id;
    if (mata_pelajaran_id) where.mata_pelajaran_id = mata_pelajaran_id;
    if (semester) where.semester = semester;
    if (tahun_ajaran) where.tahun_ajaran = tahun_ajaran;

    // Query dengan relasi
    const { count, rows } = await db.Rapor.findAndCountAll({
      where,
      include: [
        {
          model: db.Siswa,
          as: 'siswa',
          attributes: ['id', 'nisn', 'nama_lengkap']
        },
        {
          model: db.MataPelajaran,
          as: 'mata_pelajaran',
          attributes: ['id', 'kode_mapel', 'nama_mapel']
        },
        {
          model: db.Kelas,
          as: 'kelas',
          attributes: ['id', 'nama_kelas', 'tingkat']
        },
        {
          model: db.User,
          as: 'creator',
          attributes: ['username']
        }
      ],
      offset,
      limit: pageLimit,
      order: [['tahun_ajaran', 'DESC'], ['semester', 'DESC'], ['created_at', 'DESC']]
    });

    const pagination = getPaginationMeta(count, page, limit);

    successResponse(res, {
      rapor: rows,
      pagination
    }, 'Data rapor berhasil diambil');

  } catch (error) {
    console.error('Get all rapor error:', error);
    errorResponse(res, 'Gagal mengambil data rapor', 500);
  }
};

/**
 * Get rapor by siswa
 * GET /api/admin/rapor/siswa/:siswa_id
 */
const getRaporBySiswa = async (req, res) => {
  try {
    const { siswa_id } = req.params;
    const { semester, tahun_ajaran } = req.query;

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
    
    if (semester) where.semester = semester;
    if (tahun_ajaran) where.tahun_ajaran = tahun_ajaran;

    // Get rapor
    const rapor = await db.Rapor.findAll({
      where,
      include: [
        {
          model: db.MataPelajaran,
          as: 'mata_pelajaran',
          attributes: ['kode_mapel', 'nama_mapel']
        },
        {
          model: db.Kelas,
          as: 'kelas',
          attributes: ['nama_kelas', 'tingkat']
        }
      ],
      order: [['mata_pelajaran', 'nama_mapel', 'ASC']]
    });

    // Hitung statistik
    const nilaiAkhirList = rapor.map(r => r.nilai_akhir).filter(n => n !== null);
    const rataRata = nilaiAkhirList.length > 0
      ? (nilaiAkhirList.reduce((sum, val) => sum + parseFloat(val), 0) / nilaiAkhirList.length).toFixed(2)
      : 0;

    // Hitung ranking predikat
    const predikatCount = {
      A: rapor.filter(r => r.predikat === 'A').length,
      B: rapor.filter(r => r.predikat === 'B').length,
      C: rapor.filter(r => r.predikat === 'C').length,
      D: rapor.filter(r => r.predikat === 'D').length
    };

    successResponse(res, {
      siswa,
      periode: {
        semester: semester || 'Semua',
        tahun_ajaran: tahun_ajaran || 'Semua'
      },
      rapor,
      statistik: {
        total_mapel: rapor.length,
        rata_rata_nilai: parseFloat(rataRata),
        predikat: predikatCount
      }
    }, 'Rapor siswa berhasil diambil');

  } catch (error) {
    console.error('Get rapor by siswa error:', error);
    errorResponse(res, 'Gagal mengambil rapor siswa', 500);
  }
};

/**
 * Get rapor by kelas
 * GET /api/admin/rapor/kelas/:kelas_id
 */
const getRaporByKelas = async (req, res) => {
  try {
    const { kelas_id } = req.params;
    const { semester, tahun_ajaran, mata_pelajaran_id } = req.query;

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

    // Build where clause
    const where = { kelas_id };
    
    if (semester) where.semester = semester;
    if (tahun_ajaran) where.tahun_ajaran = tahun_ajaran;
    if (mata_pelajaran_id) where.mata_pelajaran_id = mata_pelajaran_id;

    // Get rapor
    const rapor = await db.Rapor.findAll({
      where,
      include: [
        {
          model: db.Siswa,
          as: 'siswa',
          attributes: ['id', 'nisn', 'nama_lengkap']
        },
        {
          model: db.MataPelajaran,
          as: 'mata_pelajaran',
          attributes: ['kode_mapel', 'nama_mapel']
        }
      ],
      order: [
        ['siswa', 'nama_lengkap', 'ASC'],
        ['mata_pelajaran', 'nama_mapel', 'ASC']
      ]
    });

    // Group by siswa jika tidak ada filter mata pelajaran
    let dataRapor;
    if (!mata_pelajaran_id) {
      const siswaMap = {};
      rapor.forEach(r => {
        const siswaId = r.siswa_id;
        if (!siswaMap[siswaId]) {
          siswaMap[siswaId] = {
            siswa: r.siswa,
            nilai: [],
            rata_rata: 0
          };
        }
        siswaMap[siswaId].nilai.push({
          mata_pelajaran: r.mata_pelajaran,
          nilai_akhir: r.nilai_akhir,
          predikat: r.predikat
        });
      });

      // Hitung rata-rata per siswa
      Object.keys(siswaMap).forEach(siswaId => {
        const nilaiList = siswaMap[siswaId].nilai
          .map(n => n.nilai_akhir)
          .filter(n => n !== null);
        
        const rataRata = nilaiList.length > 0
          ? (nilaiList.reduce((sum, val) => sum + parseFloat(val), 0) / nilaiList.length).toFixed(2)
          : 0;
        
        siswaMap[siswaId].rata_rata = parseFloat(rataRata);
      });

      dataRapor = Object.values(siswaMap);
    } else {
      dataRapor = rapor;
    }

    successResponse(res, {
      kelas,
      periode: {
        semester: semester || 'Semua',
        tahun_ajaran: tahun_ajaran || kelas.tahun_ajaran
      },
      data_rapor: dataRapor,
      total: rapor.length
    }, 'Rapor kelas berhasil diambil');

  } catch (error) {
    console.error('Get rapor by kelas error:', error);
    errorResponse(res, 'Gagal mengambil rapor kelas', 500);
  }
};

/**
 * Get single rapor by ID
 * GET /api/admin/rapor/:id
 */
const getRaporById = async (req, res) => {
  try {
    const { id } = req.params;

    const rapor = await db.Rapor.findByPk(id, {
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
          model: db.MataPelajaran,
          as: 'mata_pelajaran',
          attributes: ['id', 'kode_mapel', 'nama_mapel']
        },
        {
          model: db.Kelas,
          as: 'kelas',
          attributes: ['id', 'nama_kelas', 'tingkat']
        },
        {
          model: db.User,
          as: 'creator',
          attributes: ['username', 'role']
        }
      ]
    });

    if (!rapor) {
      return errorResponse(res, 'Rapor tidak ditemukan', 404);
    }

    successResponse(res, rapor, 'Data rapor berhasil diambil');

  } catch (error) {
    console.error('Get rapor by id error:', error);
    errorResponse(res, 'Gagal mengambil data rapor', 500);
  }
};

/**
 * Create rapor (input nilai)
 * POST /api/admin/rapor
 */
const createRapor = async (req, res) => {
  try {
    const {
      siswa_id,
      mata_pelajaran_id,
      kelas_id,
      semester,
      tahun_ajaran,
      nilai_harian,
      nilai_uts,
      nilai_uas,
      catatan
    } = req.body;

    const created_by = req.user.id;

    // Validasi input
    if (!siswa_id || !mata_pelajaran_id || !kelas_id || !semester || !tahun_ajaran) {
      return errorResponse(res, 'siswa_id, mata_pelajaran_id, kelas_id, semester, dan tahun_ajaran wajib diisi', 400);
    }

    // Validasi semester
    if (!['1', '2'].includes(semester)) {
      return errorResponse(res, 'Semester harus 1 atau 2', 400);
    }

    // Cek siswa exists
    const siswa = await db.Siswa.findByPk(siswa_id);
    if (!siswa) {
      return errorResponse(res, 'Siswa tidak ditemukan', 404);
    }

    // Cek mata pelajaran exists
    const mataPelajaran = await db.MataPelajaran.findByPk(mata_pelajaran_id);
    if (!mataPelajaran) {
      return errorResponse(res, 'Mata pelajaran tidak ditemukan', 404);
    }

    // Cek kelas exists
    const kelas = await db.Kelas.findByPk(kelas_id);
    if (!kelas) {
      return errorResponse(res, 'Kelas tidak ditemukan', 404);
    }

    // Cek duplikat rapor
    const existingRapor = await db.Rapor.findOne({
      where: {
        siswa_id,
        mata_pelajaran_id,
        semester,
        tahun_ajaran
      }
    });

    if (existingRapor) {
      return errorResponse(res, 'Rapor untuk siswa, mapel, semester, dan tahun ajaran ini sudah ada. Gunakan update.', 400);
    }

    // Hitung nilai akhir (rata-rata dari nilai harian, UTS, UAS)
    let nilaiAkhir = null;
    let predikat = null;

    const nilaiList = [nilai_harian, nilai_uts, nilai_uas].filter(n => n !== null && n !== undefined);
    
    if (nilaiList.length > 0) {
      nilaiAkhir = (nilaiList.reduce((sum, val) => sum + parseFloat(val), 0) / nilaiList.length).toFixed(2);
      
      // Tentukan predikat
      if (nilaiAkhir >= 85) predikat = 'A';
      else if (nilaiAkhir >= 70) predikat = 'B';
      else if (nilaiAkhir >= 55) predikat = 'C';
      else predikat = 'D';
    }

    // Create rapor
    const rapor = await db.Rapor.create({
      siswa_id,
      mata_pelajaran_id,
      kelas_id,
      semester,
      tahun_ajaran,
      nilai_harian: nilai_harian || null,
      nilai_uts: nilai_uts || null,
      nilai_uas: nilai_uas || null,
      nilai_akhir: nilaiAkhir,
      predikat,
      catatan: catatan || null,
      created_by
    });

    // Get rapor with relations
    const raporWithRelations = await db.Rapor.findByPk(rapor.id, {
      include: [
        {
          model: db.Siswa,
          as: 'siswa',
          attributes: ['nisn', 'nama_lengkap']
        },
        {
          model: db.MataPelajaran,
          as: 'mata_pelajaran',
          attributes: ['kode_mapel', 'nama_mapel']
        },
        {
          model: db.Kelas,
          as: 'kelas',
          attributes: ['nama_kelas', 'tingkat']
        }
      ]
    });

    successResponse(res, raporWithRelations, 'Rapor berhasil ditambahkan', 201);

  } catch (error) {
    console.error('Create rapor error:', error);
    errorResponse(res, 'Gagal menambahkan rapor', 500);
  }
};

/**
 * Update rapor (update nilai)
 * PUT /api/admin/rapor/:id
 */
const updateRapor = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nilai_harian,
      nilai_uts,
      nilai_uas,
      catatan
    } = req.body;

    const rapor = await db.Rapor.findByPk(id);
    if (!rapor) {
      return errorResponse(res, 'Rapor tidak ditemukan', 404);
    }

    // Update nilai
    const newNilaiHarian = nilai_harian !== undefined ? nilai_harian : rapor.nilai_harian;
    const newNilaiUts = nilai_uts !== undefined ? nilai_uts : rapor.nilai_uts;
    const newNilaiUas = nilai_uas !== undefined ? nilai_uas : rapor.nilai_uas;

    // Hitung ulang nilai akhir
    let nilaiAkhir = null;
    let predikat = null;

    const nilaiList = [newNilaiHarian, newNilaiUts, newNilaiUas].filter(n => n !== null && n !== undefined);
    
    if (nilaiList.length > 0) {
      nilaiAkhir = (nilaiList.reduce((sum, val) => sum + parseFloat(val), 0) / nilaiList.length).toFixed(2);
      
      // Tentukan predikat
      if (nilaiAkhir >= 85) predikat = 'A';
      else if (nilaiAkhir >= 70) predikat = 'B';
      else if (nilaiAkhir >= 55) predikat = 'C';
      else predikat = 'D';
    }

    // Update rapor
    await rapor.update({
      nilai_harian: newNilaiHarian,
      nilai_uts: newNilaiUts,
      nilai_uas: newNilaiUas,
      nilai_akhir: nilaiAkhir,
      predikat,
      catatan: catatan !== undefined ? catatan : rapor.catatan
    });

    // Get updated rapor with relations
    const updatedRapor = await db.Rapor.findByPk(id, {
      include: [
        {
          model: db.Siswa,
          as: 'siswa',
          attributes: ['nisn', 'nama_lengkap']
        },
        {
          model: db.MataPelajaran,
          as: 'mata_pelajaran',
          attributes: ['kode_mapel', 'nama_mapel']
        },
        {
          model: db.Kelas,
          as: 'kelas',
          attributes: ['nama_kelas', 'tingkat']
        }
      ]
    });

    successResponse(res, updatedRapor, 'Rapor berhasil diupdate');

  } catch (error) {
    console.error('Update rapor error:', error);
    errorResponse(res, 'Gagal mengupdate rapor', 500);
  }
};

/**
 * Delete rapor
 * DELETE /api/admin/rapor/:id
 */
const deleteRapor = async (req, res) => {
  try {
    const { id } = req.params;

    const rapor = await db.Rapor.findByPk(id);
    if (!rapor) {
      return errorResponse(res, 'Rapor tidak ditemukan', 404);
    }

    await rapor.destroy();

    successResponse(res, null, 'Rapor berhasil dihapus');

  } catch (error) {
    console.error('Delete rapor error:', error);
    errorResponse(res, 'Gagal menghapus rapor', 500);
  }
};

/**
 * Bulk create rapor (input nilai sekelas untuk 1 mapel)
 * POST /api/admin/rapor/bulk
 */
const bulkCreateRapor = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { 
      kelas_id, 
      mata_pelajaran_id,
      semester,
      tahun_ajaran,
      rapor_list 
    } = req.body;
    
    const created_by = req.user.id;

    // Validasi input
    if (!kelas_id || !mata_pelajaran_id || !semester || !tahun_ajaran || !Array.isArray(rapor_list) || rapor_list.length === 0) {
      return errorResponse(res, 'kelas_id, mata_pelajaran_id, semester, tahun_ajaran, dan rapor_list wajib diisi', 400);
    }

    // Validasi semester
    if (!['1', '2'].includes(semester)) {
      return errorResponse(res, 'Semester harus 1 atau 2', 400);
    }

    // Cek kelas dan mata pelajaran exists
    const kelas = await db.Kelas.findByPk(kelas_id);
    const mataPelajaran = await db.MataPelajaran.findByPk(mata_pelajaran_id);

    if (!kelas || !mataPelajaran) {
      return errorResponse(res, 'Kelas atau mata pelajaran tidak ditemukan', 404);
    }

    const results = {
      created: 0,
      updated: 0,
      errors: []
    };

    for (let i = 0; i < rapor_list.length; i++) {
      const item = rapor_list[i];
      
      try {
        // Validasi item
        if (!item.siswa_id) {
          results.errors.push({
            index: i,
            siswa_id: item.siswa_id,
            error: 'siswa_id wajib diisi'
          });
          continue;
        }

        // Hitung nilai akhir
        let nilaiAkhir = null;
        let predikat = null;

        const nilaiList = [item.nilai_harian, item.nilai_uts, item.nilai_uas].filter(n => n !== null && n !== undefined);
        
        if (nilaiList.length > 0) {
          nilaiAkhir = (nilaiList.reduce((sum, val) => sum + parseFloat(val), 0) / nilaiList.length).toFixed(2);
          
          if (nilaiAkhir >= 85) predikat = 'A';
          else if (nilaiAkhir >= 70) predikat = 'B';
          else if (nilaiAkhir >= 55) predikat = 'C';
          else predikat = 'D';
        }

        // Cek existing rapor
        const existing = await db.Rapor.findOne({
          where: {
            siswa_id: item.siswa_id,
            mata_pelajaran_id,
            semester,
            tahun_ajaran
          }
        });

        if (existing) {
          // Update
          await existing.update({
            nilai_harian: item.nilai_harian || existing.nilai_harian,
            nilai_uts: item.nilai_uts || existing.nilai_uts,
            nilai_uas: item.nilai_uas || existing.nilai_uas,
            nilai_akhir: nilaiAkhir,
            predikat,
            catatan: item.catatan || existing.catatan
          }, { transaction });
          results.updated++;
        } else {
          // Create
          await db.Rapor.create({
            siswa_id: item.siswa_id,
            mata_pelajaran_id,
            kelas_id,
            semester,
            tahun_ajaran,
            nilai_harian: item.nilai_harian || null,
            nilai_uts: item.nilai_uts || null,
            nilai_uas: item.nilai_uas || null,
            nilai_akhir: nilaiAkhir,
            predikat,
            catatan: item.catatan || null,
            created_by
          }, { transaction });
          results.created++;
        }

      } catch (error) {
        results.errors.push({
          index: i,
          siswa_id: item.siswa_id,
          error: error.message
        });
      }
    }

    await transaction.commit();

    const totalSuccess = results.created + results.updated;
    const message = `Berhasil menyimpan ${totalSuccess} rapor (${results.created} baru, ${results.updated} update)${results.errors.length > 0 ? `, ${results.errors.length} gagal` : ''}`;

    successResponse(res, results, message, 201);

  } catch (error) {
    await transaction.rollback();
    console.error('Bulk create rapor error:', error);
    errorResponse(res, 'Gagal menyimpan rapor', 500);
  }
};

/**
 * Get ranking siswa by kelas (berdasarkan rata-rata nilai)
 * GET /api/admin/rapor/ranking/kelas/:kelas_id
 */
const getRankingKelas = async (req, res) => {
  try {
    const { kelas_id } = req.params;
    const { semester, tahun_ajaran } = req.query;

    // Cek kelas exists
    const kelas = await db.Kelas.findByPk(kelas_id, {
      attributes: ['id', 'nama_kelas', 'tingkat', 'tahun_ajaran']
    });

    if (!kelas) {
      return errorResponse(res, 'Kelas tidak ditemukan', 404);
    }

    // Build where clause
    const where = { kelas_id };
    if (semester) where.semester = semester;
    if (tahun_ajaran) where.tahun_ajaran = tahun_ajaran;

    // Get semua rapor
    const rapor = await db.Rapor.findAll({
      where,
      include: [
        {
          model: db.Siswa,
          as: 'siswa',
          attributes: ['id', 'nisn', 'nama_lengkap']
        }
      ],
      attributes: ['siswa_id', 'nilai_akhir']
    });

    // Group by siswa dan hitung rata-rata
    const siswaMap = {};
    rapor.forEach(r => {
      const siswaId = r.siswa_id;
      if (!siswaMap[siswaId]) {
        siswaMap[siswaId] = {
          siswa: r.siswa,
          total_nilai: 0,
          jumlah_mapel: 0,
          rata_rata: 0
        };
      }
      
      if (r.nilai_akhir) {
        siswaMap[siswaId].total_nilai += parseFloat(r.nilai_akhir);
        siswaMap[siswaId].jumlah_mapel++;
      }
    });

    // Hitung rata-rata dan sort
    const ranking = Object.values(siswaMap)
      .map(data => ({
        siswa: data.siswa,
        jumlah_mapel: data.jumlah_mapel,
        rata_rata: data.jumlah_mapel > 0 
          ? parseFloat((data.total_nilai / data.jumlah_mapel).toFixed(2))
          : 0
      }))
      .sort((a, b) => b.rata_rata - a.rata_rata)
      .map((data, index) => ({
        ranking: index + 1,
        ...data
      }));

    successResponse(res, {
      kelas,
      periode: {
        semester: semester || 'Semua',
        tahun_ajaran: tahun_ajaran || kelas.tahun_ajaran
      },
      ranking,
      total_siswa: ranking.length
    }, 'Ranking kelas berhasil diambil');

  } catch (error) {
    console.error('Get ranking error:', error);
    errorResponse(res, 'Gagal mengambil ranking kelas', 500);
  }
};

module.exports = {
  getAllRapor,
  getRaporBySiswa,
  getRaporByKelas,
  getRaporById,
  createRapor,
  updateRapor,
  deleteRapor,
  bulkCreateRapor,
  getRankingKelas
};