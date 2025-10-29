// routes/admin/rapor.routes.js
const express = require('express');
const router = express.Router();
const raporController = require('../../controllers/raporController');
const { verifyToken, adminOnly, checkRole } = require('../../middlewares/auth');

// Semua route dilindungi dengan verifyToken
router.use(verifyToken);

/**
 * @route   GET /api/admin/rapor
 * @desc    Get all rapor (dengan pagination, filter)
 * @query   page, limit, siswa_id, kelas_id, mata_pelajaran_id, semester, tahun_ajaran
 * @access  Admin, Guru
 */
router.get('/', checkRole('admin', 'guru'), raporController.getAllRapor);

/**
 * @route   GET /api/admin/rapor/siswa/:siswa_id
 * @desc    Get rapor by siswa
 * @query   semester, tahun_ajaran
 * @access  Admin, Guru, Siswa (own data only)
 */
router.get('/siswa/:siswa_id', 
  checkRole('admin', 'guru', 'siswa'), 
  raporController.getRaporBySiswa
);

/**
 * @route   GET /api/admin/rapor/kelas/:kelas_id
 * @desc    Get rapor by kelas
 * @query   semester, tahun_ajaran, mata_pelajaran_id
 * @access  Admin, Guru
 */
router.get('/kelas/:kelas_id', 
  checkRole('admin', 'guru'), 
  raporController.getRaporByKelas
);

/**
 * @route   GET /api/admin/rapor/ranking/kelas/:kelas_id
 * @desc    Get ranking siswa by kelas (berdasarkan rata-rata nilai)
 * @query   semester, tahun_ajaran
 * @access  Admin, Guru
 */
router.get('/ranking/kelas/:kelas_id', 
  checkRole('admin', 'guru'), 
  raporController.getRankingKelas
);

/**
 * @route   POST /api/admin/rapor/bulk
 * @desc    Bulk create rapor (input nilai sekelas untuk 1 mapel)
 * @access  Admin, Guru
 */
router.post('/bulk', 
  checkRole('admin', 'guru'), 
  raporController.bulkCreateRapor
);

/**
 * @route   GET /api/admin/rapor/:id
 * @desc    Get single rapor by ID
 * @access  Admin, Guru
 */
router.get('/:id', 
  checkRole('admin', 'guru'), 
  raporController.getRaporById
);

/**
 * @route   POST /api/admin/rapor
 * @desc    Create rapor (input nilai)
 * @access  Admin, Guru
 */
router.post('/', 
  checkRole('admin', 'guru'), 
  raporController.createRapor
);

/**
 * @route   PUT /api/admin/rapor/:id
 * @desc    Update rapor (update nilai)
 * @access  Admin, Guru
 */
router.put('/:id', 
  checkRole('admin', 'guru'), 
  raporController.updateRapor
);

/**
 * @route   DELETE /api/admin/rapor/:id
 * @desc    Delete rapor
 * @access  Admin only
 */
router.delete('/:id', adminOnly, raporController.deleteRapor);

module.exports = router;