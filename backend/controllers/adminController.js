const db = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

// ============================================
// DASHBOARD
// ============================================
exports.getDashboard = async (req, res) => {
  try {
    const [totalSiswa, totalGuru, totalKelas] = await Promise.all([
      db.Siswa.count({ where: { status: 'aktif' } }),
      db.Guru.count(),
      db.Kelas.count()
    ]);

    // Calculate today's attendance percentage
    const today = new Date().toISOString().split('T')[0];
    const [totalPresensi, hadirCount] = await Promise.all([
      db.Presensi.count({ where: { tanggal: today } }),
      db.Presensi.count({ where: { tanggal: today, status: 'hadir' } })
    ]);

    const kehadiranHariIni = totalPresensi > 0
      ? Math.round((hadirCount / totalPresensi) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        total_siswa: totalSiswa,
        total_guru: totalGuru,
        total_kelas: totalKelas,
        kehadiran_hari_ini: kehadiranHariIni
      }
    });
  } catch (error) {
    console.error('Error getting dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memuat dashboard',
      error: error.message
    });
  }
};

// ============================================
// KELAS MANAGEMENT
// ============================================
exports.getAllKelas = async (req, res) => {
  try {
    const { sort = 'nama_kelas', order = 'ASC', tingkat } = req.query;

    const where = {};
    if (tingkat) {
      where.tingkat = tingkat;
    }

    const kelas = await db.Kelas.findAll({
      where,
      include: [
        {
          model: db.Guru,
          as: 'wali_kelas',
          attributes: ['id', 'nama_lengkap', 'nip'],
          required: false
        }
      ],
      order: [[sort, order.toUpperCase()]],
      attributes: ['id', 'nama_kelas', 'tingkat', 'tahun_ajaran', 'guru_id', 'created_at', 'updated_at']
    });

    // Count students in each class
    const kelasWithCount = await Promise.all(
      kelas.map(async (k) => {
        const jumlahSiswa = await db.Siswa.count({
          where: { kelas_id: k.id, status: 'aktif' }
        });
        return {
          ...k.toJSON(),
          jumlah_siswa: jumlahSiswa
        };
      })
    );

    res.json({
      success: true,
      data: kelasWithCount
    });
  } catch (error) {
    console.error('Error getting kelas:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memuat data kelas',
      error: error.message
    });
  }
};

exports.getKelasById = async (req, res) => {
  try {
    const { id } = req.params;

    const kelas = await db.Kelas.findByPk(id, {
      include: [
        {
          model: db.Guru,
          as: 'wali_kelas',
          attributes: ['id', 'nama_lengkap', 'nip']
        }
      ]
    });

    if (!kelas) {
      return res.status(404).json({
        success: false,
        message: 'Kelas tidak ditemukan'
      });
    }

    const jumlahSiswa = await db.Siswa.count({
      where: { kelas_id: id, status: 'aktif' }
    });

    res.json({
      success: true,
      data: {
        ...kelas.toJSON(),
        jumlah_siswa: jumlahSiswa
      }
    });
  } catch (error) {
    console.error('Error getting kelas:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memuat data kelas',
      error: error.message
    });
  }
};

exports.createKelas = async (req, res) => {
  try {
    const { nama_kelas, tingkat, tahun_ajaran, guru_id } = req.body;

    // Validation
    if (!nama_kelas || !tingkat || !tahun_ajaran) {
      return res.status(400).json({
        success: false,
        message: 'Nama kelas, tingkat, dan tahun ajaran wajib diisi'
      });
    }

    // Check if class name already exists
    const existingKelas = await db.Kelas.findOne({ where: { nama_kelas } });
    if (existingKelas) {
      return res.status(400).json({
        success: false,
        message: 'Nama kelas sudah digunakan'
      });
    }

    // If guru_id provided, check if guru exists
    if (guru_id) {
      const guru = await db.Guru.findByPk(guru_id);
      if (!guru) {
        return res.status(404).json({
          success: false,
          message: 'Guru tidak ditemukan'
        });
      }
    }

    const kelas = await db.Kelas.create({
      nama_kelas,
      tingkat,
      tahun_ajaran,
      guru_id: guru_id || null
    });

    res.status(201).json({
      success: true,
      message: 'Kelas berhasil ditambahkan',
      data: kelas
    });
  } catch (error) {
    console.error('Error creating kelas:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan kelas',
      error: error.message
    });
  }
};

