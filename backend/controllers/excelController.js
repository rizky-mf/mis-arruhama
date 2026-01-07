// controllers/excelController.js
const XLSX = require('xlsx');
const db = require('../models');
const bcrypt = require('bcryptjs');

// Export Siswa to Excel
exports.exportSiswaToExcel = async (req, res) => {
  try {
    // Get all siswa with relations
    const siswaList = await db.Siswa.findAll({
      include: [
        {
          model: db.Kelas,
          as: 'kelas',
          attributes: ['id', 'nama_kelas', 'tingkat']
        },
        {
          model: db.User,
          as: 'user',
          attributes: ['username', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Prepare data for Excel
    const excelData = siswaList.map((siswa, index) => ({
      'No': index + 1,
      'NISN': siswa.nisn,
      'Nama Lengkap': siswa.nama_lengkap,
      'Jenis Kelamin': siswa.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
      'Tanggal Lahir': siswa.tanggal_lahir ? new Date(siswa.tanggal_lahir).toLocaleDateString('id-ID') : '-',
      'Tempat Lahir': siswa.tempat_lahir || '-',
      'Alamat': siswa.alamat || '-',
      'Kelas': siswa.kelas ? siswa.kelas.nama_kelas : '-',
      'Tingkat': siswa.kelas ? siswa.kelas.tingkat : '-',
      'Nama Orang Tua': siswa.nama_orang_tua || '-',
      'Telepon Orang Tua': siswa.telepon_orang_tua || '-',
      'Email': siswa.email || '-',
      'Username': siswa.user ? siswa.user.username : '-',
      'Status': siswa.status || 'aktif'
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 5 },  // No
      { wch: 15 }, // NIS
      { wch: 25 }, // Nama
      { wch: 15 }, // Jenis Kelamin
      { wch: 15 }, // Tanggal Lahir
      { wch: 15 }, // Tempat Lahir
      { wch: 30 }, // Alamat
      { wch: 15 }, // Kelas
      { wch: 10 }, // Tingkat
      { wch: 25 }, // Nama Wali
      { wch: 15 }, // No Telp
      { wch: 25 }, // Email
      { wch: 15 }, // Username
      { wch: 10 }  // Status
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Siswa');

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set response headers
    const filename = `Data_Siswa_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Send file
    res.send(excelBuffer);

  } catch (error) {
    console.error('Error exporting siswa to Excel:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal export data siswa',
      error: error.message
    });
  }
};

// Download Excel Template
exports.downloadSiswaTemplate = async (req, res) => {
  try {
    // Get all kelas for reference
    const kelasList = await db.Kelas.findAll({
      attributes: ['id', 'nama_kelas', 'tingkat'],
      order: [['tingkat', 'ASC'], ['nama_kelas', 'ASC']]
    });

    // Template data with example
    const templateData = [
      {
        'NISN': '3187133257',
        'Nama Lengkap': 'Ahmad Rizki',
        'Jenis Kelamin (L/P)': 'L',
        'Tanggal Lahir (YYYY-MM-DD)': '2010-05-15',
        'Tempat Lahir': 'Jakarta',
        'Alamat': 'Jl. Merdeka No. 123',
        'Kelas ID': '1',
        'Nama Orang Tua': 'Bapak Ahmad',
        'Telepon Orang Tua': '081234567890',
        'Email': 'ahmad@example.com',
        'Username': 'ahmad2024',
        'Password': 'password123'
      },
      {
        'NISN': '',
        'Nama Lengkap': '',
        'Jenis Kelamin (L/P)': '',
        'Tanggal Lahir (YYYY-MM-DD)': '',
        'Tempat Lahir': '',
        'Alamat': '',
        'Kelas ID': '',
        'Nama Orang Tua': '',
        'Telepon Orang Tua': '',
        'Email': '',
        'Username': '',
        'Password': ''
      }
    ];

    // Kelas reference sheet
    const kelasData = kelasList.map(kelas => ({
      'Kelas ID': kelas.id,
      'Nama Kelas': kelas.nama_kelas,
      'Tingkat': kelas.tingkat
    }));

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Add template sheet
    const templateSheet = XLSX.utils.json_to_sheet(templateData);
    templateSheet['!cols'] = [
      { wch: 12 }, // NIS
      { wch: 25 }, // Nama
      { wch: 20 }, // Jenis Kelamin
      { wch: 25 }, // Tanggal Lahir
      { wch: 15 }, // Tempat Lahir
      { wch: 30 }, // Alamat
      { wch: 12 }, // Kelas ID
      { wch: 25 }, // Nama Wali
      { wch: 15 }, // No Telp
      { wch: 25 }, // Email
      { wch: 15 }, // Username
      { wch: 15 }  // Password
    ];
    XLSX.utils.book_append_sheet(workbook, templateSheet, 'Template Siswa');

    // Add kelas reference sheet
    const kelasSheet = XLSX.utils.json_to_sheet(kelasData);
    kelasSheet['!cols'] = [
      { wch: 10 },
      { wch: 20 },
      { wch: 10 }
    ];
    XLSX.utils.book_append_sheet(workbook, kelasSheet, 'Referensi Kelas');

    // Add instructions sheet
    const instructions = [
      { 'Petunjuk Pengisian': 'Template Import Data Siswa MIS Ar-Ruhama' },
      { 'Petunjuk Pengisian': '' },
      { 'Petunjuk Pengisian': 'KOLOM WAJIB DIISI:' },
      { 'Petunjuk Pengisian': '1. NIS - Nomor Induk Siswa (unik, max 20 karakter)' },
      { 'Petunjuk Pengisian': '2. Nama Lengkap - Nama lengkap siswa' },
      { 'Petunjuk Pengisian': '3. Jenis Kelamin - L (Laki-laki) atau P (Perempuan)' },
      { 'Petunjuk Pengisian': '4. Kelas ID - Lihat sheet "Referensi Kelas"' },
      { 'Petunjuk Pengisian': '' },
      { 'Petunjuk Pengisian': 'KOLOM OPSIONAL:' },
      { 'Petunjuk Pengisian': '- Tanggal Lahir (format: YYYY-MM-DD, contoh: 2010-05-15)' },
      { 'Petunjuk Pengisian': '- Tempat Lahir' },
      { 'Petunjuk Pengisian': '- Alamat' },
      { 'Petunjuk Pengisian': '- Nama Wali' },
      { 'Petunjuk Pengisian': '- No Telp Wali' },
      { 'Petunjuk Pengisian': '- Email' },
      { 'Petunjuk Pengisian': '- Username (jika kosong, otomatis dari NIS)' },
      { 'Petunjuk Pengisian': '- Password (jika kosong, default: password123)' },
      { 'Petunjuk Pengisian': '' },
      { 'Petunjuk Pengisian': 'CATATAN PENTING:' },
      { 'Petunjuk Pengisian': '- Hapus baris contoh sebelum import' },
      { 'Petunjuk Pengisian': '- Jangan ubah nama kolom' },
      { 'Petunjuk Pengisian': '- NIS harus unik untuk setiap siswa' },
      { 'Petunjuk Pengisian': '- Username akan otomatis dibuat jika tidak diisi' },
      { 'Petunjuk Pengisian': '- Password default adalah "password123" jika tidak diisi' }
    ];
    const instructionSheet = XLSX.utils.json_to_sheet(instructions);
    instructionSheet['!cols'] = [{ wch: 80 }];
    XLSX.utils.book_append_sheet(workbook, instructionSheet, 'Petunjuk');

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set response headers
    const filename = 'Template_Import_Siswa.xlsx';
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Send file
    res.send(excelBuffer);

  } catch (error) {
    console.error('Error downloading template:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal download template',
      error: error.message
    });
  }
};

// Import Siswa from Excel
exports.importSiswaFromExcel = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File Excel tidak ditemukan'
      });
    }

    // Read Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'File Excel kosong atau format tidak sesuai'
      });
    }

    const results = {
      success: [],
      failed: [],
      total: data.length
    };

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2; // Excel row number (header is row 1)

      try {
        // Validate required fields
        const nisn = row['NISN']?.toString().trim();
        const nama_lengkap = row['Nama Lengkap']?.toString().trim();
        const jenis_kelamin = row['Jenis Kelamin (L/P)']?.toString().trim().toUpperCase();
        const kelas_id = parseInt(row['Kelas ID']);

        if (!nisn || !nama_lengkap || !jenis_kelamin || !kelas_id) {
          results.failed.push({
            row: rowNumber,
            nis: nisn || 'N/A',
            nama: nama_lengkap || 'N/A',
            error: 'Data wajib tidak lengkap (NISN, Nama, Jenis Kelamin, Kelas ID)'
          });
          continue;
        }

        // Validate jenis kelamin
        if (!['L', 'P'].includes(jenis_kelamin)) {
          results.failed.push({
            row: rowNumber,
            nis: nisn,
            nama: nama_lengkap,
            error: 'Jenis kelamin harus L atau P'
          });
          continue;
        }

        // Check if NISN already exists
        const existingSiswa = await db.Siswa.findOne({
          where: { nisn },
          transaction
        });

        if (existingSiswa) {
          results.failed.push({
            row: rowNumber,
            nis: nisn,
            nama: nama_lengkap,
            error: 'NISN sudah terdaftar'
          });
          continue;
        }

        // Check if kelas exists
        const kelas = await db.Kelas.findByPk(kelas_id, { transaction });
        if (!kelas) {
          results.failed.push({
            row: rowNumber,
            nis: nisn,
            nama: nama_lengkap,
            error: `Kelas dengan ID ${kelas_id} tidak ditemukan`
          });
          continue;
        }

        // Prepare data
        const username = row['Username']?.toString().trim() || nisn;
        const password = row['Password']?.toString().trim() || 'password123';
        const email = row['Email']?.toString().trim() || `${nisn}@student.com`;

        // Check if username already exists
        const existingUser = await db.User.findOne({
          where: { username },
          transaction
        });

        if (existingUser) {
          results.failed.push({
            row: rowNumber,
            nis: nisn,
            nama: nama_lengkap,
            error: `Username ${username} sudah terdaftar`
          });
          continue;
        }

        // Parse tanggal lahir
        let tanggal_lahir = null;
        const tglLahirStr = row['Tanggal Lahir (YYYY-MM-DD)']?.toString().trim();
        if (tglLahirStr) {
          const parsedDate = new Date(tglLahirStr);
          if (!isNaN(parsedDate.getTime())) {
            tanggal_lahir = parsedDate;
          }
        }

        // Create user account
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await db.User.create({
          username,
          password: hashedPassword,
          email,
          role: 'siswa'
        }, { transaction });

        // Create siswa profile
        await db.Siswa.create({
          user_id: newUser.id,
          nisn,
          nama_lengkap,
          jenis_kelamin,
          tanggal_lahir,
          tempat_lahir: row['Tempat Lahir']?.toString().trim() || null,
          alamat: row['Alamat']?.toString().trim() || null,
          kelas_id,
          nama_orang_tua: row['Nama Orang Tua']?.toString().trim() || null,
          telepon_orang_tua: row['Telepon Orang Tua']?.toString().trim() || null,
          email,
          status: 'aktif'
        }, { transaction });

        results.success.push({
          row: rowNumber,
          nis: nisn,
          nama: nama_lengkap,
          username
        });

      } catch (rowError) {
        results.failed.push({
          row: rowNumber,
          nis: row['NISN'] || 'N/A',
          nama: row['Nama Lengkap'] || 'N/A',
          error: rowError.message
        });
      }
    }

    // Commit transaction
    await transaction.commit();

    res.json({
      success: true,
      message: `Import selesai: ${results.success.length} berhasil, ${results.failed.length} gagal`,
      data: {
        totalRows: results.total,
        successCount: results.success.length,
        failedCount: results.failed.length,
        successDetails: results.success,
        failedDetails: results.failed
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error importing siswa:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal import data siswa',
      error: error.message
    });
  }
};
