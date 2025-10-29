// controllers/dashboardController.js
const db = require('../models');
const { Op } = require('sequelize');
const { successResponse, errorResponse } = require('../utils/helper');

/**
 * Get dashboard statistics untuk admin
 * GET /api/admin/dashboard
 */
const getDashboardStats = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const currentTahunAjaran = `${currentYear}/${currentYear + 1}`;

    // 1. Total Siswa
    const totalSiswa = await db.Siswa.count();
    const siswaAktif = await db.Siswa.count({ where: { status: 'aktif' } });
    const siswaLulus = await db.Siswa.count({ where: { status: 'lulus' } });
    const siswaPindah = await db.Siswa.count({ where: { status: 'pindah' } });

    // 2. Total Guru
    const totalGuru = await db.Guru.count();
    const guruAktif = await db.Guru.count({
      include: [{
        model: db.User,
        as: 'user',
        where: { is_active: true }
      }]
    });

    // 3. Total Kelas
    const totalKelas = await db.Kelas.count();
    const kelasTahunIni = await db.Kelas.count({
      where: { tahun_ajaran: currentTahunAjaran }
    });

    // 4. Statistik per Tingkat (jumlah siswa per tingkat)
    const statsPerTingkat = await db.Kelas.findAll({
      attributes: [
        'tingkat',
        [db.sequelize.fn('COUNT', db.sequelize.col('siswa.id')), 'jumlah_siswa']
      ],
      include: [{
        model: db.Siswa,
        as: 'siswa',
        attributes: [],
        where: { status: 'aktif' },
        required: false
      }],
      where: { tahun_ajaran: currentTahunAjaran },
      group: ['kelas.tingkat'],
      order: [['tingkat', 'ASC']],
      raw: true
    });

    // 5. Siswa Terbaru (5 siswa terakhir ditambahkan)
    const siswaTerbaru = await db.Siswa.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      attributes: ['id', 'nisn', 'nama_lengkap', 'jenis_kelamin', 'created_at'],
      include: [{
        model: db.Kelas,
        as: 'kelas',
        attributes: ['nama_kelas', 'tingkat']
      }]
    });

    // 6. Kelas dengan siswa terbanyak
    const kelasTerbanyak = await db.Kelas.findAll({
      attributes: [
        'id',
        'nama_kelas',
        'tingkat',
        [db.sequelize.fn('COUNT', db.sequelize.col('siswa.id')), 'jumlah_siswa']
      ],
      include: [{
        model: db.Siswa,
        as: 'siswa',
        attributes: [],
        where: { status: 'aktif' },
        required: false
      }, {
        model: db.Guru,
        as: 'wali_kelas',
        attributes: ['nama_lengkap']
      }],
      where: { tahun_ajaran: currentTahunAjaran },
      group: ['kelas.id', 'wali_kelas.id'],
      order: [[db.sequelize.literal('jumlah_siswa'), 'DESC']],
      limit: 5,
      subQuery: false
    });

    // 7. Jumlah siswa per jenis kelamin
    const statsByGender = await db.Siswa.findAll({
      attributes: [
        'jenis_kelamin',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'jumlah']
      ],
      where: { status: 'aktif' },
      group: ['jenis_kelamin'],
      raw: true
    });

    // 8. Guru yang menjadi wali kelas
    const guruWaliKelas = await db.Guru.count({
      include: [{
        model: db.Kelas,
        as: 'kelas_diampu',
        where: { tahun_ajaran: currentTahunAjaran },
        required: true
      }]
    });

    // Format response
    const dashboardData = {
      overview: {
        total_siswa: totalSiswa,
        siswa_aktif: siswaAktif,
        siswa_lulus: siswaLulus,
        siswa_pindah: siswaPindah,
        total_guru: totalGuru,
        guru_aktif: guruAktif,
        total_kelas: totalKelas,
        kelas_tahun_ini: kelasTahunIni,
        guru_wali_kelas: guruWaliKelas
      },
      siswa_by_gender: {
        laki_laki: statsByGender.find(s => s.jenis_kelamin === 'L')?.jumlah || 0,
        perempuan: statsByGender.find(s => s.jenis_kelamin === 'P')?.jumlah || 0
      },
      siswa_per_tingkat: statsPerTingkat.map(stat => ({
        tingkat: stat.tingkat,
        jumlah_siswa: parseInt(stat.jumlah_siswa) || 0
      })),
      siswa_terbaru: siswaTerbaru,
      kelas_terbanyak: kelasTerbanyak.map(k => ({
        id: k.id,
        nama_kelas: k.nama_kelas,
        tingkat: k.tingkat,
        jumlah_siswa: parseInt(k.get('jumlah_siswa')) || 0,
        wali_kelas: k.wali_kelas ? k.wali_kelas.nama_lengkap : null
      })),
      tahun_ajaran_aktif: currentTahunAjaran
    };

    successResponse(res, dashboardData, 'Dashboard data berhasil diambil');

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    errorResponse(res, 'Gagal mengambil dashboard data', 500);
  }
};

