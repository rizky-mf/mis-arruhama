// config/multer.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Buat folder uploads jika belum ada
const createUploadFolders = () => {
  const folders = [
    './uploads',
    './uploads/excel',
    './uploads/foto',
    './uploads/bukti_bayar'
  ];
  
  folders.forEach(folder => {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  });
};

createUploadFolders();

// Storage untuk Excel files
const excelStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/excel');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'import-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Storage untuk foto (siswa, guru)
const fotoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/foto');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'foto-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Storage untuk bukti bayar
const buktiBayarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/bukti_bayar');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'bukti-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter untuk Excel
const excelFileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.oasis.opendocument.spreadsheet'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only Excel files (.xls, .xlsx) are allowed!'), false);
  }
};

// File filter untuk foto
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (.jpg, .jpeg, .png) are allowed!'), false);
  }
};

// Upload middleware
const uploadExcel = multer({
  storage: excelStorage,
  fileFilter: excelFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

const uploadFoto = multer({
  storage: fotoStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  }
});

const uploadBuktiBayar = multer({
  storage: buktiBayarStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  }
});

module.exports = {
  uploadExcel,
  uploadFoto,
  uploadBuktiBayar
};