exports.updateKelas = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_kelas, tingkat, tahun_ajaran, guru_id } = req.body;

    const kelas = await db.Kelas.findByPk(id);
    if (!kelas) {
      return res.status(404).json({
        success: false,
        message: 'Kelas tidak ditemukan'
      });
    }

    // Check if new class name conflicts with existing
    if (nama_kelas && nama_kelas !== kelas.nama_kelas) {
      const existingKelas = await db.Kelas.findOne({ where: { nama_kelas } });
      if (existingKelas) {
        return res.status(400).json({
          success: false,
          message: 'Nama kelas sudah digunakan'
        });
      }
    }

    // If guru_id provided, check if guru exists
    if (guru_id) {
      const guru = await db.Guru.findByPk(guru_id);
      if (!guru) {
        return res.status(404).json({
          success: false,
          message: 'Guru tidak ditemukan'
        });
      }
    }

    await kelas.update({
      nama_kelas: nama_kelas || kelas.nama_kelas,
      tingkat: tingkat || kelas.tingkat,
      tahun_ajaran: tahun_ajaran || kelas.tahun_ajaran,
      guru_id: guru_id !== undefined ? guru_id : kelas.guru_id
    });

    res.json({
      success: true,
      message: 'Kelas berhasil diperbarui',
      data: kelas
    });
  } catch (error) {
    console.error('Error updating kelas:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui kelas',
      error: error.message
    });
  }
};

