const express = require('express');
const router = express.Router();
const keuanganController = require('../controllers/keuanganController');
const { verifyToken, adminOnly } = require('../middlewares/auth');

// Apply authentication and admin authorization to all routes
router.use(verifyToken);
router.use(adminOnly);

// List Pembayaran (Jenis Tagihan) routes
router.get('/list-pembayaran', keuanganController.getAllListPembayaran);
router.get('/list-pembayaran/:id', keuanganController.getListPembayaranById);
router.post('/list-pembayaran', keuanganController.createListPembayaran);
router.put('/list-pembayaran/:id', keuanganController.updateListPembayaran);
router.delete('/list-pembayaran/:id', keuanganController.deleteListPembayaran);

// Pembayaran (Transaksi) routes
router.get('/pembayaran', keuanganController.getAllPembayaran);
router.post('/pembayaran/:id/approve', keuanganController.approvePembayaran);
router.delete('/pembayaran/:id', keuanganController.deletePembayaran);

module.exports = router;
