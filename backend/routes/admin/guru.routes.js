// routes/admin/guru.routes.js
const express = require('express');
const router = express.Router();
const guruController = require('../../controllers/guruController');
const { verifyToken, adminOnly } = require('../../middlewares/auth');

// Semua route dilindungi dengan verifyToken dan adminOnly
router.use(verifyToken, adminOnly);

/**
 * @route   GET /api/admin/guru
 * @desc    Get all guru (dengan pagination, search)
 * @access  Admin
 */
router.get('/', guruController.getAllGuru);

/**
 * @route   GET /api/admin/guru/:id
 * @desc    Get single guru by ID
 * @access  Admin
 */
router.get('/:id', guruController.getGuruById);

/**
 * @route   POST /api/admin/guru
 * @desc    Create guru baru
 * @access  Admin
 */
router.post('/', guruController.createGuru);

/**
 * @route   PUT /api/admin/guru/:id
 * @desc    Update data guru
 * @access  Admin
 */
router.put('/:id', guruController.updateGuru);

/**
 * @route   DELETE /api/admin/guru/:id
 * @desc    Delete guru
 * @access  Admin
 */
router.delete('/:id', guruController.deleteGuru);

/**
 * @route   PUT /api/admin/guru/:id/reset-password
 * @desc    Reset password guru
 * @access  Admin
 */
router.put('/:id/reset-password', guruController.resetPasswordGuru);

/**
 * @route   GET /api/admin/guru/:id/kelas
 * @desc    Get kelas yang diampu oleh guru
 * @access  Admin
 */
router.get('/:id/kelas', guruController.getKelasByGuru);

module.exports = router;