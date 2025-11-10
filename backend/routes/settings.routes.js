const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { verifyToken, adminOnly } = require('../middlewares/auth');

// All routes require authentication
router.use(verifyToken);

// Public settings route (accessible by all authenticated users)
router.get('/akademik-aktif', settingsController.getAkademikAktif);

// Settings routes (admin only)
router.get('/', adminOnly, settingsController.getAllSettings);
router.put('/', adminOnly, settingsController.updateSettings);

// Profil madrasah routes (admin only)
router.put('/profil-madrasah', adminOnly, settingsController.updateProfilMadrasah);

// Profile routes
router.get('/profile', settingsController.getProfile);
router.put('/profile', settingsController.updateProfile);

// Password routes
router.post('/change-password', settingsController.changePassword);

// Activity logs routes (admin only)
router.get('/logs', adminOnly, settingsController.getActivityLogs);

module.exports = router;
