const express = require('express');
const router = express.Router();
const presensiController = require('../controllers/presensiController');
const { verifyToken, adminOnly } = require('../middlewares/auth');

// Apply authentication middleware
router.use(verifyToken);

// ============================================
// PRESENSI ROUTES (Admin only for now)
// ============================================

// Get all presensi with filters
router.get('/', presensiController.getAllPresensi);

// Get presensi by kelas and tanggal (untuk input absen sekelas)
router.get('/kelas/:kelas_id/tanggal/:tanggal', presensiController.getPresensiByKelasAndTanggal);

// Get presensi by siswa (history)
router.get('/siswa/:siswa_id', presensiController.getPresensiBySiswa);

// Get rekap presensi kelas (statistik bulanan)
router.get('/rekap/kelas/:kelas_id', presensiController.getRekapPresensiKelas);

// Get single presensi by ID
router.get('/:id', presensiController.getPresensiById);

// Create/Update single presensi
router.post('/', presensiController.createOrUpdatePresensi);

// Bulk create/update presensi (absen sekelas sekaligus)
router.post('/bulk', presensiController.bulkCreateOrUpdatePresensi);

// Update presensi
router.put('/:id', presensiController.updatePresensi);

// Delete presensi (admin only)
router.delete('/:id', adminOnly, presensiController.deletePresensi);

module.exports = router;
