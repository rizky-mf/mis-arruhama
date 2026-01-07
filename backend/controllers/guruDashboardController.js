const { Guru, JadwalPelajaran, Kelas, MataPelajaran, Siswa, Rapor, Presensi, User, InformasiKelas, sequelize } = require('../models');
const { Op } = require('sequelize');
const { getAktifAkademik } = require('../utils/akademikHelper');
const bcrypt = require('bcryptjs');

// Helper function to get guru by user_id
const getGuruByUserId = async (userId) => {
  const guru = await Guru.findOne({
    where: { user_id: userId },
    attributes: ['id', 'nama_lengkap', 'nip']
  });

  if (!guru) {
    throw new Error('Data guru tidak ditemukan');
  }

  return guru;
};

// Get Guru Dashboard data
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get guru data
    const guru = await Guru.findOne({
      where: { user_id: userId },
      attributes: ['id', 'nama_lengkap', 'nip']
    });

    if (!guru) {
      return res.status(404).json({
        success: false,
        message: 'Data guru tidak ditemukan'
      });
    }

    const guruId = guru.id;

    // Get today's day (0 = Minggu, 1 = Senin, dst)
    const today = new Date();
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const todayName = dayNames[today.getDay()];

    // 1. Get jadwal hari ini
    const jadwalHariIni = await JadwalPelajaran.findAll({
      where: {
        guru_id: guruId,
        hari: todayName
      },
      include: [
        {
          model: Kelas,
          as: 'kelas',
          attributes: ['id', 'nama_kelas', 'tingkat']
        },
        {
          model: MataPelajaran,
          as: 'mataPelajaran',
          attributes: ['id', 'nama_mapel', 'kode_mapel']
        }
      ],
      order: [['jam_mulai', 'ASC']]
    });

    // 2. Get all jadwal (untuk hitung total mapel yang diampu)
    const allJadwal = await JadwalPelajaran.findAll({
      where: { guru_id: guruId },
      include: [
        {
          model: MataPelajaran,
          as: 'mataPelajaran',
          attributes: ['id', 'nama_mapel']
        },
        {
          model: Kelas,
          as: 'kelas',
          attributes: ['id', 'nama_kelas']
        }
      ]
    });

    // Get unique mata pelajaran
    const uniqueMapel = [...new Set(allJadwal.map(j => j.mata_pelajaran_id))];
    const totalMapel = uniqueMapel.length;

    // Get unique kelas
    const uniqueKelas = [...new Set(allJadwal.map(j => j.kelas_id))];

    // 3. Get total siswa dari semua kelas yang diajar
    const totalSiswa = await Siswa.count({
      where: {
        kelas_id: {
          [Op.in]: uniqueKelas
        }
      }
    });

    // 4. Get kelas yang diampu dengan detail
    const kelasDiampu = await Kelas.findAll({
      where: {
        id: {
          [Op.in]: uniqueKelas
        }
      },
      include: [
        {
          model: Siswa,
          as: 'siswa',
          attributes: ['id']
        }
      ],
      attributes: ['id', 'nama_kelas', 'tingkat', 'tahun_ajaran']
    });

    // Transform kelas data
    const kelasData = kelasDiampu.map(kelas => ({
      id: kelas.id,
      nama_kelas: kelas.nama_kelas,
      tingkat: kelas.tingkat,
      tahun_ajaran: kelas.tahun_ajaran,
      jumlah_siswa: kelas.siswa.length
    }));

    // 5. Check nilai yang belum diinput (rapor dengan nilai null)
    // Get tahun ajaran and semester aktif from settings
    const akademikAktif = await getAktifAkademik();
    const tahunAjaran = akademikAktif.tahunAjaran;
    const semester = akademikAktif.semester;

    // Count students yang belum ada nilai untuk mapel yang diajar
    let nilaiPending = 0;

    for (const kelasId of uniqueKelas) {
      for (const mapelId of uniqueMapel) {
        const siswaCount = await Siswa.count({
          where: { kelas_id: kelasId }
        });

        const raporCount = await Rapor.count({
          where: {
            kelas_id: kelasId,
            mata_pelajaran_id: mapelId,
            semester: semester,
            tahun_ajaran: tahunAjaran,
            nilai_akhir: {
              [Op.not]: null
            }
          }
        });

        nilaiPending += (siswaCount - raporCount);
      }
    }

    // 6. Check presensi yang belum diisi hari ini
    const todayDate = today.toISOString().split('T')[0];

    let presensiPending = 0;
    for (const kelasId of uniqueKelas) {
      const siswaCount = await Siswa.count({
        where: { kelas_id: kelasId }
      });

      const presensiCount = await Presensi.count({
        where: {
          kelas_id: kelasId,
          tanggal: todayDate
        }
      });

      if (presensiCount < siswaCount) {
        presensiPending++;
      }
    }

    // 7. Recent activities (simplified - last 5 rapor entries)
    const recentNilai = await Rapor.findAll({
      where: {
        mata_pelajaran_id: {
          [Op.in]: uniqueMapel
        },
        kelas_id: {
          [Op.in]: uniqueKelas
        }
      },
      include: [
        {
          model: Siswa,
          as: 'siswa',
          attributes: ['nama_lengkap', 'nisn']
        },
        {
          model: MataPelajaran,
          as: 'mataPelajaran',
          attributes: ['nama_mapel']
        },
        {
          model: Kelas,
          as: 'kelas',
          attributes: ['nama_kelas']
        }
      ],
      order: [['updated_at', 'DESC']],
      limit: 5
    });

    res.json({
      success: true,
      data: {
        guru: {
          nama: guru.nama_lengkap,
          nip: guru.nip
        },
        statistics: {
          jadwal_hari_ini: jadwalHariIni.length,
          total_siswa: totalSiswa,
          total_mapel: totalMapel,
          nilai_pending: nilaiPending,
          presensi_pending: presensiPending
        },
        jadwal_hari_ini: jadwalHariIni.map(j => ({
          id: j.id,
          hari: j.hari,
          jam_mulai: j.jam_mulai,
          jam_selesai: j.jam_selesai,
          kelas: j.kelas.nama_kelas,
          mata_pelajaran: j.mataPelajaran.nama_mapel,
          ruangan: j.ruangan
        })),
        kelas_diampu: kelasData,
        recent_nilai: recentNilai.map(r => ({
          siswa: r.siswa.nama_lengkap,
          kelas: r.kelas.nama_kelas,
          mata_pelajaran: r.mataPelajaran.nama_mapel,
          nilai_akhir: r.nilai_akhir,
          predikat: r.predikat,
          updated_at: r.updated_at
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching guru dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data dashboard',
      error: error.message
    });
  }
};

// Get Jadwal Mengajar
exports.getJadwal = async (req, res) => {
  try {
    const userId = req.user.id;
    const guru = await getGuruByUserId(userId);

    const jadwal = await JadwalPelajaran.findAll({
      where: { guru_id: guru.id },
      include: [
        {
          model: Kelas,
          as: 'kelas',
          attributes: ['id', 'nama_kelas', 'tingkat']
        },
        {
          model: MataPelajaran,
          as: 'mataPelajaran',
          attributes: ['id', 'nama_mapel', 'kode_mapel']
        }
      ],
      order: [['hari', 'ASC'], ['jam_mulai', 'ASC']]
    });

    res.json({
      success: true,
      data: jadwal
    });
  } catch (error) {
    console.error('Error fetching jadwal:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Gagal mengambil jadwal',
      error: error.message
    });
  }
};

// Get Kelas yang Diampu
exports.getKelasDiampu = async (req, res) => {
  try {
    const userId = req.user.id;
    const guru = await getGuruByUserId(userId);

    // Get unique kelas from jadwal
    const jadwal = await JadwalPelajaran.findAll({
      where: { guru_id: guru.id },
      attributes: ['kelas_id'],
      group: ['kelas_id']
    });

    const kelasIds = jadwal.map(j => j.kelas_id);

    const kelas = await Kelas.findAll({
      where: {
        id: {
          [Op.in]: kelasIds
        }
      },
      include: [
        {
          model: Siswa,
          as: 'siswa',
          attributes: ['id']
        }
      ],
      attributes: ['id', 'nama_kelas', 'tingkat', 'tahun_ajaran']
    });

    const kelasData = kelas.map(k => ({
      id: k.id,
      nama_kelas: k.nama_kelas,
      tingkat: k.tingkat,
      tahun_ajaran: k.tahun_ajaran,
      jumlah_siswa: k.siswa.length
    }));

    res.json({
      success: true,
      data: kelasData
    });
  } catch (error) {
    console.error('Error fetching kelas:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Gagal mengambil kelas',
      error: error.message
    });
  }
};

