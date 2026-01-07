// components/admin/JadwalPelajaranSimple.jsx
import { useState, useEffect } from 'react';
import { Trash2, Save } from 'lucide-react';
import Layout from '../shared/Layout';
import Header from '../shared/Header';
import { adminAPI } from '../../services/api';

const JadwalPelajaranSimple = () => {
  const [selectedKelas, setSelectedKelas] = useState('');
  const [tingkatFilter, setTingkatFilter] = useState('');
  const [kelasList, setKelasList] = useState([]);
  const [mataPelajaranList, setMataPelajaranList] = useState([]);
  const [guruList, setGuruList] = useState([]);
  const [jadwalData, setJadwalData] = useState({});
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedMapel, setSelectedMapel] = useState(null);
  const [modalData, setModalData] = useState({
    hari: '',
    jam_mulai: '',
    jam_selesai: '',
    ruangan: ''
  });

  useEffect(() => {
    loadKelas();
    loadMataPelajaran();
    loadGuru();
  }, []);

  useEffect(() => {
    if (selectedKelas) {
      loadJadwalKelas();
    }
  }, [selectedKelas]);

  const loadKelas = async () => {
    try {
      const response = await adminAPI.getKelas();
      const data = response.success ? response.data : response;
      setKelasList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading kelas:', error);
      setKelasList([]);
    }
  };

  const loadMataPelajaran = async () => {
    try {
      const response = await adminAPI.getMataPelajaran();
      const data = response.success ? response.data : response;
      setMataPelajaranList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading mata pelajaran:', error);
      setMataPelajaranList([]);
    }
  };

  const loadGuru = async () => {
    try {
      const response = await adminAPI.getGuru();
      const data = response.success ? response.data : response;
      setGuruList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading guru:', error);
      setGuruList([]);
    }
  };

  const loadJadwalKelas = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getJadwalPelajaran({ kelas_id: selectedKelas });

      // Convert array to object keyed by mata_pelajaran_id
      const jadwalMap = {};
      if (response.success && response.data) {
        response.data.forEach(j => {
          jadwalMap[j.mata_pelajaran_id] = {
            id: j.id,
            guru_id: j.guru_id,
            hari: j.hari,
            jam_mulai: j.jam_mulai,
            jam_selesai: j.jam_selesai,
            ruangan: j.ruangan
          };
        });
      }
      setJadwalData(jadwalMap);
    } catch (error) {
      console.error('Error loading jadwal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJadwalChange = (mapelId, field, value) => {
    setJadwalData(prev => ({
      ...prev,
      [mapelId]: {
        ...prev[mapelId],
        [field]: value
      }
    }));
  };

  const handleOpenModal = (mapelId) => {
    const jadwal = jadwalData[mapelId];
    if (!jadwal || !jadwal.guru_id) {
      alert('Pilih guru terlebih dahulu');
      return;
    }

    setSelectedMapel(mapelId);
    setModalData({
      hari: jadwal.hari || '',
      jam_mulai: jadwal.jam_mulai || '',
      jam_selesai: jadwal.jam_selesai || '',
      ruangan: jadwal.ruangan || ''
    });
    setShowModal(true);
  };

  const handleSaveJadwal = async () => {
    if (!modalData.hari || !modalData.jam_mulai || !modalData.jam_selesai) {
      alert('Lengkapi semua field yang wajib diisi');
      return;
    }

    try {
      const jadwal = jadwalData[selectedMapel];
      const payload = {
        kelas_id: parseInt(selectedKelas),
        mata_pelajaran_id: selectedMapel,
        guru_id: jadwal.guru_id,
        hari: modalData.hari,
        jam_mulai: modalData.jam_mulai,
        jam_selesai: modalData.jam_selesai,
        ruangan: modalData.ruangan || ''
      };

      let response;
      if (jadwal.id) {
        response = await adminAPI.updateJadwalPelajaran(jadwal.id, payload);
      } else {
        response = await adminAPI.createJadwalPelajaran(payload);
      }

      if (response.success) {
        alert('Jadwal berhasil disimpan');
        setShowModal(false);
        setSelectedMapel(null);
        loadJadwalKelas();
      }
    } catch (error) {
      console.error('Error saving jadwal:', error);
      alert(error.response?.data?.message || 'Gagal menyimpan jadwal');
    }
  };

  const handleDeleteJadwal = async (jadwalId, mapelId) => {
    if (!confirm('Yakin ingin menghapus jadwal ini?')) return;

    try {
      const response = await adminAPI.deleteJadwalPelajaran(jadwalId);
      if (response.success) {
        alert('Jadwal berhasil dihapus');
        // Clear from state
        setJadwalData(prev => {
          const newData = { ...prev };
          delete newData[mapelId];
          return newData;
        });
      }
    } catch (error) {
      console.error('Error deleting jadwal:', error);
      alert('Gagal menghapus jadwal');
    }
  };

  const filteredKelas = tingkatFilter
    ? kelasList.filter(k => k.tingkat === parseInt(tingkatFilter))
    : kelasList;

  const filteredMapel = selectedKelas
    ? mataPelajaranList.filter(m => {
        const kelas = kelasList.find(k => k.id === parseInt(selectedKelas));
        return !m.tingkat || m.tingkat === 0 || m.tingkat === kelas?.tingkat;
      })
    : mataPelajaranList;

  return (
    <Layout>
      <Header title="Jadwal Pelajaran" subtitle="Kelola jadwal pelajaran per kelas" />

      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tingkat
            </label>
            <select
              value={tingkatFilter}
              onChange={(e) => {
                setTingkatFilter(e.target.value);
                setSelectedKelas('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Semua Tingkat</option>
              {[1, 2, 3, 4, 5, 6].map(t => (
                <option key={t} value={t}>Kelas {t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kelas <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Pilih Kelas</option>
              {filteredKelas.map(k => (
                <option key={k.id} value={k.id}>{k.nama_kelas}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        {selectedKelas ? (
          loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mata Pelajaran
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Induk
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kelompok
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jurusan
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      JTM
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guru
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMapel.map((mapel, index) => {
                    const jadwal = jadwalData[mapel.id] || {};
                    return (
                      <tr key={mapel.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {mapel.nama_mapel}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {mapel.kode_mapel || '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          -
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          UMUM
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          2
                        </td>
                        <td className="px-4 py-4">
                          <select
                            value={jadwal.guru_id || ''}
                            onChange={(e) => handleJadwalChange(mapel.id, 'guru_id', parseInt(e.target.value))}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                          >
                            <option value="">-Pilih Guru-</option>
                            {guruList.map(g => (
                              <option key={g.id} value={g.id}>{g.nama_lengkap}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {jadwal.id ? (
                            <button
                              onClick={() => handleDeleteJadwal(jadwal.id, mapel.id)}
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              Hapus Ajar
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenModal(mapel.id)}
                              disabled={!jadwal.guru_id}
                              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 text-xs flex items-center gap-1"
                            >
                              <Save className="w-3 h-3" />
                              Simpan
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="text-center py-12 text-gray-500">
            Pilih kelas terlebih dahulu untuk melihat jadwal pelajaran
          </div>
        )}
      </div>

      {/* Modal Input Jadwal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-t-lg">
              <h3 className="text-xl font-bold">Detail Jadwal Pelajaran</h3>
            </div>

            <div className="p-6 space-y-4">
              {/* Hari */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hari <span className="text-red-500">*</span>
                </label>
                <select
                  value={modalData.hari}
                  onChange={(e) => setModalData({ ...modalData, hari: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">Pilih Hari</option>
                  <option value="Senin">Senin</option>
                  <option value="Selasa">Selasa</option>
                  <option value="Rabu">Rabu</option>
                  <option value="Kamis">Kamis</option>
                  <option value="Jumat">Jumat</option>
                  <option value="Sabtu">Sabtu</option>
                </select>
              </div>

              {/* Jam Mulai */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jam Mulai <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={modalData.jam_mulai}
                  onChange={(e) => setModalData({ ...modalData, jam_mulai: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              {/* Jam Selesai */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jam Selesai <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={modalData.jam_selesai}
                  onChange={(e) => setModalData({ ...modalData, jam_selesai: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              {/* Ruangan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ruangan
                </label>
                <input
                  type="text"
                  value={modalData.ruangan}
                  onChange={(e) => setModalData({ ...modalData, ruangan: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Misal: R.101, Lab Komputer"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedMapel(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveJadwal}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default JadwalPelajaranSimple;
