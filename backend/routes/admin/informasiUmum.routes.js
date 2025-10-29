// routes/admin/informasiUmum.routes.js
const express = require('express');
const router = express.Router();
const informasiUmumController = require('../../controllers/informasiUmumController');
const { verifyToken, adminOnly, checkRole } = require('../../middlewares/auth');

// Semua route dilindungi dengan verifyToken
router.use(verifyToken);

/**
 * @route   GET /api/admin/informasi-umum
 * @desc    Get all informasi umum (dengan pagination, filter)
 * @query   page, limit, search, jenis, tanggal_mulai, tanggal_selesai
 * @access  Admin, Guru, Siswa
 */
router.get('/', 
  checkRole('admin', 'guru', 'siswa'), 
  informasiUmumController.getAllInformasiUmum
);

/**
 * @route   GET /api/admin/informasi-umum/aktif
 * @desc    Get informasi aktif (upcoming events & recent announcements)
 * @access  Admin, Guru, Siswa
 */
router.get('/aktif', 
  checkRole('admin', 'guru', 'siswa'), 
  informasiUmumController.getInformasiAktif
);

/**
 * @route   GET /api/admin/informasi-umum/jenis/:jenis
 * @desc    Get informasi by jenis (event/libur/pengumuman)
 * @query   limit
 * @access  Admin, Guru, Siswa
 */
router.get('/jenis/:jenis', 
  checkRole('admin', 'guru', 'siswa'), 
  informasiUmumController.getInformasiByJenis
);

/**
 * @route   GET /api/admin/informasi-umum/:id
 * @desc    Get single informasi umum by ID
 * @access  Admin, Guru, Siswa
 */
router.get('/:id', 
  checkRole('admin', 'guru', 'siswa'), 
  informasiUmumController.getInformasiById
);

/**
 * @route   POST /api/admin/informasi-umum
 * @desc    Create informasi umum baru
 * @access  Admin only
 */
router.post('/', 
  adminOnly, 
  informasiUmumController.createInformasiUmum
);

/**
 * @route   PUT /api/admin/informasi-umum/:id
 * @desc    Update informasi umum
 * @access  Admin only
 */
router.put('/:id', 
  adminOnly, 
  informasiUmumController.updateInformasiUmum
);

/**
 * @route   DELETE /api/admin/informasi-umum/:id
 * @desc    Delete informasi umum
 * @access  Admin only
 */
router.delete('/:id', 
  adminOnly, 
  informasiUmumController.deleteInformasiUmum
);

module.exports = router;