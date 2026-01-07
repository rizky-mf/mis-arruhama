// controllers/jadwalGridController.js
const db = require('../models');
const { Op } = require('sequelize');

// Color palette for mata pelajaran
const COLOR_PALETTE = [
  '#EF4444', // red
  '#F59E0B', // amber
  '#10B981', // green
  '#3B82F6', // blue
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#F97316', // orange
  '#6366F1', // indigo
  '#14B8A6', // teal
  '#F43F5E', // rose
];

// Get jadwal for all classes (grid view)
exports.getJadwalGrid = async (req, res) => {
  try {
    const { tingkat, hari } = req.query;

    // Build filter
    const kelasWhere = {};
    if (tingkat) {
      kelasWhere.tingkat = tingkat;
    }

    const jadwalWhere = {};
    if (hari) {
      jadwalWhere.hari = hari;
    }

    // Get all kelas
    const kelasList = await db.Kelas.findAll({
      where: kelasWhere,
      order: [['tingkat', 'ASC'], ['nama_kelas', 'ASC']],
      attributes: ['id', 'nama_kelas', 'tingkat']
    });

    // Get all jadwal for these kelas
    const kelasIds = kelasList.map(k => k.id);

    const jadwalList = await db.JadwalPelajaran.findAll({
      where: {
        kelas_id: { [Op.in]: kelasIds },
        ...jadwalWhere
      },
      include: [
        {
          model: db.MataPelajaran,
          as: 'mataPelajaran',
          attributes: ['id', 'nama_mapel', 'kode_mapel']
        },
        {
          model: db.Guru,
          as: 'guru',
          attributes: ['id', 'nama_lengkap', 'nip', 'foto']
        },
        {
          model: db.Kelas,
          as: 'kelas',
          attributes: ['id', 'nama_kelas', 'tingkat']
        }
      ],
      order: [['hari', 'ASC'], ['jam_mulai', 'ASC']]
    });

    // Define time slots (07:35 - 11:40)
    const timeSlots = [
      { slot: 1, jam_mulai: '07:35:00', jam_selesai: '08:10:00' },
      { slot: 2, jam_mulai: '08:10:00', jam_selesai: '08:45:00' },
      { slot: 3, jam_mulai: '08:45:00', jam_selesai: '09:20:00' },
      { slot: 4, jam_mulai: '09:20:00', jam_selesai: '09:55:00' },
      { slot: 'ISTIRAHAT', jam_mulai: '09:55:00', jam_selesai: '10:30:00', isBreak: true },
      { slot: 5, jam_mulai: '10:30:00', jam_selesai: '11:05:00' },
      { slot: 6, jam_mulai: '11:05:00', jam_selesai: '11:40:00' }
    ];

    // Days
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    // Build grid data structure
    const gridData = kelasList.map(kelas => {
      const kelasJadwal = jadwalList.filter(j => j.kelas_id === kelas.id);

      const schedule = {};
      days.forEach(day => {
        schedule[day] = timeSlots.map(timeSlot => {
          if (timeSlot.isBreak) {
            return {
              slot: timeSlot.slot,
              jam_mulai: timeSlot.jam_mulai,
              jam_selesai: timeSlot.jam_selesai,
              isBreak: true,
              label: 'ISTIRAHAT'
            };
          }

          const jadwal = kelasJadwal.find(j =>
            j.hari === day &&
            j.jam_mulai === timeSlot.jam_mulai
          );

          if (jadwal) {
            // Assign color based on mata_pelajaran_id
            const warna = jadwal.mataPelajaran
              ? COLOR_PALETTE[jadwal.mataPelajaran.id % COLOR_PALETTE.length]
              : '#3B82F6';

            return {
              id: jadwal.id,
              slot: timeSlot.slot,
              jam_mulai: jadwal.jam_mulai,
              jam_selesai: jadwal.jam_selesai,
              mata_pelajaran: jadwal.mataPelajaran ? {
                id: jadwal.mataPelajaran.id,
                nama: jadwal.mataPelajaran.nama_mapel,
                kode: jadwal.mataPelajaran.kode_mapel,
                warna: warna
              } : null,
              guru: jadwal.guru ? {
                id: jadwal.guru.id,
                nama: jadwal.guru.nama_lengkap,
                nip: jadwal.guru.nip,
                foto: jadwal.guru.foto
              } : null,
              ruangan: jadwal.ruangan
            };
          }

          return {
            slot: timeSlot.slot,
            jam_mulai: timeSlot.jam_mulai,
            jam_selesai: timeSlot.jam_selesai,
            isEmpty: true
          };
        });
      });

      return {
        kelas: {
          id: kelas.id,
          nama: kelas.nama_kelas,
          tingkat: kelas.tingkat
        },
        schedule
      };
    });

    res.json({
      success: true,
      data: {
        timeSlots,
        days,
        gridData
      }
    });

  } catch (error) {
    console.error('Error getting jadwal grid:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data jadwal grid',
      error: error.message
    });
  }
};