exports.deleteKelas = async (req, res) => {
  try {
    const { id } = req.params;

    const kelas = await db.Kelas.findByPk(id);
    if (!kelas) {
      return res.status(404).json({
        success: false,
        message: 'Kelas tidak ditemukan'
      });
    }

    // Check if there are students in this class
    const studentCount = await db.Siswa.count({
      where: { kelas_id: id, status: 'aktif' }
    });

    if (studentCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Tidak dapat menghapus kelas yang masih memiliki ${studentCount} siswa aktif`
      });
    }

    await kelas.destroy();

    res.json({
      success: true,
      message: 'Kelas berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting kelas:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus kelas',
      error: error.message
    });
  }
};

// ============================================
// GURU MANAGEMENT
// ============================================
exports.getAllGuru = async (req, res) => {
  try {
    const { sort = 'nama_lengkap', order = 'ASC', search } = req.query;

    const where = {};
    if (search) {
      where[Op.or] = [
        { nama_lengkap: { [Op.like]: `%${search}%` } },
        { nip: { [Op.like]: `%${search}%` } }
      ];
    }

    const guru = await db.Guru.findAll({
      where,
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'username', 'role']
        },
        {
          model: db.Kelas,
          as: 'kelas_diampu',
          attributes: ['id', 'nama_kelas'],
          required: false
        }
      ],
      order: [[sort, order.toUpperCase()]]
    });

    res.json({
      success: true,
      data: guru
    });
  } catch (error) {
    console.error('Error getting guru:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memuat data guru',
      error: error.message
    });
  }
};

exports.getGuruById = async (req, res) => {
  try {
    const { id } = req.params;

    const guru = await db.Guru.findByPk(id, {
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'username', 'role']
        },
        {
          model: db.Kelas,
          as: 'kelas_diampu',
          attributes: ['id', 'nama_kelas']
        }
      ]
    });

    if (!guru) {
      return res.status(404).json({
        success: false,
        message: 'Guru tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: guru
    });
  } catch (error) {
    console.error('Error getting guru:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memuat data guru',
      error: error.message
    });
  }
};

exports.createGuru = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const {
      nip,
      nama_lengkap,
      jenis_kelamin,
      tanggal_lahir,
      alamat,
      telepon,
      email,
      username,
      password
    } = req.body;

    // Validation
    if (!nip || !nama_lengkap || !jenis_kelamin || !email || !username || !password) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'NIP, nama lengkap, jenis kelamin, email, username, dan password wajib diisi'
      });
    }

    // Check if NIP already exists
    const existingGuru = await db.Guru.findOne({ where: { nip } });
    if (existingGuru) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'NIP sudah digunakan'
      });
    }

    // Check if username already exists
    const existingUser = await db.User.findOne({ where: { username } });
    if (existingUser) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Username sudah digunakan'
      });
    }

    // Create user account
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.User.create({
      username,
      password: hashedPassword,
      role: 'guru'
    }, { transaction });

    // Create guru profile
    const guru = await db.Guru.create({
      user_id: user.id,
      nip,
      nama_lengkap,
      jenis_kelamin,
      tanggal_lahir: tanggal_lahir || null,
      alamat: alamat || null,
      telepon: telepon || null,
      email: email || null
    }, { transaction });

    await transaction.commit();

    // Fetch the created guru with user data
    const createdGuru = await db.Guru.findByPk(guru.id, {
      include: [{
        model: db.User,
        as: 'user',
        attributes: ['id', 'username', 'role']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Data guru berhasil ditambahkan',
      data: {
        ...createdGuru.toJSON(),
        plain_password: password // Return for display purposes
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating guru:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan data guru',
      error: error.message
    });
  }
};

exports.updateGuru = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const { id } = req.params;
    const {
      nip,
      nama_lengkap,
      jenis_kelamin,
      tanggal_lahir,
      alamat,
      telepon,
      email,
      kelas_id // Add kelas_id to assign as wali kelas
    } = req.body;

    const guru = await db.Guru.findByPk(id);
    if (!guru) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Guru tidak ditemukan'
      });
    }

    // Check if new NIP conflicts with existing
    if (nip && nip !== guru.nip) {
      const existingGuru = await db.Guru.findOne({ where: { nip } });
      if (existingGuru) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'NIP sudah digunakan'
        });
      }
    }

    // Update guru data
    await guru.update({
      nip: nip || guru.nip,
      nama_lengkap: nama_lengkap || guru.nama_lengkap,
      jenis_kelamin: jenis_kelamin || guru.jenis_kelamin,
      tanggal_lahir: tanggal_lahir !== undefined ? tanggal_lahir : guru.tanggal_lahir,
      alamat: alamat !== undefined ? alamat : guru.alamat,
      telepon: telepon !== undefined ? telepon : guru.telepon,
      email: email !== undefined ? email : guru.email
    }, { transaction });

    // Handle wali kelas assignment
    if (kelas_id !== undefined) {
      if (kelas_id === null || kelas_id === '') {
        // Remove guru from all wali kelas positions
        await db.Kelas.update(
          { guru_id: null },
          { where: { guru_id: id }, transaction }
        );
      } else {
        // First, remove this guru from any other wali kelas position
        await db.Kelas.update(
          { guru_id: null },
          { where: { guru_id: id }, transaction }
        );

        // Check if kelas exists
        const kelas = await db.Kelas.findByPk(kelas_id);
        if (!kelas) {
          await transaction.rollback();
          return res.status(404).json({
            success: false,
            message: 'Kelas tidak ditemukan'
          });
        }

        // Check if kelas already has a wali kelas
        if (kelas.guru_id && kelas.guru_id !== parseInt(id)) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: 'Kelas sudah memiliki wali kelas. Hapus wali kelas lama terlebih dahulu.'
          });
        }

        // Assign guru as wali kelas
        await db.Kelas.update(
          { guru_id: id },
          { where: { id: kelas_id }, transaction }
        );
      }
    }

    await transaction.commit();

    // Fetch updated guru with relations
    const updatedGuru = await db.Guru.findByPk(id, {
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'username', 'role']
        },
        {
          model: db.Kelas,
          as: 'kelas_diampu',
          attributes: ['id', 'nama_kelas']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Data guru berhasil diperbarui',
      data: updatedGuru
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating guru:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui data guru',
      error: error.message
    });
  }
};

exports.deleteGuru = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const { id } = req.params;

    const guru = await db.Guru.findByPk(id);
    if (!guru) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Guru tidak ditemukan'
      });
    }

    // Check if guru is assigned as wali kelas
    const kelasCount = await db.Kelas.count({ where: { guru_id: id } });
    if (kelasCount > 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Tidak dapat menghapus guru yang masih menjadi wali kelas di ${kelasCount} kelas`
      });
    }

    // Delete user account (will cascade to guru due to foreign key)
    await db.User.destroy({ where: { id: guru.user_id }, transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Data guru berhasil dihapus'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting guru:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus data guru',
      error: error.message
    });
  }
};