/**
 * Get chart data untuk grafik
 * GET /api/admin/dashboard/chart
 */
const getChartData = async (req, res) => {
  try {
    const { type = 'siswa_per_kelas' } = req.query;

    let chartData = {};

    if (type === 'siswa_per_kelas') {
      // Data untuk chart: Jumlah siswa per kelas
      const data = await db.Kelas.findAll({
        attributes: [
          'nama_kelas',
          [db.sequelize.fn('COUNT', db.sequelize.col('siswa.id')), 'jumlah']
        ],
        include: [{
          model: db.Siswa,
          as: 'siswa',
          attributes: [],
          where: { status: 'aktif' },
          required: false
        }],
        group: ['kelas.id'],
        order: [['tingkat', 'ASC'], ['nama_kelas', 'ASC']],
        raw: true
      });

      chartData = {
        labels: data.map(d => d.nama_kelas),
        values: data.map(d => parseInt(d.jumlah) || 0)
      };

    } else if (type === 'siswa_per_tingkat') {
      // Data untuk chart: Jumlah siswa per tingkat
      const data = await db.Kelas.findAll({
        attributes: [
          'tingkat',
          [db.sequelize.fn('COUNT', db.sequelize.col('siswa.id')), 'jumlah']
        ],
        include: [{
          model: db.Siswa,
          as: 'siswa',
          attributes: [],
          where: { status: 'aktif' },
          required: false
        }],
        group: ['kelas.tingkat'],
        order: [['tingkat', 'ASC']],
        raw: true
      });

      chartData = {
        labels: data.map(d => `Kelas ${d.tingkat}`),
        values: data.map(d => parseInt(d.jumlah) || 0)
      };

    } else if (type === 'gender') {
      // Data untuk chart: Perbandingan gender
      const data = await db.Siswa.findAll({
        attributes: [
          'jenis_kelamin',
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'jumlah']
        ],
        where: { status: 'aktif' },
        group: ['jenis_kelamin'],
        raw: true
      });

      chartData = {
        labels: ['Laki-laki', 'Perempuan'],
        values: [
          parseInt(data.find(d => d.jenis_kelamin === 'L')?.jumlah || 0),
          parseInt(data.find(d => d.jenis_kelamin === 'P')?.jumlah || 0)
        ]
      };
    }

    successResponse(res, chartData, 'Chart data berhasil diambil');

  } catch (error) {
    console.error('Get chart data error:', error);
    errorResponse(res, 'Gagal mengambil chart data', 500);
  }
};

/**
 * Get quick stats (untuk widget kecil)
 * GET /api/admin/dashboard/quick-stats
 */
const getQuickStats = async (req, res) => {
  try {
    // Quick stats sederhana
    const [siswaCount, guruCount, kelasCount] = await Promise.all([
      db.Siswa.count({ where: { status: 'aktif' } }),
      db.Guru.count(),
      db.Kelas.count()
    ]);

    const stats = {
      siswa: siswaCount,
      guru: guruCount,
      kelas: kelasCount
    };

    successResponse(res, stats, 'Quick stats berhasil diambil');

  } catch (error) {
    console.error('Get quick stats error:', error);
    errorResponse(res, 'Gagal mengambil quick stats', 500);
  }
};

module.exports = {
  getDashboardStats,
  getChartData,
  getQuickStats
};