// Add jadwal to specific slot
exports.addJadwalToSlot = async (req, res) => {
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

    // Validate required fields
    if (!kelas_id || !mata_pelajaran_id || !guru_id || !hari || !jam_mulai || !jam_selesai) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak lengkap'
      });
    }

    // Check if slot is already occupied
    const existing = await db.JadwalPelajaran.findOne({
      where: {
        kelas_id,
        hari,
        jam_mulai
      }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Slot jadwal sudah terisi'
      });
    }

    // Check if guru is available at this time
    const guruConflict = await db.JadwalPelajaran.findOne({
      where: {
        guru_id,
        hari,
        jam_mulai
      }
    });

    if (guruConflict) {
      return res.status(400).json({
        success: false,
        message: 'Guru sudah mengajar di kelas lain pada waktu yang sama'
      });
    }

    // Create jadwal
    const newJadwal = await db.JadwalPelajaran.create({
      kelas_id,
      mata_pelajaran_id,
      guru_id,
      hari,
      jam_mulai,
      jam_selesai,
      ruangan
    });

    // Fetch complete data
    const jadwal = await db.JadwalPelajaran.findByPk(newJadwal.id, {
      include: [
        {
          model: db.MataPelajaran,
          as: 'mataPelajaran',
          attributes: ['id', 'nama_mapel', 'kode_mapel']
        },
        {
          model: db.Guru,
          as: 'guru',
          attributes: ['id', 'nama_lengkap', 'nip', 'foto']
        },
        {
          model: db.Kelas,
          as: 'kelas',
          attributes: ['id', 'nama_kelas', 'tingkat']
        }
      ]
    });

    // Add color to response
    if (jadwal.mataPelajaran) {
      jadwal.mataPelajaran.dataValues.warna = COLOR_PALETTE[jadwal.mataPelajaran.id % COLOR_PALETTE.length];
    }

    res.status(201).json({
      success: true,
      message: 'Jadwal berhasil ditambahkan',
      data: jadwal
    });

  } catch (error) {
    console.error('Error adding jadwal:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan jadwal',
      error: error.message
    });
  }
};

// Update jadwal in slot
exports.updateJadwalSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      mata_pelajaran_id,
      guru_id,
      ruangan
    } = req.body;

    const jadwal = await db.JadwalPelajaran.findByPk(id);

    if (!jadwal) {
      return res.status(404).json({
        success: false,
        message: 'Jadwal tidak ditemukan'
      });
    }

    // Check if guru is available if changing guru
    if (guru_id && guru_id !== jadwal.guru_id) {
      const guruConflict = await db.JadwalPelajaran.findOne({
        where: {
          guru_id,
          hari: jadwal.hari,
          jam_mulai: jadwal.jam_mulai,
          id: { [Op.ne]: id }
        }
      });

      if (guruConflict) {
        return res.status(400).json({
          success: false,
          message: 'Guru sudah mengajar di kelas lain pada waktu yang sama'
        });
      }
    }

    // Update
    await jadwal.update({
      mata_pelajaran_id: mata_pelajaran_id || jadwal.mata_pelajaran_id,
      guru_id: guru_id || jadwal.guru_id,
      ruangan: ruangan !== undefined ? ruangan : jadwal.ruangan
    });

    // Fetch updated data
    const updatedJadwal = await db.JadwalPelajaran.findByPk(id, {
      include: [
        {
          model: db.MataPelajaran,
          as: 'mataPelajaran',
          attributes: ['id', 'nama_mapel', 'kode_mapel']
        },
        {
          model: db.Guru,
          as: 'guru',
          attributes: ['id', 'nama_lengkap', 'nip', 'foto']
        },
        {
          model: db.Kelas,
          as: 'kelas',
          attributes: ['id', 'nama_kelas', 'tingkat']
        }
      ]
    });

    // Add color to response
    if (updatedJadwal.mataPelajaran) {
      updatedJadwal.mataPelajaran.dataValues.warna = COLOR_PALETTE[updatedJadwal.mataPelajaran.id % COLOR_PALETTE.length];
    }

    res.json({
      success: true,
      message: 'Jadwal berhasil diupdate',
      data: updatedJadwal
    });

  } catch (error) {
    console.error('Error updating jadwal:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate jadwal',
      error: error.message
    });
  }
};

// Delete jadwal from slot
exports.deleteJadwalSlot = async (req, res) => {
  try {
    const { id } = req.params;

    const jadwal = await db.JadwalPelajaran.findByPk(id);

    if (!jadwal) {
      return res.status(404).json({
        success: false,
        message: 'Jadwal tidak ditemukan'
      });
    }

    await jadwal.destroy();

    res.json({
      success: true,
      message: 'Jadwal berhasil dihapus'
    });

  } catch (error) {
    console.error('Error deleting jadwal:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus jadwal',
      error: error.message
    });
  }
};
