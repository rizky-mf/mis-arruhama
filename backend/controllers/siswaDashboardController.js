const { Siswa, Kelas, JadwalPelajaran, MataPelajaran, Guru, Rapor, Presensi, InformasiKelas, User, Pembayaran, ListPembayaran, sequelize } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

// Helper function to get siswa by user_id
const getSiswaByUserId = async (userId) => {
  const siswa = await Siswa.findOne({
    where: { user_id: userId },
    include: [
      {
        model: Kelas,
        as: 'kelas',
        attributes: ['id', 'nama_kelas', 'tingkat', 'tahun_ajaran', 'guru_id']
      }
    ],
    attributes: ['id', 'nisn', 'nama_lengkap', 'kelas_id', 'jenis_kelamin']
  });

  if (!siswa) {
    throw new Error('Data siswa tidak ditemukan');
  }

  return siswa;
};

// Get Siswa Dashboard
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get siswa data with kelas
    const siswa = await getSiswaByUserId(userId);

    if (!siswa.kelas) {
      return res.json({
        success: true,
        data: {
          siswa: {
            nama: siswa.nama_lengkap,
            nisn: siswa.nisn,
            kelas: null
          },
          statistics: {
            jadwal_hari_ini: 0,
            rata_rata_nilai: 0,
            persentase_kehadiran: 0,
            total_informasi: 0
          },
          jadwal_hari_ini: [],
          informasi_terbaru: []
        },
        message: 'Anda belum terdaftar di kelas manapun'
      });
    }

    const kelasId = siswa.kelas.id;

    // Get today's day name
    const today = new Date();
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const todayName = dayNames[today.getDay()];

    // 1. Get jadwal hari ini
    const jadwalHariIni = await JadwalPelajaran.findAll({
      where: {
        kelas_id: kelasId,
        hari: todayName
      },
      include: [
        {
          model: MataPelajaran,
          as: 'mata_pelajaran',
          attributes: ['id', 'nama_mapel', 'kode_mapel']
        },
        {
          model: Guru,
          as: 'guru',
          attributes: ['id', 'nama_lengkap']
        }
      ],
      order: [['jam_mulai', 'ASC']]
    });

    // 2. Get rata-rata nilai (dari rapor semester aktif)
    const { Settings } = require('../models');
    const semesterSetting = await Settings.findOne({
      where: { key: 'semester_aktif' }
    });
    const tahunAjaranSetting = await Settings.findOne({
      where: { key: 'tahun_ajaran_aktif' }
    });

    const semester = semesterSetting?.value || 'Ganjil';
    const tahunAjaran = tahunAjaranSetting?.value || '2024/2025';

    const nilaiRapor = await Rapor.findAll({
      where: {
        siswa_id: siswa.id,
        semester: semester,
        tahun_ajaran: tahunAjaran,
        nilai_akhir: {
          [Op.not]: null
        }
      },
      attributes: ['nilai_akhir']
    });

    let rataRataNilai = 0;
    if (nilaiRapor.length > 0) {
      const totalNilai = nilaiRapor.reduce((sum, r) => sum + parseFloat(r.nilai_akhir), 0);
      rataRataNilai = Math.round(totalNilai / nilaiRapor.length);
    }

    // 3. Get persentase kehadiran (30 hari terakhir)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const presensi = await Presensi.findAll({
      where: {
        siswa_id: siswa.id,
        tanggal: {
          [Op.gte]: thirtyDaysAgo
        }
      },
      attributes: ['status']
    });

    let persentaseKehadiran = 0;
    if (presensi.length > 0) {
      const hadir = presensi.filter(p => p.status === 'hadir').length;
      persentaseKehadiran = Math.round((hadir / presensi.length) * 100);
    }

    // 4. Get informasi kelas terbaru (jika ada wali kelas)
    let informasiTerbaru = [];
    if (siswa.kelas.guru_id) {
      informasiTerbaru = await InformasiKelas.findAll({
        where: {
          kelas_id: kelasId
        },
        include: [
          {
            model: Guru,
            as: 'guru',
            attributes: ['nama_lengkap']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: 3
      });
    }

    res.json({
      success: true,
      data: {
        siswa: {
          nama: siswa.nama_lengkap,
          nisn: siswa.nisn,
          kelas: siswa.kelas.nama_kelas,
          tingkat: siswa.kelas.tingkat,
          tahun_ajaran: siswa.kelas.tahun_ajaran
        },
        statistics: {
          jadwal_hari_ini: jadwalHariIni.length,
          rata_rata_nilai: rataRataNilai,
          persentase_kehadiran: persentaseKehadiran,
          total_informasi: informasiTerbaru.length
        },
        jadwal_hari_ini: jadwalHariIni.map(j => ({
          id: j.id,
          jam_mulai: j.jam_mulai,
          jam_selesai: j.jam_selesai,
          mata_pelajaran: j.mata_pelajaran?.nama_mapel || '-',
          guru: j.guru?.nama_lengkap || '-',
          ruangan: j.ruangan
        })),
        informasi_terbaru: informasiTerbaru.map(i => ({
          id: i.id,
          judul: i.judul,
          konten: i.konten,
          guru: i.guru?.nama_lengkap || 'Wali Kelas',
          created_at: i.created_at
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching siswa dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data dashboard',
      error: error.message
    });
  }
};

// Get Jadwal Pelajaran (full week schedule)
exports.getJadwalPelajaran = async (req, res) => {
  try {
    const userId = req.user.id;
    const siswa = await getSiswaByUserId(userId);

    if (!siswa.kelas) {
      return res.json({
        success: true,
        data: {
          kelas: null,
          jadwal: []
        },
        message: 'Anda belum terdaftar di kelas manapun'
      });
    }

    const kelasId = siswa.kelas.id;

    // Get all jadwal for this kelas, grouped by day
    const jadwal = await JadwalPelajaran.findAll({
      where: { kelas_id: kelasId },
      include: [
        {
          model: MataPelajaran,
          as: 'mata_pelajaran',
          attributes: ['id', 'nama_mapel', 'kode_mapel']
        },
        {
          model: Guru,
          as: 'guru',
          attributes: ['id', 'nama_lengkap']
        }
      ],
      order: [
        ['hari', 'ASC'],
        ['jam_mulai', 'ASC']
      ]
    });

    // Group jadwal by day
    const dayOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const jadwalByDay = {};

    dayOrder.forEach(day => {
      jadwalByDay[day] = jadwal
        .filter(j => j.hari === day)
        .map(j => ({
          id: j.id,
          jam_mulai: j.jam_mulai,
          jam_selesai: j.jam_selesai,
          mata_pelajaran: j.mata_pelajaran?.nama_mapel || '-',
          kode_mapel: j.mata_pelajaran?.kode_mapel || '-',
          guru: j.guru?.nama_lengkap || '-',
          ruangan: j.ruangan
        }));
    });

    res.json({
      success: true,
      data: {
        kelas: {
          nama: siswa.kelas.nama_kelas,
          tingkat: siswa.kelas.tingkat,
          tahun_ajaran: siswa.kelas.tahun_ajaran
        },
        jadwal: jadwalByDay
      }
    });

  } catch (error) {
    console.error('Error fetching jadwal pelajaran:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil jadwal pelajaran',
      error: error.message
    });
  }
};

// Get Nilai & Rapor
exports.getNilaiRapor = async (req, res) => {
  try {
    const userId = req.user.id;
    const siswa = await getSiswaByUserId(userId);

    if (!siswa.kelas) {
      return res.json({
        success: true,
        data: {
          siswa: {
            nama: siswa.nama_lengkap,
            nisn: siswa.nisn,
            kelas: null
          },
          nilai: []
        },
        message: 'Anda belum terdaftar di kelas manapun'
      });
    }

    // Get settings for semester and tahun ajaran
    const { Settings } = require('../models');
    const semesterSetting = await Settings.findOne({
      where: { key: 'semester_aktif' }
    });
    const tahunAjaranSetting = await Settings.findOne({
      where: { key: 'tahun_ajaran_aktif' }
    });

    const semester = semesterSetting?.value || 'Ganjil';
    const tahunAjaran = tahunAjaranSetting?.value || '2024/2025';

    // Get nilai rapor for current semester
    const nilaiRapor = await Rapor.findAll({
      where: {
        siswa_id: siswa.id,
        semester: semester,
        tahun_ajaran: tahunAjaran
      },
      include: [
        {
          model: MataPelajaran,
          as: 'mata_pelajaran',
          attributes: ['id', 'nama_mapel', 'kode_mapel']
        }
      ],
      order: [['mata_pelajaran', 'nama_mapel', 'ASC']]
    });

    // Get guru info for each mapel by finding who teaches it in this kelas
    const kelasId = siswa.kelas.id;
    const guruMapelMap = {};

    const jadwalKelas = await JadwalPelajaran.findAll({
      where: { kelas_id: kelasId },
      include: [
        {
          model: MataPelajaran,
          as: 'mata_pelajaran',
          attributes: ['id']
        },
        {
          model: Guru,
          as: 'guru',
          attributes: ['id', 'nama_lengkap']
        }
      ]
    });

    jadwalKelas.forEach(j => {
      if (j.mata_pelajaran && j.guru) {
        guruMapelMap[j.mata_pelajaran.id] = j.guru.nama_lengkap;
      }
    });

    // Calculate statistics
    const nilaiWithData = nilaiRapor.filter(n => n.nilai_akhir !== null);
    let rataRata = 0;
    let totalLulus = 0;

    if (nilaiWithData.length > 0) {
      const totalNilai = nilaiWithData.reduce((sum, n) => sum + parseFloat(n.nilai_akhir), 0);
      rataRata = Math.round(totalNilai / nilaiWithData.length);

      totalLulus = nilaiWithData.filter(n => {
        const kkm = 70; // Default KKM
        return parseFloat(n.nilai_akhir) >= kkm;
      }).length;
    }

    res.json({
      success: true,
      data: {
        siswa: {
          nama: siswa.nama_lengkap,
          nisn: siswa.nisn,
          kelas: siswa.kelas.nama_kelas,
          tingkat: siswa.kelas.tingkat
        },
        periode: {
          semester: semester,
          tahun_ajaran: tahunAjaran
        },
        statistik: {
          rata_rata: rataRata,
          total_mapel: nilaiWithData.length,
          total_lulus: totalLulus
        },
        nilai: nilaiRapor.map(n => ({
          id: n.id,
          mata_pelajaran: n.mata_pelajaran?.nama_mapel || '-',
          kode_mapel: n.mata_pelajaran?.kode_mapel || '-',
          guru: guruMapelMap[n.mata_pelajaran?.id] || '-',
          kkm: 70, // Default KKM
          tugas: n.nilai_harian,
          uts: n.nilai_uts,
          uas: n.nilai_uas,
          nilai_akhir: n.nilai_akhir,
          predikat: n.predikat,
          catatan: n.catatan
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching nilai rapor:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil nilai rapor',
      error: error.message
    });
  }
};

// Get Presensi (attendance history)
exports.getPresensi = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bulan, tahun } = req.query;

    const siswa = await getSiswaByUserId(userId);

    if (!siswa.kelas) {
      return res.json({
        success: true,
        data: {
          siswa: {
            nama: siswa.nama_lengkap,
            nisn: siswa.nisn,
            kelas: null
          },
          presensi: [],
          statistik: {
            hadir: 0,
            izin: 0,
            sakit: 0,
            alpa: 0,
            total: 0,
            persentase_kehadiran: 0
          }
        },
        message: 'Anda belum terdaftar di kelas manapun'
      });
    }

    // Build where clause for date filtering
    const whereClause = { siswa_id: siswa.id };

    // If bulan and tahun provided, filter by that month
    if (bulan && tahun) {
      const startDate = new Date(tahun, bulan - 1, 1);
      const endDate = new Date(tahun, bulan, 0, 23, 59, 59);

      whereClause.tanggal = {
        [Op.between]: [startDate, endDate]
      };
    } else {
      // Default: get last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      whereClause.tanggal = {
        [Op.gte]: thirtyDaysAgo
      };
    }

    // Get presensi data (presensi harian, tidak per mata pelajaran)
    const presensi = await Presensi.findAll({
      where: whereClause,
      order: [['tanggal', 'DESC']]
    });

    // Calculate statistics
    const statistik = {
      hadir: presensi.filter(p => p.status === 'hadir').length,
      izin: presensi.filter(p => p.status === 'izin').length,
      sakit: presensi.filter(p => p.status === 'sakit').length,
      alpa: presensi.filter(p => p.status === 'alpa').length,
      total: presensi.length,
      persentase_kehadiran: 0
    };

    if (statistik.total > 0) {
      statistik.persentase_kehadiran = Math.round((statistik.hadir / statistik.total) * 100);
    }

    res.json({
      success: true,
      data: {
        siswa: {
          nama: siswa.nama_lengkap,
          nisn: siswa.nisn,
          kelas: siswa.kelas.nama_kelas,
          tingkat: siswa.kelas.tingkat
        },
        presensi: presensi.map(p => ({
          id: p.id,
          tanggal: p.tanggal,
          status: p.status,
          keterangan: p.keterangan
        })),
        statistik: statistik
      }
    });

  } catch (error) {
    console.error('Error fetching presensi:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data presensi',
      error: error.message
    });
  }
};

// Get Informasi Kelas (announcements from wali kelas)
exports.getInformasi = async (req, res) => {
  try {
    const userId = req.user.id;
    const siswa = await getSiswaByUserId(userId);

    if (!siswa.kelas) {
      return res.json({
        success: true,
        data: {
          siswa: {
            nama: siswa.nama_lengkap,
            nisn: siswa.nisn,
            kelas: null
          },
          informasi: []
        },
        message: 'Anda belum terdaftar di kelas manapun'
      });
    }

    const kelasId = siswa.kelas.id;

    // Get all informasi for this kelas
    const informasi = await InformasiKelas.findAll({
      where: { kelas_id: kelasId },
      include: [
        {
          model: Guru,
          as: 'guru',
          attributes: ['id', 'nama_lengkap']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        siswa: {
          nama: siswa.nama_lengkap,
          nisn: siswa.nisn,
          kelas: siswa.kelas.nama_kelas,
          tingkat: siswa.kelas.tingkat
        },
        informasi: informasi.map(i => ({
          id: i.id,
          judul: i.judul,
          konten: i.konten,
          guru: i.guru?.nama_lengkap || 'Wali Kelas',
          created_at: i.created_at
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching informasi:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil informasi kelas',
      error: error.message
    });
  }
};

// Get Profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const siswa = await getSiswaByUserId(userId);

    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'role']
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        },
        siswa: {
          nisn: siswa.nisn,
          nama_lengkap: siswa.nama_lengkap,
          jenis_kelamin: siswa.jenis_kelamin,
          tempat_lahir: siswa.tempat_lahir,
          tanggal_lahir: siswa.tanggal_lahir,
          alamat: siswa.alamat,
          telepon: siswa.telepon,
          email: siswa.email,
          nama_ayah: siswa.nama_ayah,
          nama_ibu: siswa.nama_ibu,
          telepon_ortu: siswa.telepon_ortu,
          foto: siswa.foto,
          kelas: siswa.kelas ? {
            id: siswa.kelas.id,
            nama_kelas: siswa.kelas.nama_kelas,
            tingkat: siswa.kelas.tingkat,
            tahun_ajaran: siswa.kelas.tahun_ajaran
          } : null
        }
      }
    });

  } catch (error) {
    console.error('Error fetching siswa profile:', error);
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

    const siswa = await getSiswaByUserId(userId);

    // Update only editable fields
    await siswa.update({
      telepon: telepon || siswa.telepon,
      email: email || siswa.email,
      alamat: alamat || siswa.alamat,
      tanggal_lahir: tanggal_lahir || siswa.tanggal_lahir,
      foto: foto || siswa.foto
    });

    res.json({
      success: true,
      message: 'Profil berhasil diperbarui'
    });

  } catch (error) {
    console.error('Error updating siswa profile:', error);
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

    // Validation
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

// Get Pembayaran (payment history and obligations)
exports.getPembayaran = async (req, res) => {
  try {
    const userId = req.user.id;
    const siswa = await getSiswaByUserId(userId);

    if (!siswa.kelas) {
      return res.json({
        success: true,
        data: {
          siswa: {
            nama: siswa.nama_lengkap,
            nisn: siswa.nisn,
            kelas: null
          },
          tagihan: [],
          riwayat_pembayaran: [],
          statistik: {
            total_tagihan: 0,
            sudah_bayar: 0,
            belum_bayar: 0,
            pending: 0
          }
        },
        message: 'Anda belum terdaftar di kelas manapun'
      });
    }

    // Get list pembayaran yang aktif untuk tingkat siswa
    const listPembayaran = await ListPembayaran.findAll({
      where: {
        status: 'aktif',
        [Op.or]: [
          { tingkat: siswa.kelas.tingkat },
          { tingkat: 0 } // 0 = untuk semua tingkat
        ]
      },
      order: [['periode', 'ASC'], ['nama_pembayaran', 'ASC']]
    });

    // Get riwayat pembayaran siswa
    const pembayaran = await Pembayaran.findAll({
      where: { siswa_id: siswa.id },
      include: [
        {
          model: ListPembayaran,
          as: 'jenis_pembayaran',
          attributes: ['id', 'nama_pembayaran', 'nominal', 'periode']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'username']
        }
      ],
      order: [['tanggal_bayar', 'DESC']]
    });

    // Create map of paid list_pembayaran_ids
    const paidMap = {};
    pembayaran.forEach(p => {
      if (p.status === 'approved') {
        paidMap[p.list_pembayaran_id] = true;
      }
    });

    // Create tagihan (bills) - list pembayaran yang belum dibayar atau pending
    const tagihan = listPembayaran.map(lp => {
      const existingPayment = pembayaran.find(p => p.list_pembayaran_id === lp.id);

      return {
        id: lp.id,
        nama_pembayaran: lp.nama_pembayaran,
        nominal: lp.nominal,
        periode: lp.periode,
        deskripsi: lp.deskripsi,
        status_bayar: existingPayment ? existingPayment.status : 'belum_bayar',
        sudah_bayar: paidMap[lp.id] ? true : false,
        pembayaran_id: existingPayment ? existingPayment.id : null
      };
    });

    // Calculate statistics
    const statistik = {
      total_tagihan: listPembayaran.length,
      sudah_bayar: pembayaran.filter(p => p.status === 'approved').length,
      belum_bayar: tagihan.filter(t => t.status_bayar === 'belum_bayar').length,
      pending: pembayaran.filter(p => p.status === 'pending').length
    };

    res.json({
      success: true,
      data: {
        siswa: {
          nama: siswa.nama_lengkap,
          nisn: siswa.nisn,
          kelas: siswa.kelas.nama_kelas,
          tingkat: siswa.kelas.tingkat
        },
        tagihan: tagihan,
        riwayat_pembayaran: pembayaran.map(p => ({
          id: p.id,
          jenis_pembayaran: p.jenis_pembayaran?.nama_pembayaran || '-',
          nominal: p.jenis_pembayaran?.nominal || 0,
          jumlah_bayar: p.jumlah_bayar,
          tanggal_bayar: p.tanggal_bayar,
          bukti_bayar: p.bukti_bayar,
          status: p.status,
          catatan: p.catatan,
          approved_by: p.approver?.username || null,
          approved_at: p.approved_at
        })),
        statistik: statistik
      }
    });

  } catch (error) {
    console.error('Error fetching pembayaran:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data pembayaran',
      error: error.message
    });
  }
};

