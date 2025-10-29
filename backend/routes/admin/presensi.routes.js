// routes/admin/presensi.routes.js
const express = require('express');
const router = express.Router();
const presensiController = require('../../controllers/presensiController');
const { verifyToken, adminOnly, checkRole } = require('../../middlewares/auth');

// Semua route dilindungi dengan verifyToken
router.use(verifyToken);

/**
 * @route   GET /api/admin/presensi
 * @desc    Get all presensi (dengan pagination, filter)
 * @query   page, limit, kelas_id, siswa_id, tanggal_mulai, tanggal_selesai, status
 * @access  Admin, Guru
 */
router.get('/', checkRole('admin', 'guru'), presensiController.getAllPresensi);

/**
 * @route   GET /api/admin/presensi/kelas/:kelas_id/tanggal/:tanggal
 * @desc    Get presensi by kelas dan tanggal (untuk absen harian)
 * @access  Admin, Guru
 */
router.get('/kelas/:kelas_id/tanggal/:tanggal', 
  checkRole('admin', 'guru'), 
  presensiController.getPresensiByKelasAndTanggal
);

/**
 * @route   GET /api/admin/presensi/siswa/:siswa_id
 * @desc    Get history presensi siswa
 * @query   bulan, tahun
 * @access  Admin, Guru
 */
router.get('/siswa/:siswa_id', 
  checkRole('admin', 'guru'), 
  presensiController.getPresensiBySiswa
);

/**
 * @route   GET /api/admin/presensi/rekap/kelas/:kelas_id
 * @desc    Get rekap presensi kelas (statistik bulanan)
 * @query   bulan, tahun
 * @access  Admin, Guru
 */
router.get('/rekap/kelas/:kelas_id', 
  checkRole('admin', 'guru'), 
  presensiController.getRekapPresensiKelas
);

/**
 * @route   POST /api/admin/presensi/bulk
 * @desc    Bulk create/update presensi (absen sekelas)
 * @access  Admin, Guru
 */
router.post('/bulk', 
  checkRole('admin', 'guru'), 
  presensiController.bulkCreateOrUpdatePresensi
);

/**
 * @route   GET /api/admin/presensi/:id
 * @desc    Get single presensi by ID
 * @access  Admin, Guru
 */
router.get('/:id', 
  checkRole('admin', 'guru'), 
  presensiController.getPresensiById
);

/**
 * @route   POST /api/admin/presensi
 * @desc    Create/Update presensi (single)
 * @access  Admin, Guru
 */
router.post('/', 
  checkRole('admin', 'guru'), 
  presensiController.createOrUpdatePresensi
);

/**
 * @route   PUT /api/admin/presensi/:id
 * @desc    Update presensi
 * @access  Admin, Guru
 */
router.put('/:id', 
  checkRole('admin', 'guru'), 
  presensiController.updatePresensi
);

/**
 * @route   DELETE /api/admin/presensi/:id
 * @desc    Delete presensi
 * @access  Admin only
 */
router.delete('/:id', adminOnly, presensiController.deletePresensi);

module.exports = router;