// Get Siswa by Kelas
exports.getSiswaByKelas = async (req, res) => {
  try {
    const { kelas_id } = req.params;
    const userId = req.user.id;
    const guru = await getGuruByUserId(userId);

    // Verify guru mengajar di kelas ini
    const jadwal = await JadwalPelajaran.findOne({
      where: {
        guru_id: guru.id,
        kelas_id: kelas_id
      }
    });

    if (!jadwal) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak mengajar di kelas ini'
      });
    }

    const siswa = await Siswa.findAll({
      where: { kelas_id },
      attributes: ['id', 'nisn', 'nama_lengkap', 'jenis_kelamin'],
      order: [['nama_lengkap', 'ASC']]
    });

    res.json({
      success: true,
      data: siswa
    });
  } catch (error) {
    console.error('Error fetching siswa:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Gagal mengambil data siswa',
      error: error.message
    });
  }
};

// Get Mata Pelajaran Diampu
exports.getMataPelajaranDiampu = async (req, res) => {
  try {
    const userId = req.user.id;
    const guru = await getGuruByUserId(userId);

    // Get unique mata pelajaran from jadwal
    const jadwal = await JadwalPelajaran.findAll({
      where: { guru_id: guru.id },
      include: [
        {
          model: MataPelajaran,
          as: 'mataPelajaran',
          attributes: ['id', 'kode_mapel', 'nama_mapel']
        }
      ],
      attributes: ['mata_pelajaran_id'],
      group: ['mata_pelajaran_id']
    });

    // Extract unique mata pelajaran
    const mataPelajaran = jadwal.map(j => j.mataPelajaran).filter(m => m !== null);

    res.json({
      success: true,
      data: mataPelajaran
    });
  } catch (error) {
    console.error('Error fetching mata pelajaran:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Gagal mengambil data mata pelajaran',
      error: error.message
    });
  }
};

