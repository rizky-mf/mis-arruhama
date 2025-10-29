// routes/admin/kelas.routes.js
const express = require('express');
const router = express.Router();
const kelasController = require('../../controllers/kelasController');
const { verifyToken, adminOnly } = require('../../middlewares/auth');

// Semua route dilindungi dengan verifyToken dan adminOnly
router.use(verifyToken, adminOnly);

/**
 * @route   GET /api/admin/kelas
 * @desc    Get all kelas (dengan pagination, search, filter)
 * @access  Admin
 */
router.get('/', kelasController.getAllKelas);

/**
 * @route   GET /api/admin/kelas/:id
 * @desc    Get single kelas by ID
 * @access  Admin
 */
router.get('/:id', kelasController.getKelasById);

/**
 * @route   POST /api/admin/kelas
 * @desc    Create kelas baru
 * @access  Admin
 */
router.post('/', kelasController.createKelas);

/**
 * @route   PUT /api/admin/kelas/:id
 * @desc    Update data kelas
 * @access  Admin
 */
router.put('/:id', kelasController.updateKelas);

/**
 * @route   DELETE /api/admin/kelas/:id
 * @desc    Delete kelas
 * @access  Admin
 */
router.delete('/:id', kelasController.deleteKelas);

/**
 * @route   GET /api/admin/kelas/:id/siswa
 * @desc    Get siswa by kelas
 * @access  Admin
 */
router.get('/:id/siswa', kelasController.getSiswaByKelas);

/**
 * @route   POST /api/admin/kelas/:id/siswa
 * @desc    Assign siswa ke kelas (bulk)
 * @access  Admin
 */
router.post('/:id/siswa', kelasController.assignSiswaToKelas);

/**
 * @route   DELETE /api/admin/kelas/:id/siswa/:siswa_id
 * @desc    Remove siswa dari kelas
 * @access  Admin
 */
router.delete('/:id/siswa/:siswa_id', kelasController.removeSiswaFromKelas);

module.exports = router;