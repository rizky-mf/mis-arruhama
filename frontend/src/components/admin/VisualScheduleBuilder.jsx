import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { adminAPI } from '../../services/api';
import { useToast } from '../ui/Toast';
import { Table } from 'lucide-react';

/**
 * Visual Schedule Builder Component
 * Displays schedule in visual grid format with colors and teacher photos
 */
const VisualScheduleBuilder = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  // State
  const [loading, setLoading] = useState(false);
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState(null);
  const [scheduleData, setScheduleData] = useState({});
  const [mataPelajaranList, setMataPelajaranList] = useState([]);
  const [guruList, setGuruList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const [formData, setFormData] = useState({
    mata_pelajaran_id: '',
    guru_id: '',
    ruangan: ''
  });

  // Constants
  const DAYS = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'MINGGU'];

  const TIME_SLOTS = [
    { slot: 1, jam_mulai: '07:00', jam_selesai: '07:35', label: 'UPACARA' },
    { slot: 2, jam_mulai: '07:35', jam_selesai: '08:10' },
    { slot: 3, jam_mulai: '08:10', jam_selesai: '08:45' },
    { slot: 4, jam_mulai: '08:45', jam_selesai: '09:20' },
    { slot: 'ISTIRAHAT', jam_mulai: '09:20', jam_selesai: '09:55', label: 'ISTIRAHAT', isBreak: true },
    { slot: 5, jam_mulai: '09:55', jam_selesai: '10:30' },
    { slot: 6, jam_mulai: '10:30', jam_selesai: '11:05' }
  ];

  const COLOR_PALETTE = [
    '#93C5FD', // blue-300
    '#FDE68A', // yellow-200
    '#DDD6FE', // violet-200
    '#6EE7B7', // emerald-300
    '#FECACA', // red-200
    '#FED7AA', // orange-200
    '#A7F3D0', // emerald-200
    '#BFDBFE', // blue-200
    '#C7D2FE', // indigo-200
    '#FBCFE8', // pink-200
    '#E9D5FF', // purple-200
    '#D1FAE5'  // green-100
  ];

  // Load initial data
  useEffect(() => {
    loadKelas();
    loadMataPelajaran();
    loadGuru();
  }, []);

  // Load schedule when kelas selected
  useEffect(() => {
    if (selectedKelas) {
      loadSchedule();
    }
  }, [selectedKelas]);

  const loadKelas = async () => {
    try {
      const response = await adminAPI.getKelas({ limit: 100 });
      setKelasList(response.data.kelas || []);
    } catch (error) {
      showToast('error', 'Gagal memuat data kelas');
    }
  };

  const loadMataPelajaran = async () => {
    try {
      const response = await adminAPI.getMataPelajaran({ limit: 100 });
      setMataPelajaranList(response.data.mata_pelajaran || []);
    } catch (error) {
      showToast('error', 'Gagal memuat mata pelajaran');
    }
  };

  const loadGuru = async () => {
    try {
      const response = await adminAPI.getGuru({ limit: 100 });
      setGuruList(response.data.guru || []);
    } catch (error) {
      showToast('error', 'Gagal memuat data guru');
    }
  };

  const loadSchedule = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getJadwalPelajaran({ kelas_id: selectedKelas.id, limit: 100 });

      // Group by day and time slot
      const grouped = {};
      DAYS.forEach(day => {
        grouped[day] = {};
      });

      response.data.jadwal_pelajaran?.forEach(jadwal => {
        const day = jadwal.hari.toUpperCase();
        const slotKey = `${jadwal.jam_mulai}-${jadwal.jam_selesai}`;

        if (!grouped[day]) grouped[day] = {};
        grouped[day][slotKey] = jadwal;
      });

      setScheduleData(grouped);
    } catch (error) {
      showToast('error', 'Gagal memuat jadwal');
    } finally {
      setLoading(false);
    }
  };

  const getColor = (mataPelajaranId) => {
    return COLOR_PALETTE[mataPelajaranId % COLOR_PALETTE.length];
  };

  const handleCellClick = (day, timeSlot) => {
    if (timeSlot.isBreak) return;
    if (!selectedKelas) {
      showToast('warning', 'Pilih kelas terlebih dahulu');
      return;
    }

    const slotKey = `${timeSlot.jam_mulai}-${timeSlot.jam_selesai}`;
    const existingJadwal = scheduleData[day]?.[slotKey];

    setSelectedCell({ day, timeSlot, existingJadwal });

    if (existingJadwal) {
      setFormData({
        mata_pelajaran_id: existingJadwal.mata_pelajaran_id,
        guru_id: existingJadwal.guru_id,
        ruangan: existingJadwal.ruangan || ''
      });
    } else {
      setFormData({
        mata_pelajaran_id: '',
        guru_id: '',
        ruangan: ''
      });
    }

    setShowModal(true);
  };

  const handleSaveSchedule = async () => {
    if (!formData.mata_pelajaran_id || !formData.guru_id) {
      showToast('warning', 'Mata pelajaran dan guru wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        kelas_id: selectedKelas.id,
        mata_pelajaran_id: parseInt(formData.mata_pelajaran_id),
        guru_id: parseInt(formData.guru_id),
        hari: selectedCell.day.charAt(0) + selectedCell.day.slice(1).toLowerCase(),
        jam_mulai: selectedCell.timeSlot.jam_mulai,
        jam_selesai: selectedCell.timeSlot.jam_selesai,
        ruangan: formData.ruangan || null
      };

      if (selectedCell.existingJadwal) {
        // Update
        await adminAPI.updateJadwalPelajaran(selectedCell.existingJadwal.id, payload);
        showToast('success', 'Jadwal berhasil diupdate');
      } else {
        // Create
        await adminAPI.createJadwalPelajaran(payload);
        showToast('success', 'Jadwal berhasil ditambahkan');
      }

      setShowModal(false);
      loadSchedule();
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Gagal menyimpan jadwal');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async () => {
    if (!selectedCell.existingJadwal) return;

    if (!confirm('Hapus jadwal ini?')) return;

    setLoading(true);
    try {
      await adminAPI.deleteJadwalPelajaran(selectedCell.existingJadwal.id);
      showToast('success', 'Jadwal berhasil dihapus');
      setShowModal(false);
      loadSchedule();
    } catch (error) {
      showToast('error', 'Gagal menghapus jadwal');
    } finally {
      setLoading(false);
    }
  };

  const renderCell = (day, timeSlot) => {
    if (timeSlot.isBreak) {
      return (
        <div className="bg-gray-100 border-2 border-gray-300 p-2 h-24 flex items-center justify-center">
          <span className="font-semibold text-gray-600">{timeSlot.label}</span>
        </div>
      );
    }

    const slotKey = `${timeSlot.jam_mulai}-${timeSlot.jam_selesai}`;
    const jadwal = scheduleData[day]?.[slotKey];

    if (!jadwal) {
      return (
        <div
          onClick={() => handleCellClick(day, timeSlot)}
          className="bg-white border-2 border-gray-200 p-2 h-24 cursor-pointer hover:bg-gray-50 hover:border-emerald-400 transition-all"
        >
          <div className="text-xs text-gray-400 text-center pt-6">
            Klik untuk tambah
          </div>
        </div>
      );
    }

    const mataPelajaran = mataPelajaranList.find(m => m.id === jadwal.mata_pelajaran_id);
    const guru = guruList.find(g => g.id === jadwal.guru_id);
    const bgColor = getColor(jadwal.mata_pelajaran_id);

    return (
      <div
        onClick={() => handleCellClick(day, timeSlot)}
        className="border-2 border-gray-300 p-2 h-24 cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-2"
        style={{ backgroundColor: bgColor }}
      >
        <div className="flex-1">
          <div className="font-semibold text-xs text-gray-800 uppercase leading-tight">
            {mataPelajaran?.nama_mapel || 'Unknown'}
          </div>
          {jadwal.ruangan && (
            <div className="text-xs text-gray-600 mt-1">
              Ruang: {jadwal.ruangan}
            </div>
          )}
        </div>

        {guru?.foto && (
          <div className="w-12 h-12 flex-shrink-0">
            <img
              src={guru.foto}
              alt={guru.nama_lengkap}
              className="w-full h-full object-cover rounded border-2 border-white shadow"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/50?text=No+Photo';
              }}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">
              📅 Jadwal Pelajaran - Visual Builder
            </h1>
            <button
              onClick={() => navigate('/admin/jadwal')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
            >
              <Table className="w-5 h-5" />
              <span className="font-medium">Mode Tabel</span>
            </button>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Kelas
              </label>
              <select
                value={selectedKelas?.id || ''}
                onChange={(e) => {
                  const kelas = kelasList.find(k => k.id === parseInt(e.target.value));
                  setSelectedKelas(kelas);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">-- Pilih Kelas --</option>
                {kelasList.map(kelas => (
                  <option key={kelas.id} value={kelas.id}>
                    {kelas.nama_kelas} - Tingkat {kelas.tingkat} ({kelas.tahun_ajaran})
                  </option>
                ))}
              </select>
            </div>

            {selectedKelas && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2">
                <div className="text-sm text-emerald-800">
                  <span className="font-semibold">Kelas Terpilih:</span> {selectedKelas.nama_kelas}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Schedule Grid */}
        {selectedKelas ? (
          <div className="bg-white rounded-lg shadow-md p-6 overflow-x-auto">
            <div className="min-w-[1400px]">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="bg-gray-200 border-2 border-gray-300 p-2 w-32 text-sm font-bold">
                      WAKTU
                    </th>
                    {DAYS.map(day => (
                      <th
                        key={day}
                        className="bg-gray-200 border-2 border-gray-300 p-2 text-sm font-bold"
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map((timeSlot, index) => (
                    <tr key={index}>
                      <td className="bg-gray-100 border-2 border-gray-300 p-2 text-center">
                        <div className="font-semibold text-xs">
                          {timeSlot.slot === 'ISTIRAHAT' ? 'ISTIRAHAT' : timeSlot.slot}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {timeSlot.jam_mulai} - {timeSlot.jam_selesai}
                        </div>
                      </td>
                      {DAYS.map(day => (
                        <td key={day} className="p-0">
                          {renderCell(day, timeSlot)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-3">Keterangan:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {mataPelajaranList.slice(0, 12).map(mapel => (
                  <div key={mapel.id} className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded border-2 border-gray-300"
                      style={{ backgroundColor: getColor(mapel.id) }}
                    />
                    <span className="text-sm text-gray-700">{mapel.nama_mapel}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 text-lg">
              👆 Pilih kelas terlebih dahulu untuk menampilkan jadwal
            </div>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {selectedCell.existingJadwal ? 'Edit Jadwal' : 'Tambah Jadwal'}
            </h3>

            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">
                <strong>Hari:</strong> {selectedCell.day}
              </div>
              <div className="text-sm text-gray-600">
                <strong>Waktu:</strong> {selectedCell.timeSlot.jam_mulai} - {selectedCell.timeSlot.jam_selesai}
              </div>
            </div>

            <div className="space-y-4">
              {/* Mata Pelajaran */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mata Pelajaran <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.mata_pelajaran_id}
                  onChange={(e) => setFormData({ ...formData, mata_pelajaran_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Pilih Mata Pelajaran --</option>
                  {mataPelajaranList.map(mapel => (
                    <option key={mapel.id} value={mapel.id}>
                      {mapel.nama_mapel}
                    </option>
                  ))}
                </select>
              </div>

              {/* Guru */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guru <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.guru_id}
                  onChange={(e) => setFormData({ ...formData, guru_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Pilih Guru --</option>
                  {guruList.map(guru => (
                    <option key={guru.id} value={guru.id}>
                      {guru.nama_lengkap} ({guru.nip})
                    </option>
                  ))}
                </select>
              </div>

              {/* Ruangan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ruangan (Opsional)
                </label>
                <input
                  type="text"
                  value={formData.ruangan}
                  onChange={(e) => setFormData({ ...formData, ruangan: e.target.value })}
                  placeholder="Contoh: Ruang 1A"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between mt-6">
              <div>
                {selectedCell.existingJadwal && (
                  <button
                    onClick={handleDeleteSchedule}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Menghapus...' : 'Hapus'}
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveSchedule}
                  disabled={loading}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-700">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualScheduleBuilder;
