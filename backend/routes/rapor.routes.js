const express = require('express');
const router = express.Router();
const raporController = require('../controllers/raporController');
const { verifyToken, adminOnly } = require('../middlewares/auth');

// Apply authentication middleware
router.use(verifyToken);

// ============================================
// RAPOR ROUTES
// ============================================

// Get all rapor with filters
router.get('/', raporController.getAllRapor);

// Get rapor by siswa (for rapor view)
router.get('/siswa/:siswa_id', raporController.getRaporBySiswa);

// Get rapor by kelas
router.get('/kelas/:kelas_id', raporController.getRaporByKelas);

// Get ranking kelas
router.get('/ranking/kelas/:kelas_id', raporController.getRankingKelas);

// Get single rapor by ID
router.get('/:id', raporController.getRaporById);

// Create rapor
router.post('/', raporController.createRapor);

// Bulk create rapor
router.post('/bulk', raporController.bulkCreateRapor);

// Update rapor
router.put('/:id', raporController.updateRapor);

// Delete rapor (admin only)
router.delete('/:id', adminOnly, raporController.deleteRapor);

module.exports = router;
