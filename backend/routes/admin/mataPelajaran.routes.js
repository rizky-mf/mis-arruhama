// routes/admin/mataPelajaran.routes.js
const express = require('express');
const router = express.Router();
const mataPelajaranController = require('../../controllers/mataPelajaranController');
const { verifyToken, adminOnly } = require('../../middlewares/auth');

// Semua route dilindungi dengan verifyToken dan adminOnly
router.use(verifyToken, adminOnly);

/**
 * @route   GET /api/admin/mata-pelajaran
 * @desc    Get all mata pelajaran (dengan pagination, search, filter tingkat)
 * @access  Admin
 */
router.get('/', mataPelajaranController.getAllMataPelajaran);

/**
 * @route   GET /api/admin/mata-pelajaran/tingkat/:tingkat
 * @desc    Get mata pelajaran by tingkat
 * @access  Admin
 */
router.get('/tingkat/:tingkat', mataPelajaranController.getMataPelajaranByTingkat);

/**
 * @route   GET /api/admin/mata-pelajaran/:id
 * @desc    Get single mata pelajaran by ID
 * @access  Admin
 */
router.get('/:id', mataPelajaranController.getMataPelajaranById);

/**
 * @route   POST /api/admin/mata-pelajaran
 * @desc    Create mata pelajaran baru
 * @access  Admin
 */
router.post('/', mataPelajaranController.createMataPelajaran);

/**
 * @route   PUT /api/admin/mata-pelajaran/:id
 * @desc    Update data mata pelajaran
 * @access  Admin
 */
router.put('/:id', mataPelajaranController.updateMataPelajaran);

/**
 * @route   DELETE /api/admin/mata-pelajaran/:id
 * @desc    Delete mata pelajaran
 * @access  Admin
 */
router.delete('/:id', mataPelajaranController.deleteMataPelajaran);

module.exports = router;