// ============================================
// SISWA MANAGEMENT
// ============================================
// Generate random password (8 characters: letters + numbers)
const generatePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

exports.getAllSiswa = async (req, res) => {
  try {
    const { sort = 'nama_lengkap', order = 'ASC', search, kelas_id, status = 'aktif' } = req.query;

    const where = { status };
    if (search) {
      where[Op.or] = [
        { nama_lengkap: { [Op.like]: `%${search}%` } },
        { nisn: { [Op.like]: `%${search}%` } }
      ];
    }
    if (kelas_id) {
      where.kelas_id = kelas_id;
    }

    const siswa = await db.Siswa.findAll({
      where,
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'username', 'role']
        },
        {
          model: db.Kelas,
          as: 'kelas',
          attributes: ['id', 'nama_kelas', 'tingkat'],
          required: false
        }
      ],
      order: [[sort, order.toUpperCase()]]
    });

    res.json({
      success: true,
      data: siswa
    });
  } catch (error) {
    console.error('Error getting siswa:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memuat data siswa',
      error: error.message
    });
  }
};

exports.getSiswaById = async (req, res) => {
  try {
    const { id } = req.params;

    const siswa = await db.Siswa.findByPk(id, {
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'username', 'role']
        },
        {
          model: db.Kelas,
          as: 'kelas',
          attributes: ['id', 'nama_kelas', 'tingkat']
        }
      ]
    });

    if (!siswa) {
      return res.status(404).json({
        success: false,
        message: 'Siswa tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: siswa
    });
  } catch (error) {
    console.error('Error getting siswa:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memuat data siswa',
      error: error.message
    });
  }
};

