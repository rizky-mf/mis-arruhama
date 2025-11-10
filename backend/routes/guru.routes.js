const express = require('express');
const router = express.Router();
const guruDashboardController = require('../controllers/guruDashboardController');
const { verifyToken, guruOnly } = require('../middlewares/auth');

// All routes require authentication and guru role
router.use(verifyToken);
router.use(guruOnly);

// Dashboard
router.get('/dashboard', guruDashboardController.getDashboard);

// Jadwal
router.get('/jadwal', guruDashboardController.getJadwal);

// Kelas
router.get('/kelas', guruDashboardController.getKelasDiampu);
router.get('/kelas/:kelas_id/siswa', guruDashboardController.getSiswaByKelas);

// Mata Pelajaran
router.get('/mata-pelajaran', guruDashboardController.getMataPelajaranDiampu);

// Settings/Pengaturan
router.get('/profile', guruDashboardController.getProfile);
router.put('/profile', guruDashboardController.updateProfile);
router.put('/change-password', guruDashboardController.changePassword);
router.get('/info-mengajar', guruDashboardController.getInfoMengajar);

// Informasi Kelas (untuk wali kelas)
router.get('/informasi-kelas', guruDashboardController.getInformasiKelas);
router.post('/informasi-kelas', guruDashboardController.createInformasiKelas);
router.put('/informasi-kelas/:id', guruDashboardController.updateInformasiKelas);
router.delete('/informasi-kelas/:id', guruDashboardController.deleteInformasiKelas);

module.exports = router;
