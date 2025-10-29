// routes/admin/jadwalPelajaran.routes.js
const express = require('express');
const router = express.Router();
const jadwalPelajaranController = require('../../controllers/jadwalPelajaranController');
const { verifyToken, adminOnly } = require('../../middlewares/auth');

// Semua route dilindungi dengan verifyToken dan adminOnly
router.use(verifyToken, adminOnly);

/**
 * @route   GET /api/admin/jadwal-pelajaran
 * @desc    Get all jadwal pelajaran (dengan pagination, filter)
 * @query   page, limit, kelas_id, guru_id, hari, mata_pelajaran_id
 * @access  Admin
 */
router.get('/', jadwalPelajaranController.getAllJadwalPelajaran);

/**
 * @route   GET /api/admin/jadwal-pelajaran/kelas/:kelas_id
 * @desc    Get jadwal pelajaran by kelas (grouped by hari)
 * @access  Admin
 */
router.get('/kelas/:kelas_id', jadwalPelajaranController.getJadwalByKelas);

/**
 * @route   GET /api/admin/jadwal-pelajaran/guru/:guru_id
 * @desc    Get jadwal mengajar by guru (grouped by hari)
 * @access  Admin
 */
router.get('/guru/:guru_id', jadwalPelajaranController.getJadwalByGuru);

/**
 * @route   POST /api/admin/jadwal-pelajaran/bulk
 * @desc    Bulk create jadwal pelajaran
 * @access  Admin
 */
router.post('/bulk', jadwalPelajaranController.bulkCreateJadwal);

/**
 * @route   GET /api/admin/jadwal-pelajaran/:id
 * @desc    Get single jadwal pelajaran by ID
 * @access  Admin
 */
router.get('/:id', jadwalPelajaranController.getJadwalById);

/**
 * @route   POST /api/admin/jadwal-pelajaran
 * @desc    Create jadwal pelajaran baru
 * @access  Admin
 */
router.post('/', jadwalPelajaranController.createJadwalPelajaran);

/**
 * @route   PUT /api/admin/jadwal-pelajaran/:id
 * @desc    Update jadwal pelajaran
 * @access  Admin
 */
router.put('/:id', jadwalPelajaranController.updateJadwalPelajaran);

/**
 * @route   DELETE /api/admin/jadwal-pelajaran/:id
 * @desc    Delete jadwal pelajaran
 * @access  Admin
 */
router.delete('/:id', jadwalPelajaranController.deleteJadwalPelajaran);

module.exports = router;