exports.createSiswa = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const {
      nisn,
      nama_lengkap,
      jenis_kelamin,
      tanggal_lahir,
      alamat,
      nama_orang_tua,
      telepon_orang_tua,
      kelas_id
    } = req.body;

    // Validation
    if (!nisn || !nama_lengkap || !jenis_kelamin) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'NISN, nama lengkap, dan jenis kelamin wajib diisi'
      });
    }

    // Check if NISN already exists
    const existingSiswa = await db.Siswa.findOne({ where: { nisn } });
    if (existingSiswa) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'NISN sudah digunakan'
      });
    }

    // Username = NISN, auto-generate password
    const username = nisn;
    const plainPassword = generatePassword();

    // Check if username already exists (shouldn't happen if NISN is unique)
    const existingUser = await db.User.findOne({ where: { username } });
    if (existingUser) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Username sudah digunakan'
      });
    }

    // If kelas_id provided, check if kelas exists
    if (kelas_id) {
      const kelas = await db.Kelas.findByPk(kelas_id);
      if (!kelas) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Kelas tidak ditemukan'
        });
      }
    }

    // Create user account
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const user = await db.User.create({
      username,
      password: hashedPassword,
      role: 'siswa'
    }, { transaction });

    // Create siswa profile
    const siswa = await db.Siswa.create({
      user_id: user.id,
      nisn,
      nama_lengkap,
      jenis_kelamin,
      tanggal_lahir: tanggal_lahir || null,
      alamat: alamat || null,
      nama_orang_tua: nama_orang_tua || null,
      telepon_orang_tua: telepon_orang_tua || null,
      kelas_id: kelas_id || null,
      status: 'aktif'
    }, { transaction });

    await transaction.commit();

    // Fetch the created siswa with relations
    const createdSiswa = await db.Siswa.findByPk(siswa.id, {
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'username', 'role']
        },
        {
          model: db.Kelas,
          as: 'kelas',
          attributes: ['id', 'nama_kelas', 'tingkat']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Data siswa berhasil ditambahkan',
      data: {
        ...createdSiswa.toJSON(),
        plain_password: plainPassword // Return for display purposes
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating siswa:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan data siswa',
      error: error.message
    });
  }
};

exports.updateSiswa = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nisn,
      nama_lengkap,
      jenis_kelamin,
      tanggal_lahir,
      alamat,
      nama_orang_tua,
      telepon_orang_tua,
      kelas_id,
      status
    } = req.body;

    const siswa = await db.Siswa.findByPk(id);
    if (!siswa) {
      return res.status(404).json({
        success: false,
        message: 'Siswa tidak ditemukan'
      });
    }

    // Check if new NISN conflicts with existing
    if (nisn && nisn !== siswa.nisn) {
      const existingSiswa = await db.Siswa.findOne({ where: { nisn } });
      if (existingSiswa) {
        return res.status(400).json({
          success: false,
          message: 'NISN sudah digunakan'
        });
      }

      // Also update username if NISN changes
      await db.User.update(
        { username: nisn },
        { where: { id: siswa.user_id } }
      );
    }

    // If kelas_id provided, check if kelas exists
    if (kelas_id) {
      const kelas = await db.Kelas.findByPk(kelas_id);
      if (!kelas) {
        return res.status(404).json({
          success: false,
          message: 'Kelas tidak ditemukan'
        });
      }
    }

    await siswa.update({
      nisn: nisn || siswa.nisn,
      nama_lengkap: nama_lengkap || siswa.nama_lengkap,
      jenis_kelamin: jenis_kelamin || siswa.jenis_kelamin,
      tanggal_lahir: tanggal_lahir !== undefined ? tanggal_lahir : siswa.tanggal_lahir,
      alamat: alamat !== undefined ? alamat : siswa.alamat,
      nama_orang_tua: nama_orang_tua !== undefined ? nama_orang_tua : siswa.nama_orang_tua,
      telepon_orang_tua: telepon_orang_tua !== undefined ? telepon_orang_tua : siswa.telepon_orang_tua,
      kelas_id: kelas_id !== undefined ? kelas_id : siswa.kelas_id,
      status: status || siswa.status
    });

    const updatedSiswa = await db.Siswa.findByPk(id, {
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'username', 'role']
        },
        {
          model: db.Kelas,
          as: 'kelas',
          attributes: ['id', 'nama_kelas', 'tingkat']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Data siswa berhasil diperbarui',
      data: updatedSiswa
    });
  } catch (error) {
    console.error('Error updating siswa:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui data siswa',
      error: error.message
    });
  }
};

exports.deleteSiswa = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const { id } = req.params;

    const siswa = await db.Siswa.findByPk(id);
    if (!siswa) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Siswa tidak ditemukan'
      });
    }

    // Delete user account (will cascade to siswa due to foreign key)
    await db.User.destroy({ where: { id: siswa.user_id }, transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Data siswa berhasil dihapus'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting siswa:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus data siswa',
      error: error.message
    });
  }
};

