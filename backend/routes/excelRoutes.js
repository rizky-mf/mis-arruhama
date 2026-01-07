// routes/excelRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const excelController = require('../controllers/excelController');
const { verifyToken, adminOnly } = require('../middlewares/auth');

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel' // .xls
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format file harus Excel (.xlsx atau .xls)'));
    }
  }
});

// Excel routes (Admin only)
router.get(
  '/siswa/export',
  verifyToken,
  adminOnly,
  excelController.exportSiswaToExcel
);

router.get(
  '/siswa/template',
  verifyToken,
  adminOnly,
  excelController.downloadSiswaTemplate
);

router.post(
  '/siswa/import',
  verifyToken,
  adminOnly,
  upload.single('file'),
  excelController.importSiswaFromExcel
);

module.exports = router;
