// routes/admin/listPembayaran.routes.js
const express = require('express');
const router = express.Router();
const listPembayaranController = require('../../controllers/listPembayaranController');
const { verifyToken, adminOnly, checkRole } = require('../../middlewares/auth');

// Semua route dilindungi dengan verifyToken
router.use(verifyToken);

/**
 * @route   GET /api/admin/list-pembayaran
 * @desc    Get all list pembayaran (dengan pagination, filter)
 * @query   page, limit, search, periode, tingkat, status
 * @access  Admin, Guru
 */
router.get('/', 
  checkRole('admin', 'guru'), 
  listPembayaranController.getAllListPembayaran
);

/**
 * @route   GET /api/admin/list-pembayaran/tingkat/:tingkat
 * @desc    Get list pembayaran by tingkat
 * @access  Admin, Guru
 */
router.get('/tingkat/:tingkat', 
  checkRole('admin', 'guru'), 
  listPembayaranController.getListPembayaranByTingkat
);

/**
 * @route   GET /api/admin/list-pembayaran/:id
 * @desc    Get single list pembayaran by ID
 * @access  Admin, Guru
 */
router.get('/:id', 
  checkRole('admin', 'guru'), 
  listPembayaranController.getListPembayaranById
);

/**
 * @route   POST /api/admin/list-pembayaran
 * @desc    Create list pembayaran baru
 * @access  Admin only
 */
router.post('/', adminOnly, listPembayaranController.createListPembayaran);

/**
 * @route   PUT /api/admin/list-pembayaran/:id
 * @desc    Update list pembayaran
 * @access  Admin only
 */
router.put('/:id', adminOnly, listPembayaranController.updateListPembayaran);

/**
 * @route   PUT /api/admin/list-pembayaran/:id/toggle-status
 * @desc    Toggle status list pembayaran (aktif/nonaktif)
 * @access  Admin only
 */
router.put('/:id/toggle-status', adminOnly, listPembayaranController.toggleStatusListPembayaran);

/**
 * @route   DELETE /api/admin/list-pembayaran/:id
 * @desc    Delete list pembayaran
 * @access  Admin only
 */
router.delete('/:id', adminOnly, listPembayaranController.deleteListPembayaran);

module.exports = router;