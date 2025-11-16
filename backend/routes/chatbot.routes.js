// routes/chatbot.routes.js
const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { verifyToken, adminOnly } = require('../middlewares/auth');

router.use(verifyToken);

/**
 * @swagger
 * /api/chatbot/ask:
 *   post:
 *     tags: [Chatbot]
 *     summary: Tanya chatbot
 *     description: Mengirim pertanyaan ke chatbot dan mendapat respons otomatis
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *             properties:
 *               question:
 *                 type: string
 *                 description: Pertanyaan yang ingin ditanyakan
 *                 example: Bagaimana cara melihat nilai saya?
 *     responses:
 *       200:
 *         description: Response dari chatbot
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     answer:
 *                       type: string
 *                     intent:
 *                       type: string
 *                     confidence:
 *                       type: number
 *       401:
 *         description: Tidak terautentikasi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/ask', chatbotController.getChatbotResponse);

/**
 * @swagger
 * /api/chatbot/history:
 *   get:
 *     tags: [Chatbot]
 *     summary: Riwayat chat
 *     description: Mendapatkan riwayat percakapan dengan chatbot
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Riwayat chat berhasil didapat
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
router.get('/history', chatbotController.getChatHistory);

/**
 * @swagger
 * /api/chatbot/history:
 *   delete:
 *     tags: [Chatbot]
 *     summary: Hapus riwayat chat
 *     description: Menghapus semua riwayat percakapan dengan chatbot
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Riwayat berhasil dihapus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.delete('/history', chatbotController.clearChatHistory);

/**
 * @swagger
 * /api/chatbot/faq:
 *   get:
 *     tags: [Chatbot]
 *     summary: Daftar FAQ
 *     description: Mendapatkan daftar pertanyaan yang sering ditanyakan
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar FAQ
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
router.get('/faq', chatbotController.getFAQ);

/**
 * @swagger
 * /api/chatbot/intents:
 *   get:
 *     tags: [Chatbot - Admin]
 *     summary: Daftar semua intent (Admin only)
 *     description: Mendapatkan semua intent yang tersedia di chatbot
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar intent berhasil didapat
 *       403:
 *         description: Akses ditolak - hanya untuk admin
 */
router.get('/intents', adminOnly, chatbotController.getAllIntents);

/**
 * @swagger
 * /api/chatbot/intents:
 *   post:
 *     tags: [Chatbot - Admin]
 *     summary: Buat intent baru (Admin only)
 *     description: Membuat intent baru untuk chatbot
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - intent_name
 *               - patterns
 *             properties:
 *               intent_name:
 *                 type: string
 *               patterns:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Intent berhasil dibuat
 *       403:
 *         description: Akses ditolak - hanya untuk admin
 */
router.post('/intents', adminOnly, chatbotController.createIntent);

/**
 * @swagger
 * /api/chatbot/intents/{id}:
 *   put:
 *     tags: [Chatbot - Admin]
 *     summary: Update intent (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Intent berhasil diupdate
 */
router.put('/intents/:id', adminOnly, chatbotController.updateIntent);

/**
 * @swagger
 * /api/chatbot/intents/{id}:
 *   delete:
 *     tags: [Chatbot - Admin]
 *     summary: Hapus intent (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Intent berhasil dihapus
 */
router.delete('/intents/:id', adminOnly, chatbotController.deleteIntent);

/**
 * @swagger
 * /api/chatbot/intents/{intent_id}/responses:
 *   get:
 *     tags: [Chatbot - Admin]
 *     summary: Daftar response untuk intent (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: intent_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Daftar response
 */
router.get('/intents/:intent_id/responses', adminOnly, chatbotController.getResponsesByIntent);

/**
 * @swagger
 * /api/chatbot/intents/{intent_id}/responses:
 *   post:
 *     tags: [Chatbot - Admin]
 *     summary: Tambah response untuk intent (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: intent_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Response berhasil ditambahkan
 */
router.post('/intents/:intent_id/responses', adminOnly, chatbotController.createResponse);

/**
 * @swagger
 * /api/chatbot/responses/{id}:
 *   put:
 *     tags: [Chatbot - Admin]
 *     summary: Update response (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Response berhasil diupdate
 */
router.put('/responses/:id', adminOnly, chatbotController.updateResponse);

/**
 * @swagger
 * /api/chatbot/responses/{id}:
 *   delete:
 *     tags: [Chatbot - Admin]
 *     summary: Hapus response (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Response berhasil dihapus
 */
router.delete('/responses/:id', adminOnly, chatbotController.deleteResponse);

/**
 * @swagger
 * /api/chatbot/train:
 *   post:
 *     tags: [Chatbot - Admin]
 *     summary: Train chatbot model (Admin only)
 *     description: Melatih ulang model NLP chatbot dengan data terbaru
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Training berhasil
 *       403:
 *         description: Akses ditolak - hanya untuk admin
 */
router.post('/train', adminOnly, chatbotController.trainChatbot);

/**
 * @swagger
 * /api/chatbot/stats:
 *   get:
 *     tags: [Chatbot - Admin]
 *     summary: Statistik chatbot (Admin only)
 *     description: Mendapatkan statistik penggunaan chatbot
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistik berhasil didapat
 *       403:
 *         description: Akses ditolak - hanya untuk admin
 */
router.get('/stats', adminOnly, chatbotController.getChatbotStats);

module.exports = router;
