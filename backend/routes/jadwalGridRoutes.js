// routes/jadwalGridRoutes.js
const express = require('express');
const router = express.Router();
const jadwalGridController = require('../controllers/jadwalGridController');
const { verifyToken, adminOnly, guruOnly, checkRole } = require('../middlewares/auth');

// Get jadwal grid (all roles can view)
router.get(
  '/grid',
  verifyToken,
  jadwalGridController.getJadwalGrid
);

// Add jadwal to slot (Admin & Guru only)
router.post(
  '/slot',
  verifyToken,
  checkRole(['admin', 'guru']),
  jadwalGridController.addJadwalToSlot
);

// Update jadwal in slot (Admin & Guru only)
router.put(
  '/slot/:id',
  verifyToken,
  checkRole(['admin', 'guru']),
  jadwalGridController.updateJadwalSlot
);

// Delete jadwal from slot (Admin & Guru only)
router.delete(
  '/slot/:id',
  verifyToken,
  checkRole(['admin', 'guru']),
  jadwalGridController.deleteJadwalSlot
);

module.exports = router;