// Get Profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const guru = await Guru.findOne({
      where: { user_id: userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'role']
        }
      ]
    });

    if (!guru) {
      return res.status(404).json({
        success: false,
        message: 'Data guru tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: {
        id: guru.id,
        user_id: guru.user_id,
        username: guru.user.username,
        nip: guru.nip,
        nama_lengkap: guru.nama_lengkap,
        jenis_kelamin: guru.jenis_kelamin,
        tanggal_lahir: guru.tanggal_lahir,
        alamat: guru.alamat,
        telepon: guru.telepon,
        email: guru.email,
        foto: guru.foto
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data profil',
      error: error.message
    });
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { telepon, email, alamat, tanggal_lahir, foto } = req.body;

    const guru = await Guru.findOne({
      where: { user_id: userId }
    });

    if (!guru) {
      return res.status(404).json({
        success: false,
        message: 'Data guru tidak ditemukan'
      });
    }

    // Update hanya field yang diizinkan untuk diubah
    const updateData = {};
    if (telepon !== undefined) updateData.telepon = telepon;
    if (email !== undefined) updateData.email = email;
    if (alamat !== undefined) updateData.alamat = alamat;
    if (tanggal_lahir !== undefined) updateData.tanggal_lahir = tanggal_lahir;
    if (foto !== undefined) updateData.foto = foto;

    await guru.update(updateData);

    res.json({
      success: true,
      message: 'Profil berhasil diperbarui',
      data: guru
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui profil',
      error: error.message
    });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password_lama, password_baru, konfirmasi_password } = req.body;

    // Validasi input
    if (!password_lama || !password_baru || !konfirmasi_password) {
      return res.status(400).json({
        success: false,
        message: 'Semua field harus diisi'
      });
    }

    if (password_baru !== konfirmasi_password) {
      return res.status(400).json({
        success: false,
        message: 'Password baru dan konfirmasi password tidak cocok'
      });
    }

    if (password_baru.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password baru minimal 6 karakter'
      });
    }

    // Get user data
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    // Verify password lama
    const isPasswordValid = await bcrypt.compare(password_lama, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Password lama tidak sesuai'
      });
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(password_baru, 10);

    // Update password
    await user.update({
      password: hashedPassword
    });

    res.json({
      success: true,
      message: 'Password berhasil diubah'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengubah password',
      error: error.message
    });
  }
};