// ============================================
// RESET PASSWORD
// ============================================
exports.resetPassword = async (req, res) => {
  try {
    const { user_id, new_password } = req.body;

    if (!user_id || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'User ID dan password baru wajib diisi'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password minimal 6 karakter'
      });
    }

    const user = await db.User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    // Don't allow resetting admin password
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Tidak dapat mereset password admin'
      });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await user.update({ password: hashedPassword });

    res.json({
      success: true,
      message: 'Password berhasil direset'
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mereset password',
      error: error.message
    });
  }
};

// ============================================
// MATA PELAJARAN MANAGEMENT
// ============================================
exports.getAllMataPelajaran = async (req, res) => {
  try {
    const { sort = 'nama_mapel', order = 'ASC', tingkat } = req.query;

    const where = {};
    if (tingkat) {
      where.tingkat = tingkat;
    }

    const mataPelajaran = await db.MataPelajaran.findAll({
      where,
      order: [[sort, order.toUpperCase()]],
      attributes: ['id', 'kode_mapel', 'nama_mapel', 'tingkat', 'deskripsi', 'created_at', 'updated_at']
    });

    res.json({
      success: true,
      data: mataPelajaran
    });
  } catch (error) {
    console.error('Error getting mata pelajaran:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memuat data mata pelajaran',
      error: error.message
    });
  }
};

exports.getMataPelajaranById = async (req, res) => {
  try {
    const { id } = req.params;

    const mataPelajaran = await db.MataPelajaran.findByPk(id);

    if (!mataPelajaran) {
      return res.status(404).json({
        success: false,
        message: 'Mata pelajaran tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: mataPelajaran
    });
  } catch (error) {
    console.error('Error getting mata pelajaran:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memuat data mata pelajaran',
      error: error.message
    });
  }
};

exports.createMataPelajaran = async (req, res) => {
  try {
    const { kode_mapel, nama_mapel, tingkat, deskripsi } = req.body;

    // Validation
    if (!kode_mapel || !nama_mapel) {
      return res.status(400).json({
        success: false,
        message: 'Kode mata pelajaran dan nama mata pelajaran wajib diisi'
      });
    }

    // Check if kode_mapel already exists
    const existingMapel = await db.MataPelajaran.findOne({ where: { kode_mapel } });
    if (existingMapel) {
      return res.status(400).json({
        success: false,
        message: 'Kode mata pelajaran sudah digunakan'
      });
    }

    const mataPelajaran = await db.MataPelajaran.create({
      kode_mapel,
      nama_mapel,
      tingkat: tingkat || 0,
      deskripsi: deskripsi || null
    });

    res.status(201).json({
      success: true,
      message: 'Mata pelajaran berhasil ditambahkan',
      data: mataPelajaran
    });
  } catch (error) {
    console.error('Error creating mata pelajaran:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan mata pelajaran',
      error: error.message
    });
  }
};

exports.updateMataPelajaran = async (req, res) => {
  try {
    const { id } = req.params;
    const { kode_mapel, nama_mapel, tingkat, deskripsi } = req.body;

    const mataPelajaran = await db.MataPelajaran.findByPk(id);
    if (!mataPelajaran) {
      return res.status(404).json({
        success: false,
        message: 'Mata pelajaran tidak ditemukan'
      });
    }

    // Check if new kode_mapel conflicts with existing
    if (kode_mapel && kode_mapel !== mataPelajaran.kode_mapel) {
      const existingMapel = await db.MataPelajaran.findOne({ where: { kode_mapel } });
      if (existingMapel) {
        return res.status(400).json({
          success: false,
          message: 'Kode mata pelajaran sudah digunakan'
        });
      }
    }

    await mataPelajaran.update({
      kode_mapel: kode_mapel || mataPelajaran.kode_mapel,
      nama_mapel: nama_mapel || mataPelajaran.nama_mapel,
      tingkat: tingkat !== undefined ? tingkat : mataPelajaran.tingkat,
      deskripsi: deskripsi !== undefined ? deskripsi : mataPelajaran.deskripsi
    });

    res.json({
      success: true,
      message: 'Mata pelajaran berhasil diperbarui',
      data: mataPelajaran
    });
  } catch (error) {
    console.error('Error updating mata pelajaran:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui mata pelajaran',
      error: error.message
    });
  }
};

