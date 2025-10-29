// controllers/presensiController.js
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
 * Get all presensi dengan pagination dan filter
 * GET /api/admin/presensi
 */
const getAllPresensi = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      kelas_id = '', 
      siswa_id = '',
      tanggal_mulai = '',
      tanggal_selesai = '',
      status = ''
    } = req.query;
    
    const { offset, limit: pageLimit } = getPagination(page, limit);

    // Build where clause
    const where = {};
    
    if (kelas_id) where.kelas_id = kelas_id;
    if (siswa_id) where.siswa_id = siswa_id;
    if (status) where.status = status;
    
    // Filter tanggal
    if (tanggal_mulai && tanggal_selesai) {
      where.tanggal = {
        [Op.between]: [tanggal_mulai, tanggal_selesai]
      };
    } else if (tanggal_mulai) {
      where.tanggal = {
        [Op.gte]: tanggal_mulai
      };
    } else if (tanggal_selesai) {
      where.tanggal = {
        [Op.lte]: tanggal_selesai
      };
    }

    // Query dengan relasi
    const { count, rows } = await db.Presensi.findAndCountAll({
      where,
      include: [
        {
          model: db.Siswa,
          as: 'siswa',
          attributes: ['id', 'nisn', 'nama_lengkap', 'jenis_kelamin']
        },
        {
          model: db.Kelas,
          as: 'kelas',
          attributes: ['id', 'nama_kelas', 'tingkat']
        },
        {
          model: db.User,
          as: 'creator',
          attributes: ['id', 'username', 'role']
        }
      ],
      offset,
      limit: pageLimit,
      order: [['tanggal', 'DESC'], ['created_at', 'DESC']]
    });

    const pagination = getPaginationMeta(count, page, limit);

    successResponse(res, {
      presensi: rows,
      pagination
    }, 'Data presensi berhasil diambil');

  } catch (error) {
    console.error('Get all presensi error:', error);
    errorResponse(res, 'Gagal mengambil data presensi', 500);
  }
};

/**
 * Get presensi by kelas dan tanggal
 * GET /api/admin/presensi/kelas/:kelas_id/tanggal/:tanggal
 */