// Get Info Mengajar (Jadwal + Mata Pelajaran + Kelas)
exports.getInfoMengajar = async (req, res) => {
  try {
    const userId = req.user.id;
    const guru = await getGuruByUserId(userId);

    // Get all jadwal
    const jadwal = await JadwalPelajaran.findAll({
      where: { guru_id: guru.id },
      include: [
        {
          model: Kelas,
          as: 'kelas',
          attributes: ['id', 'nama_kelas', 'tingkat', 'tahun_ajaran']
        },
        {
          model: MataPelajaran,
          as: 'mataPelajaran',
          attributes: ['id', 'nama_mapel', 'kode_mapel']
        }
      ],
      order: [['hari', 'ASC'], ['jam_mulai', 'ASC']]
    });

    // Get unique mata pelajaran
    const uniqueMapel = {};
    jadwal.forEach(j => {
      if (j.mata_pelajaran && !uniqueMapel[j.mataPelajaran.id]) {
        uniqueMapel[j.mataPelajaran.id] = {
          id: j.mataPelajaran.id,
          kode_mapel: j.mataPelajaran.kode_mapel,
          nama_mapel: j.mataPelajaran.nama_mapel
        };
      }
    });

    // Get unique kelas
    const uniqueKelas = {};
    jadwal.forEach(j => {
      if (j.kelas && !uniqueKelas[j.kelas.id]) {
        uniqueKelas[j.kelas.id] = {
          id: j.kelas.id,
          nama_kelas: j.kelas.nama_kelas,
          tingkat: j.kelas.tingkat,
          tahun_ajaran: j.kelas.tahun_ajaran
        };
      }
    });

    res.json({
      success: true,
      data: {
        guru: {
          nama: guru.nama_lengkap,
          nip: guru.nip
        },
        mata_pelajaran: Object.values(uniqueMapel),
        kelas: Object.values(uniqueKelas),
        jadwal: jadwal.map(j => ({
          id: j.id,
          hari: j.hari,
          jam_mulai: j.jam_mulai,
          jam_selesai: j.jam_selesai,
          kelas: j.kelas ? j.kelas.nama_kelas : null,
          mata_pelajaran: j.mata_pelajaran ? j.mataPelajaran.nama_mapel : null,
          ruangan: j.ruangan
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching info mengajar:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil info mengajar',
      error: error.message
    });
  }
};

// Get Informasi Kelas (hanya kelas yang diampu sebagai wali kelas)
exports.getInformasiKelas = async (req, res) => {
  try {
    const userId = req.user.id;
    const guru = await getGuruByUserId(userId);

    // Get kelas where this guru is wali kelas
    const kelasWali = await Kelas.findAll({
      where: { guru_id: guru.id },
      attributes: ['id', 'nama_kelas', 'tingkat']
    });

    if (kelasWali.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: 'Anda belum menjadi wali kelas'
      });
    }

    const kelasIds = kelasWali.map(k => k.id);

    // Get informasi kelas for these classes
    const informasiKelas = await InformasiKelas.findAll({
      where: {
        kelas_id: { [Op.in]: kelasIds },
        guru_id: guru.id
      },
      include: [
        {
          model: Kelas,
          as: 'kelas',
          attributes: ['id', 'nama_kelas', 'tingkat']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: informasiKelas,
      kelas_wali: kelasWali
    });
  } catch (error) {
    console.error('Error fetching informasi kelas:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil informasi kelas',
      error: error.message
    });
  }
};

// Create Informasi Kelas
exports.createInformasiKelas = async (req, res) => {
  try {
    const userId = req.user.id;
    const { kelas_id, judul, konten } = req.body;

    if (!kelas_id || !judul || !konten) {
      return res.status(400).json({
        success: false,
        message: 'Kelas, judul, dan konten harus diisi'
      });
    }

    const guru = await getGuruByUserId(userId);

    // Verify this guru is wali kelas for this class
    const kelas = await Kelas.findOne({
      where: {
        id: kelas_id,
        guru_id: guru.id
      }
    });

    if (!kelas) {
      return res.status(403).json({
        success: false,
        message: 'Anda bukan wali kelas untuk kelas ini'
      });
    }

    const informasi = await InformasiKelas.create({
      kelas_id,
      guru_id: guru.id,
      judul,
      konten
    });

    res.status(201).json({
      success: true,
      message: 'Informasi kelas berhasil ditambahkan',
      data: informasi
    });
  } catch (error) {
    console.error('Error creating informasi kelas:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan informasi kelas',
      error: error.message
    });
  }
};

// Update Informasi Kelas
exports.updateInformasiKelas = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { judul, konten } = req.body;

    const guru = await getGuruByUserId(userId);

    // Find and verify ownership
    const informasi = await InformasiKelas.findOne({
      where: {
        id,
        guru_id: guru.id
      }
    });

    if (!informasi) {
      return res.status(404).json({
        success: false,
        message: 'Informasi tidak ditemukan atau Anda tidak memiliki akses'
      });
    }

    await informasi.update({
      judul: judul !== undefined ? judul : informasi.judul,
      konten: konten !== undefined ? konten : informasi.konten
    });

    res.json({
      success: true,
      message: 'Informasi kelas berhasil diperbarui',
      data: informasi
    });
  } catch (error) {
    console.error('Error updating informasi kelas:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui informasi kelas',
      error: error.message
    });
  }
};

// Delete Informasi Kelas
exports.deleteInformasiKelas = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const guru = await getGuruByUserId(userId);

    // Find and verify ownership
    const informasi = await InformasiKelas.findOne({
      where: {
        id,
        guru_id: guru.id
      }
    });

    if (!informasi) {
      return res.status(404).json({
        success: false,
        message: 'Informasi tidak ditemukan atau Anda tidak memiliki akses'
      });
    }

    await informasi.destroy();

    res.json({
      success: true,
      message: 'Informasi kelas berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting informasi kelas:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus informasi kelas',
      error: error.message
    });
  }
};
