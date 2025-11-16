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

/**
 * @swagger
 * /api/siswa/dashboard:
 *   get:
 *     tags: [Siswa]
 *     summary: Dashboard siswa
 *     description: Mendapatkan ringkasan data siswa untuk dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data dashboard berhasil didapat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     siswa:
 *                       $ref: '#/components/schemas/Siswa'
 *                     statistik:
 *                       type: object
 *                     jadwal_hari_ini:
 *                       type: array
 *                     informasi_terbaru:
 *                       type: array
 *       403:
 *         description: Akses ditolak - hanya untuk siswa
 */
router.get('/dashboard', siswaDashboardController.getDashboard);

/**
 * @swagger
 * /api/siswa/jadwal:
 *   get:
 *     tags: [Siswa]
 *     summary: Jadwal pelajaran siswa
 *     description: Mendapatkan jadwal pelajaran untuk siswa
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Jadwal berhasil didapat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/jadwal', siswaDashboardController.getJadwalPelajaran);

/**
 * @swagger
 * /api/siswa/nilai:
 *   get:
 *     tags: [Siswa]
 *     summary: Nilai dan rapor siswa
 *     description: Mendapatkan nilai dan rapor siswa
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nilai berhasil didapat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     siswa:
 *                       $ref: '#/components/schemas/Siswa'
 *                     periode:
 *                       type: object
 *                     nilai:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Rapor'
 */
router.get('/nilai', siswaDashboardController.getNilaiRapor);

/**
 * @swagger
 * /api/siswa/presensi:
 *   get:
 *     tags: [Siswa]
 *     summary: Data presensi siswa
 *     description: Mendapatkan data presensi/kehadiran siswa
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data presensi berhasil didapat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 */
router.get('/presensi', siswaDashboardController.getPresensi);

/**
 * @swagger
 * /api/siswa/informasi:
 *   get:
 *     tags: [Siswa]
 *     summary: Informasi kelas
 *     description: Mendapatkan informasi dan pengumuman kelas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informasi berhasil didapat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 */
router.get('/informasi', siswaDashboardController.getInformasi);

/**
 * @swagger
 * /api/siswa/profile:
 *   get:
 *     tags: [Siswa]
 *     summary: Profil siswa
 *     description: Mendapatkan profil lengkap siswa
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil berhasil didapat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Siswa'
 */
router.get('/profile', siswaDashboardController.getProfile);

/**
 * @swagger
 * /api/siswa/profile:
 *   put:
 *     tags: [Siswa]
 *     summary: Update profil siswa
 *     description: Mengupdate informasi profil siswa (field yang dapat diedit terbatas)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               telepon:
 *                 type: string
 *               email:
 *                 type: string
 *               alamat:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profil berhasil diupdate
 *       400:
 *         description: Data tidak valid
 */
router.put('/profile', siswaDashboardController.updateProfile);

/**
 * @swagger
 * /api/siswa/change-password:
 *   put:
 *     tags: [Siswa]
 *     summary: Ubah password siswa
 *     description: Mengubah password siswa
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password_lama
 *               - password_baru
 *             properties:
 *               password_lama:
 *                 type: string
 *                 format: password
 *               password_baru:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password berhasil diubah
 *       400:
 *         description: Password lama salah
 */
router.put('/change-password', siswaDashboardController.changePassword);

/**
 * @swagger
 * /api/siswa/pembayaran:
 *   get:
 *     tags: [Siswa]
 *     summary: Riwayat pembayaran siswa
 *     description: Mendapatkan riwayat pembayaran SPP dan biaya lainnya
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data pembayaran berhasil didapat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 */
router.get('/pembayaran', siswaDashboardController.getPembayaran);

/**
 * @swagger
 * /api/siswa/pembayaran:
 *   post:
 *     tags: [Siswa]
 *     summary: Submit bukti pembayaran
 *     description: Mengirimkan bukti pembayaran untuk verifikasi
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - jenis_pembayaran
 *               - nominal
 *               - bukti_transfer
 *             properties:
 *               jenis_pembayaran:
 *                 type: string
 *               nominal:
 *                 type: number
 *               bukti_transfer:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Bukti pembayaran berhasil disubmit
 *       400:
 *         description: Data tidak lengkap
 */
router.post('/pembayaran', siswaDashboardController.submitPembayaran);

module.exports = router;