const getPresensiByKelasAndTanggal = async (req, res) => {
  try {
    const { kelas_id, tanggal } = req.params;

    // Cek kelas exists
    const kelas = await db.Kelas.findByPk(kelas_id, {
      attributes: ['id', 'nama_kelas', 'tingkat'],
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

    // Get semua siswa di kelas
    const siswa = await db.Siswa.findAll({
      where: { 
        kelas_id,
        status: 'aktif'
      },
      attributes: ['id', 'nisn', 'nama_lengkap', 'jenis_kelamin'],
      order: [['nama_lengkap', 'ASC']]
    });

    // Get presensi untuk tanggal tersebut
    const presensi = await db.Presensi.findAll({
      where: {
        kelas_id,
        tanggal
      },
      include: [
        {
          model: db.Siswa,
          as: 'siswa',
          attributes: ['id', 'nisn', 'nama_lengkap']
        }
      ]
    });

    // Map presensi ke siswa
    const presensiMap = {};
    presensi.forEach(p => {
      presensiMap[p.siswa_id] = {
        id: p.id,
        status: p.status,
        keterangan: p.keterangan
      };
    });

    // Gabungkan data
    const dataPresensi = siswa.map(s => ({
      siswa_id: s.id,
      nisn: s.nisn,
      nama_lengkap: s.nama_lengkap,
      jenis_kelamin: s.jenis_kelamin,
      presensi_id: presensiMap[s.id]?.id || null,
      status: presensiMap[s.id]?.status || null,
      keterangan: presensiMap[s.id]?.keterangan || null
    }));

    // Hitung statistik
    const stats = {
      total_siswa: siswa.length,
      hadir: dataPresensi.filter(d => d.status === 'hadir').length,
      sakit: dataPresensi.filter(d => d.status === 'sakit').length,
      izin: dataPresensi.filter(d => d.status === 'izin').length,
      alpa: dataPresensi.filter(d => d.status === 'alpa').length,
      belum_absen: dataPresensi.filter(d => !d.status).length
    };

    successResponse(res, {
      kelas,
      tanggal,
      data_presensi: dataPresensi,
      statistik: stats
    }, 'Data presensi berhasil diambil');

  } catch (error) {
    console.error('Get presensi by kelas and tanggal error:', error);
    errorResponse(res, 'Gagal mengambil data presensi', 500);
  }
};

/**
 * Get presensi by siswa (history presensi siswa)
 * GET /api/admin/presensi/siswa/:siswa_id
 */
const getPresensiBySiswa = async (req, res) => {
  try {
    const { siswa_id } = req.params;
    const { bulan, tahun } = req.query;

    // Cek siswa exists
    const siswa = await db.Siswa.findByPk(siswa_id, {
      attributes: ['id', 'nisn', 'nama_lengkap', 'status'],
      include: [
        {
          model: db.Kelas,
          as: 'kelas',
          attributes: ['nama_kelas', 'tingkat']
        }
      ]
    });

    if (!siswa) {
      return errorResponse(res, 'Siswa tidak ditemukan', 404);
    }

    // Build where clause
    const where = { siswa_id };

    // Filter bulan dan tahun
    if (bulan && tahun) {
      const startDate = `${tahun}-${String(bulan).padStart(2, '0')}-01`;
      const endDate = new Date(tahun, bulan, 0);
      const endDateStr = formatDate(endDate);
      
      where.tanggal = {
        [Op.between]: [startDate, endDateStr]
      };
    }

    // Get presensi
    const presensi = await db.Presensi.findAll({
      where,
      attributes: ['id', 'tanggal', 'status', 'keterangan'],
      order: [['tanggal', 'DESC']]
    });

    // Hitung statistik
    const stats = {
      total_hari: presensi.length,
      hadir: presensi.filter(p => p.status === 'hadir').length,
      sakit: presensi.filter(p => p.status === 'sakit').length,
      izin: presensi.filter(p => p.status === 'izin').length,
      alpa: presensi.filter(p => p.status === 'alpa').length
    };

    // Hitung persentase kehadiran
    const persentase_kehadiran = presensi.length > 0 
      ? ((stats.hadir / presensi.length) * 100).toFixed(2)
      : 0;

    successResponse(res, {
      siswa,
      periode: bulan && tahun ? `${bulan}/${tahun}` : 'Semua',
      presensi,
      statistik: {
        ...stats,
        persentase_kehadiran: parseFloat(persentase_kehadiran)
      }
    }, 'Data presensi siswa berhasil diambil');

  } catch (error) {
    console.error('Get presensi by siswa error:', error);
    errorResponse(res, 'Gagal mengambil data presensi siswa', 500);
  }
};

/**
 * Get single presensi by ID
 * GET /api/admin/presensi/:id
 */
const getPresensiById = async (req, res) => {
  try {
    const { id } = req.params;

    const presensi = await db.Presensi.findByPk(id, {
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

    if (!presensi) {
      return errorResponse(res, 'Presensi tidak ditemukan', 404);
    }

    successResponse(res, presensi, 'Data presensi berhasil diambil');

  } catch (error) {
    console.error('Get presensi by id error:', error);
    errorResponse(res, 'Gagal mengambil data presensi', 500);
  }
};

/**
 * Create/Update presensi (single)
 * POST /api/admin/presensi
 */
const createOrUpdatePresensi = async (req, res) => {
  try {
    const {
      siswa_id,
      kelas_id,
      tanggal,
      status,
      keterangan
    } = req.body;

    const created_by = req.user.id;

    // Validasi input
    if (!siswa_id || !kelas_id || !tanggal || !status) {
      return errorResponse(res, 'siswa_id, kelas_id, tanggal, dan status wajib diisi', 400);
    }

    // Validasi status
    const statusValid = ['hadir', 'sakit', 'izin', 'alpa'];
    if (!statusValid.includes(status)) {
      return errorResponse(res, 'Status tidak valid (hadir/sakit/izin/alpa)', 400);
    }

    // Cek siswa exists dan di kelas yang benar
    const siswa = await db.Siswa.findOne({
      where: {
        id: siswa_id,
        kelas_id,
        status: 'aktif'
      }
    });

    if (!siswa) {
      return errorResponse(res, 'Siswa tidak ditemukan di kelas ini atau status tidak aktif', 404);
    }

    // Cek apakah sudah ada presensi di tanggal tersebut
    const existingPresensi = await db.Presensi.findOne({
      where: {
        siswa_id,
        kelas_id,
        tanggal
      }
    });

    let presensi;

    if (existingPresensi) {
      // Update presensi existing
      await existingPresensi.update({
        status,
        keterangan: keterangan || existingPresensi.keterangan
      });
      presensi = existingPresensi;
    } else {
      // Create presensi baru
      presensi = await db.Presensi.create({
        siswa_id,
        kelas_id,
        tanggal,
        status,
        keterangan: keterangan || null,
        created_by
      });
    }

    // Get presensi with relations
    const presensiWithRelations = await db.Presensi.findByPk(presensi.id, {
      include: [
        {
          model: db.Siswa,
          as: 'siswa',
          attributes: ['nisn', 'nama_lengkap']
        },
        {
          model: db.Kelas,
          as: 'kelas',
          attributes: ['nama_kelas']
        }
      ]
    });

    const message = existingPresensi 
      ? 'Presensi berhasil diupdate' 
      : 'Presensi berhasil ditambahkan';

    successResponse(res, presensiWithRelations, message, existingPresensi ? 200 : 201);

  } catch (error) {
    console.error('Create/Update presensi error:', error);
    errorResponse(res, 'Gagal menyimpan presensi', 500);
  }
};

/**
 * Bulk create/update presensi (untuk absen sekelas sekaligus)
 * POST /api/admin/presensi/bulk
 */
const bulkCreateOrUpdatePresensi = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { kelas_id, tanggal, presensi_list } = req.body;
    const created_by = req.user.id;

    // Validasi input
    if (!kelas_id || !tanggal || !Array.isArray(presensi_list) || presensi_list.length === 0) {
      return errorResponse(res, 'kelas_id, tanggal, dan presensi_list wajib diisi', 400);
    }

    // Cek kelas exists
    const kelas = await db.Kelas.findByPk(kelas_id);
    if (!kelas) {
      return errorResponse(res, 'Kelas tidak ditemukan', 404);
    }

    const results = {
      created: 0,
      updated: 0,
      errors: []
    };

    for (let i = 0; i < presensi_list.length; i++) {
      const item = presensi_list[i];
      
      try {
        // Validasi item
        if (!item.siswa_id || !item.status) {
          results.errors.push({
            index: i,
            siswa_id: item.siswa_id,
            error: 'siswa_id dan status wajib diisi'
          });
          continue;
        }

        // Validasi status
        const statusValid = ['hadir', 'sakit', 'izin', 'alpa'];
        if (!statusValid.includes(item.status)) {
          results.errors.push({
            index: i,
            siswa_id: item.siswa_id,
            error: 'Status tidak valid'
          });
          continue;
        }

        // Cek existing presensi
        const existing = await db.Presensi.findOne({
          where: {
            siswa_id: item.siswa_id,
            kelas_id,
            tanggal
          }
        });

        if (existing) {
          // Update
          await existing.update({
            status: item.status,
            keterangan: item.keterangan || existing.keterangan
          }, { transaction });
          results.updated++;
        } else {
          // Create
          await db.Presensi.create({
            siswa_id: item.siswa_id,
            kelas_id,
            tanggal,
            status: item.status,
            keterangan: item.keterangan || null,
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
    const message = `Berhasil menyimpan ${totalSuccess} presensi (${results.created} baru, ${results.updated} update)${results.errors.length > 0 ? `, ${results.errors.length} gagal` : ''}`;

    successResponse(res, results, message, 201);

  } catch (error) {
    await transaction.rollback();
    console.error('Bulk create/update presensi error:', error);
    errorResponse(res, 'Gagal menyimpan presensi', 500);
  }
};

/**
 * Update presensi
 * PUT /api/admin/presensi/:id
 */
const updatePresensi = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, keterangan } = req.body;

    const presensi = await db.Presensi.findByPk(id);
    if (!presensi) {
      return errorResponse(res, 'Presensi tidak ditemukan', 404);
    }

    // Validasi status jika diupdate
    if (status) {
      const statusValid = ['hadir', 'sakit', 'izin', 'alpa'];
      if (!statusValid.includes(status)) {
        return errorResponse(res, 'Status tidak valid', 400);
      }
    }

    // Update data
    await presensi.update({
      status: status || presensi.status,
      keterangan: keterangan !== undefined ? keterangan : presensi.keterangan
    });

    // Get updated presensi with relations
    const updatedPresensi = await db.Presensi.findByPk(id, {
      include: [
        {
          model: db.Siswa,
          as: 'siswa',
          attributes: ['nisn', 'nama_lengkap']
        },
        {
          model: db.Kelas,
          as: 'kelas',
          attributes: ['nama_kelas']
        }
      ]
    });

    successResponse(res, updatedPresensi, 'Presensi berhasil diupdate');

  } catch (error) {
    console.error('Update presensi error:', error);
    errorResponse(res, 'Gagal mengupdate presensi', 500);
  }
};

/**
 * Delete presensi
 * DELETE /api/admin/presensi/:id
 */
const deletePresensi = async (req, res) => {
  try {
    const { id } = req.params;

    const presensi = await db.Presensi.findByPk(id);
    if (!presensi) {
      return errorResponse(res, 'Presensi tidak ditemukan', 404);
    }

    await presensi.destroy();

    successResponse(res, null, 'Presensi berhasil dihapus');

  } catch (error) {
    console.error('Delete presensi error:', error);
    errorResponse(res, 'Gagal menghapus presensi', 500);
  }
};

/**
 * Get rekap presensi kelas (statistik bulanan)
 * GET /api/admin/presensi/rekap/kelas/:kelas_id
 */
const getRekapPresensiKelas = async (req, res) => {
  try {
    const { kelas_id } = req.params;
    const { bulan, tahun } = req.query;

    // Default ke bulan dan tahun sekarang
    const currentDate = new Date();
    const targetBulan = bulan || (currentDate.getMonth() + 1);
    const targetTahun = tahun || currentDate.getFullYear();

    // Cek kelas exists
    const kelas = await db.Kelas.findByPk(kelas_id, {
      attributes: ['id', 'nama_kelas', 'tingkat']
    });

    if (!kelas) {
      return errorResponse(res, 'Kelas tidak ditemukan', 404);
    }

    // Date range
    const startDate = `${targetTahun}-${String(targetBulan).padStart(2, '0')}-01`;
    const endDate = new Date(targetTahun, targetBulan, 0);
    const endDateStr = formatDate(endDate);

    // Get semua siswa aktif di kelas
    const siswa = await db.Siswa.findAll({
      where: {
        kelas_id,
        status: 'aktif'
      },
      attributes: ['id', 'nisn', 'nama_lengkap'],
      order: [['nama_lengkap', 'ASC']]
    });

    // Get presensi untuk periode tersebut
    const presensi = await db.Presensi.findAll({
      where: {
        kelas_id,
        tanggal: {
          [Op.between]: [startDate, endDateStr]
        }
      }
    });

    // Buat rekap per siswa
    const rekapPerSiswa = siswa.map(s => {
      const presensiSiswa = presensi.filter(p => p.siswa_id === s.id);
      
      const hadir = presensiSiswa.filter(p => p.status === 'hadir').length;
      const sakit = presensiSiswa.filter(p => p.status === 'sakit').length;
      const izin = presensiSiswa.filter(p => p.status === 'izin').length;
      const alpa = presensiSiswa.filter(p => p.status === 'alpa').length;
      const total = presensiSiswa.length;
      
      const persentase = total > 0 ? ((hadir / total) * 100).toFixed(2) : 0;

      return {
        siswa_id: s.id,
        nisn: s.nisn,
        nama_lengkap: s.nama_lengkap,
        hadir,
        sakit,
        izin,
        alpa,
        total_presensi: total,
        persentase_kehadiran: parseFloat(persentase)
      };
    });

    // Statistik kelas
    const totalHadir = rekapPerSiswa.reduce((sum, s) => sum + s.hadir, 0);
    const totalSakit = rekapPerSiswa.reduce((sum, s) => sum + s.sakit, 0);
    const totalIzin = rekapPerSiswa.reduce((sum, s) => sum + s.izin, 0);
    const totalAlpa = rekapPerSiswa.reduce((sum, s) => sum + s.alpa, 0);
    const totalPresensi = totalHadir + totalSakit + totalIzin + totalAlpa;
    
    const avgKehadiran = rekapPerSiswa.length > 0
      ? (rekapPerSiswa.reduce((sum, s) => sum + s.persentase_kehadiran, 0) / rekapPerSiswa.length).toFixed(2)
      : 0;

    successResponse(res, {
      kelas,
      periode: `${targetBulan}/${targetTahun}`,
      rekap_per_siswa: rekapPerSiswa,
      statistik_kelas: {
        total_siswa: siswa.length,
        total_hadir: totalHadir,
        total_sakit: totalSakit,
        total_izin: totalIzin,
        total_alpa: totalAlpa,
        total_presensi: totalPresensi,
        rata_rata_kehadiran: parseFloat(avgKehadiran)
      }
    }, 'Rekap presensi berhasil diambil');

  } catch (error) {
    console.error('Get rekap presensi error:', error);
    errorResponse(res, 'Gagal mengambil rekap presensi', 500);
  }
};

module.exports = {
  getAllPresensi,
  getPresensiByKelasAndTanggal,
  getPresensiBySiswa,
  getPresensiById,
  createOrUpdatePresensi,
  bulkCreateOrUpdatePresensi,
  updatePresensi,
  deletePresensi,
  getRekapPresensiKelas
};