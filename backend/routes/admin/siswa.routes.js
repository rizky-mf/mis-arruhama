// routes/admin/siswa.routes.js
const express = require('express');
const router = express.Router();
const siswaController = require('../../controllers/siswaController');
const { verifyToken, adminOnly } = require('../../middlewares/auth');

// Semua route dilindungi dengan verifyToken dan adminOnly
router.use(verifyToken, adminOnly);

/**
 * @route   GET /api/admin/siswa
 * @desc    Get all siswa (dengan pagination, search, filter)
 * @access  Admin
 */
router.get('/', siswaController.getAllSiswa);

/**
 * @route   GET /api/admin/siswa/:id
 * @desc    Get single siswa by ID
 * @access  Admin
 */
router.get('/:id', siswaController.getSiswaById);

/**
 * @route   POST /api/admin/siswa
 * @desc    Create siswa baru (manual)
 * @access  Admin
 */
router.post('/', siswaController.createSiswa);

/**
 * @route   PUT /api/admin/siswa/:id
 * @desc    Update data siswa
 * @access  Admin
 */
router.put('/:id', siswaController.updateSiswa);

/**
 * @route   DELETE /api/admin/siswa/:id
 * @desc    Delete siswa (soft delete)
 * @access  Admin
 */
router.delete('/:id', siswaController.deleteSiswa);

/**
 * @route   PUT /api/admin/siswa/:id/reset-password
 * @desc    Reset password siswa
 * @access  Admin
 */
router.put('/:id/reset-password', siswaController.resetPasswordSiswa);

module.exports = router;