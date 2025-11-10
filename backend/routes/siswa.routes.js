const express = require('express');
const router = express.Router();
const siswaDashboardController = require('../controllers/siswaDashboardController');
const { verifyToken } = require('../middlewares/auth');

// All routes require authentication
router.use(verifyToken);

// Middleware to check if user is siswa
const siswaOnly = (req, res, next) => {
  if (req.user.role !== 'siswa') {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Hanya untuk siswa.'
    });
  }
  next();
};

router.use(siswaOnly);

// Dashboard
router.get('/dashboard', siswaDashboardController.getDashboard);

// Jadwal Pelajaran
router.get('/jadwal', siswaDashboardController.getJadwalPelajaran);

// Nilai & Rapor
router.get('/nilai', siswaDashboardController.getNilaiRapor);

// Presensi
router.get('/presensi', siswaDashboardController.getPresensi);

// Informasi Kelas
router.get('/informasi', siswaDashboardController.getInformasi);

// Settings/Pengaturan
router.get('/profile', siswaDashboardController.getProfile);
router.put('/profile', siswaDashboardController.updateProfile);
router.put('/change-password', siswaDashboardController.changePassword);

// Pembayaran
router.get('/pembayaran', siswaDashboardController.getPembayaran);
router.post('/pembayaran', siswaDashboardController.submitPembayaran);

module.exports = router;
