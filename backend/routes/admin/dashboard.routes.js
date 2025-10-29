// routes/admin/dashboard.routes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/dashboardController');
const { verifyToken, adminOnly } = require('../../middlewares/auth');

// Semua route dilindungi dengan verifyToken dan adminOnly
router.use(verifyToken, adminOnly);

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get dashboard statistics lengkap
 * @access  Admin
 */
router.get('/', dashboardController.getDashboardStats);

/**
 * @route   GET /api/admin/dashboard/chart
 * @desc    Get chart data untuk grafik
 * @query   type: siswa_per_kelas | siswa_per_tingkat | gender
 * @access  Admin
 */
router.get('/chart', dashboardController.getChartData);

/**
 * @route   GET /api/admin/dashboard/quick-stats
 * @desc    Get quick stats (siswa, guru, kelas count)
 * @access  Admin
 */
router.get('/quick-stats', dashboardController.getQuickStats);

module.exports = router;