// Submit Pembayaran (Ajukan Pembayaran)
exports.submitPembayaran = async (req, res) => {
  try {
    const userId = req.user.id;
    const { list_pembayaran_id, jumlah_bayar, tanggal_bayar, catatan } = req.body;

    // Validasi input
    if (!list_pembayaran_id || !jumlah_bayar || !tanggal_bayar) {
      return res.status(400).json({
        success: false,
        message: 'List pembayaran ID, jumlah bayar, dan tanggal bayar wajib diisi'
      });
    }

    // Get siswa data
    const siswa = await getSiswaByUserId(userId);

    if (!siswa.kelas) {
      return res.status(400).json({
        success: false,
        message: 'Anda belum terdaftar di kelas manapun'
      });
    }

    // Validasi list pembayaran exists
    const listPembayaran = await ListPembayaran.findByPk(list_pembayaran_id);
    if (!listPembayaran) {
      return res.status(404).json({
        success: false,
        message: 'Jenis pembayaran tidak ditemukan'
      });
    }

    // Check if pembayaran for this list already exists and is pending or approved
    const existingPembayaran = await Pembayaran.findOne({
      where: {
        siswa_id: siswa.id,
        list_pembayaran_id: list_pembayaran_id,
        status: ['pending', 'approved']
      }
    });

    if (existingPembayaran) {
      return res.status(400).json({
        success: false,
        message: existingPembayaran.status === 'approved'
          ? 'Pembayaran ini sudah disetujui'
          : 'Anda sudah mengajukan pembayaran ini, menunggu persetujuan admin'
      });
    }

    // Create new pembayaran with status pending
    const newPembayaran = await Pembayaran.create({
      siswa_id: siswa.id,
      list_pembayaran_id: list_pembayaran_id,
      jumlah_bayar: jumlah_bayar,
      tanggal_bayar: tanggal_bayar,
      catatan: catatan || null,
      status: 'pending',
      bukti_bayar: null
    });

    res.status(201).json({
      success: true,
      message: 'Pengajuan pembayaran berhasil dikirim. Menunggu persetujuan admin.',
      data: {
        id: newPembayaran.id,
        jenis_pembayaran: listPembayaran.nama_pembayaran,
        nominal: listPembayaran.nominal,
        jumlah_bayar: newPembayaran.jumlah_bayar,
        tanggal_bayar: newPembayaran.tanggal_bayar,
        status: newPembayaran.status,
        catatan: newPembayaran.catatan
      }
    });

  } catch (error) {
    console.error('Error submitting pembayaran:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengajukan pembayaran',
      error: error.message
    });
  }
};
