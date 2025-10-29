// routes/admin/pembayaran.routes.js
const express = require('express');
const router = express.Router();
const pembayaranController = require('../../controllers/pembayaranController');
const { verifyToken, adminOnly, checkRole } = require('../../middlewares/auth');
const { uploadBuktiBayar } = require('../../config/multer');

// Semua route dilindungi dengan verifyToken
router.use(verifyToken);

/**
 * @route   GET /api/admin/pembayaran
 * @desc    Get all pembayaran (dengan pagination, filter)
 * @query   page, limit, siswa_id, list_pembayaran_id, status, tanggal_mulai, tanggal_selesai
 * @access  Admin
 */
router.get('/', adminOnly, pembayaranController.getAllPembayaran);

/**
 * @route   GET /api/admin/pembayaran/siswa/:siswa_id
 * @desc    Get pembayaran by siswa
 * @query   status, tahun
 * @access  Admin, Guru, Siswa (own data only)
 */
router.get('/siswa/:siswa_id', 
  checkRole('admin', 'guru', 'siswa'), 
  pembayaranController.getPembayaranBySiswa
);

/**
 * @route   GET /api/admin/pembayaran/rekap/statistik
 * @desc    Get rekap pembayaran (statistik)
 * @query   tahun, bulan, kelas_id
 * @access  Admin
 */
router.get('/rekap/statistik', 
  adminOnly, 
  pembayaranController.getRekapPembayaran
);

/**
 * @route   GET /api/admin/pembayaran/:id
 * @desc    Get single pembayaran by ID
 * @access  Admin, Guru
 */
router.get('/:id', 
  checkRole('admin', 'guru'), 
  pembayaranController.getPembayaranById
);

/**
 * @route   POST /api/admin/pembayaran
 * @desc    Create pembayaran baru (dengan upload bukti bayar optional)
 * @access  Admin, Guru, Siswa
 */
router.post('/', 
  checkRole('admin', 'guru', 'siswa'),
  uploadBuktiBayar.single('bukti_bayar'),
  pembayaranController.createPembayaran
);

/**
 * @route   PUT /api/admin/pembayaran/:id
 * @desc    Update pembayaran (edit jumlah, tanggal, catatan)
 * @access  Admin, Guru
 */
router.put('/:id', 
  checkRole('admin', 'guru'),
  uploadBuktiBayar.single('bukti_bayar'),
  pembayaranController.updatePembayaran
);

/**
 * @route   PUT /api/admin/pembayaran/:id/approve
 * @desc    Approve pembayaran
 * @access  Admin
 */
router.put('/:id/approve', 
  adminOnly, 
  pembayaranController.approvePembayaran
);

/**
 * @route   PUT /api/admin/pembayaran/:id/reject
 * @desc    Reject pembayaran
 * @access  Admin
 */
router.put('/:id/reject', 
  adminOnly, 
  pembayaranController.rejectPembayaran
);

/**
 * @route   DELETE /api/admin/pembayaran/:id
 * @desc    Delete pembayaran
 * @access  Admin only
 */
router.delete('/:id', adminOnly, pembayaranController.deletePembayaran);

module.exports = router;