exports.deleteMataPelajaran = async (req, res) => {
  try {
    const { id } = req.params;

    const mataPelajaran = await db.MataPelajaran.findByPk(id);
    if (!mataPelajaran) {
      return res.status(404).json({
        success: false,
        message: 'Mata pelajaran tidak ditemukan'
      });
    }

    // Check if mata pelajaran is used in jadwal
    const jadwalCount = await db.JadwalPelajaran.count({
      where: { mata_pelajaran_id: id }
    });

    if (jadwalCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Tidak dapat menghapus mata pelajaran yang masih digunakan di ${jadwalCount} jadwal`
      });
    }

    await mataPelajaran.destroy();

    res.json({
      success: true,
      message: 'Mata pelajaran berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting mata pelajaran:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus mata pelajaran',
      error: error.message
    });
  }
};


// ============================================
// JADWAL PELAJARAN MANAGEMENT
// ============================================
exports.getAllJadwalPelajaran = async (req, res) => {
  try {
    const { kelas_id, hari } = req.query;

    const where = {};
    if (kelas_id) where.kelas_id = kelas_id;
    if (hari) where.hari = hari;

    const jadwal = await db.JadwalPelajaran.findAll({
      where,
      include: [
        {
          model: db.Kelas,
          as: 'kelas',
          attributes: ['id', 'nama_kelas', 'tingkat']
        },
        {
          model: db.MataPelajaran,
          as: 'mata_pelajaran',
          attributes: ['id', 'kode_mapel', 'nama_mapel']
        },
        {
          model: db.Guru,
          as: 'guru',
          attributes: ['id', 'nama_lengkap', 'nip']
        }
      ],
      order: [
        ['hari', 'ASC'],
        ['jam_mulai', 'ASC']
      ]
    });

    res.json({
      success: true,
      data: jadwal
    });
  } catch (error) {
    console.error('Error getting jadwal pelajaran:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memuat data jadwal pelajaran',
      error: error.message
    });
  }
};

exports.getJadwalPelajaranById = async (req, res) => {
  try {
    const { id } = req.params;

    const jadwal = await db.JadwalPelajaran.findByPk(id, {
      include: [
        {
          model: db.Kelas,
          as: 'kelas',
          attributes: ['id', 'nama_kelas', 'tingkat']
        },
        {
          model: db.MataPelajaran,
          as: 'mata_pelajaran',
          attributes: ['id', 'kode_mapel', 'nama_mapel']
        },
        {
          model: db.Guru,
          as: 'guru',
          attributes: ['id', 'nama_lengkap', 'nip']
        }
      ]
    });

    if (!jadwal) {
      return res.status(404).json({
        success: false,
        message: 'Jadwal pelajaran tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: jadwal
    });
  } catch (error) {
    console.error('Error getting jadwal pelajaran:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memuat data jadwal pelajaran',
      error: error.message
    });
  }
};

exports.createJadwalPelajaran = async (req, res) => {
  try {
    const {
      kelas_id,
      mata_pelajaran_id,
      guru_id,
      hari,
      jam_mulai,
      jam_selesai,
      ruangan
    } = req.body;

    // Validation
    if (!kelas_id || !mata_pelajaran_id || !guru_id || !hari || !jam_mulai || !jam_selesai) {
      return res.status(400).json({
        success: false,
        message: 'Kelas, mata pelajaran, guru, hari, jam mulai, dan jam selesai wajib diisi'
      });
    }

    // Check if kelas exists
    const kelas = await db.Kelas.findByPk(kelas_id);
    if (!kelas) {
      return res.status(404).json({
        success: false,
        message: 'Kelas tidak ditemukan'
      });
    }

    // Check if mata pelajaran exists
    const mataPelajaran = await db.MataPelajaran.findByPk(mata_pelajaran_id);
    if (!mataPelajaran) {
      return res.status(404).json({
        success: false,
        message: 'Mata pelajaran tidak ditemukan'
      });
    }

    // Check if guru exists
    const guru = await db.Guru.findByPk(guru_id);
    if (!guru) {
      return res.status(404).json({
        success: false,
        message: 'Guru tidak ditemukan'
      });
    }

    const jadwal = await db.JadwalPelajaran.create({
      kelas_id,
      mata_pelajaran_id,
      guru_id,
      hari,
      jam_mulai,
      jam_selesai,
      ruangan: ruangan || null
    });

    // Fetch with relations
    const createdJadwal = await db.JadwalPelajaran.findByPk(jadwal.id, {
      include: [
        {
          model: db.Kelas,
          as: 'kelas',
          attributes: ['id', 'nama_kelas', 'tingkat']
        },
        {
          model: db.MataPelajaran,
          as: 'mata_pelajaran',
          attributes: ['id', 'kode_mapel', 'nama_mapel']
        },
        {
          model: db.Guru,
          as: 'guru',
          attributes: ['id', 'nama_lengkap', 'nip']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Jadwal pelajaran berhasil ditambahkan',
      data: createdJadwal
    });
  } catch (error) {
    console.error('Error creating jadwal pelajaran:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan jadwal pelajaran',
      error: error.message
    });
  }
};

exports.updateJadwalPelajaran = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      kelas_id,
      mata_pelajaran_id,
      guru_id,
      hari,
      jam_mulai,
      jam_selesai,
      ruangan
    } = req.body;

    const jadwal = await db.JadwalPelajaran.findByPk(id);
    if (!jadwal) {
      return res.status(404).json({
        success: false,
        message: 'Jadwal pelajaran tidak ditemukan'
      });
    }

    await jadwal.update({
      kelas_id: kelas_id || jadwal.kelas_id,
      mata_pelajaran_id: mata_pelajaran_id || jadwal.mata_pelajaran_id,
      guru_id: guru_id || jadwal.guru_id,
      hari: hari || jadwal.hari,
      jam_mulai: jam_mulai || jadwal.jam_mulai,
      jam_selesai: jam_selesai || jadwal.jam_selesai,
      ruangan: ruangan !== undefined ? ruangan : jadwal.ruangan
    });

    // Fetch updated jadwal with relations
    const updatedJadwal = await db.JadwalPelajaran.findByPk(id, {
      include: [
        {
          model: db.Kelas,
          as: 'kelas',
          attributes: ['id', 'nama_kelas', 'tingkat']
        },
        {
          model: db.MataPelajaran,
          as: 'mata_pelajaran',
          attributes: ['id', 'kode_mapel', 'nama_mapel']
        },
        {
          model: db.Guru,
          as: 'guru',
          attributes: ['id', 'nama_lengkap', 'nip']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Jadwal pelajaran berhasil diperbarui',
      data: updatedJadwal
    });
  } catch (error) {
    console.error('Error updating jadwal pelajaran:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui jadwal pelajaran',
      error: error.message
    });
  }
};

exports.deleteJadwalPelajaran = async (req, res) => {
  try {
    const { id } = req.params;

    const jadwal = await db.JadwalPelajaran.findByPk(id);
    if (!jadwal) {
      return res.status(404).json({
        success: false,
        message: 'Jadwal pelajaran tidak ditemukan'
      });
    }

    await jadwal.destroy();

    res.json({
      success: true,
      message: 'Jadwal pelajaran berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting jadwal pelajaran:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus jadwal pelajaran',
      error: error.message
    });
  }
};
