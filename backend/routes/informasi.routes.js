const express = require('express');
const router = express.Router();
const informasiController = require('../controllers/informasiController');
const { verifyToken, adminOnly } = require('../middlewares/auth');

// Apply authentication middleware
router.use(verifyToken);

// ============================================
// INFORMASI UMUM ROUTES (Admin only)
// ============================================
router.get('/umum', informasiController.getAllInformasiUmum);
router.get('/umum/:id', informasiController.getInformasiUmumById);
router.post('/umum', adminOnly, informasiController.createInformasiUmum);
router.put('/umum/:id', adminOnly, informasiController.updateInformasiUmum);
router.delete('/umum/:id', adminOnly, informasiController.deleteInformasiUmum);

// ============================================
// INFORMASI KELAS ROUTES
// ============================================
router.get('/kelas', informasiController.getAllInformasiKelas);
router.get('/kelas/:id', informasiController.getInformasiKelasById);
router.post('/kelas', informasiController.createInformasiKelas); // Guru can create
router.put('/kelas/:id', informasiController.updateInformasiKelas); // Guru can update
router.delete('/kelas/:id', adminOnly, informasiController.deleteInformasiKelas); // Only admin can delete

module.exports = router;
