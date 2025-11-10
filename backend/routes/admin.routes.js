const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, adminOnly } = require('../middlewares/auth');

// Apply authentication and admin authorization to all routes
router.use(verifyToken);
router.use(adminOnly);

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Kelas routes
router.get('/kelas', adminController.getAllKelas);
router.get('/kelas/:id', adminController.getKelasById);
router.post('/kelas', adminController.createKelas);
router.put('/kelas/:id', adminController.updateKelas);
router.delete('/kelas/:id', adminController.deleteKelas);

// Guru routes
router.get('/guru', adminController.getAllGuru);
router.get('/guru/:id', adminController.getGuruById);
router.post('/guru', adminController.createGuru);
router.put('/guru/:id', adminController.updateGuru);
router.delete('/guru/:id', adminController.deleteGuru);

// Siswa routes
router.get('/siswa', adminController.getAllSiswa);
router.get('/siswa/:id', adminController.getSiswaById);
router.post('/siswa', adminController.createSiswa);
router.put('/siswa/:id', adminController.updateSiswa);
router.delete('/siswa/:id', adminController.deleteSiswa);

// Reset password
router.post('/reset-password', adminController.resetPassword);

// Mata Pelajaran routes
router.get('/mata-pelajaran', adminController.getAllMataPelajaran);
router.get('/mata-pelajaran/:id', adminController.getMataPelajaranById);
router.post('/mata-pelajaran', adminController.createMataPelajaran);
router.put('/mata-pelajaran/:id', adminController.updateMataPelajaran);
router.delete('/mata-pelajaran/:id', adminController.deleteMataPelajaran);

// Jadwal Pelajaran routes
router.get('/jadwal-pelajaran', adminController.getAllJadwalPelajaran);
router.get('/jadwal-pelajaran/:id', adminController.getJadwalPelajaranById);
router.post('/jadwal-pelajaran', adminController.createJadwalPelajaran);
router.put('/jadwal-pelajaran/:id', adminController.updateJadwalPelajaran);
router.delete('/jadwal-pelajaran/:id', adminController.deleteJadwalPelajaran);

module.exports = router;
