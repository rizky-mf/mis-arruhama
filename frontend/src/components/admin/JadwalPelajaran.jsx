import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, Clock, Users } from 'lucide-react';
import Layout from '../shared/Layout';
import Header from '../shared/Header';
import { adminAPI } from '../../services/api';

const HARI_OPTIONS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const JadwalPelajaran = () => {
  const [jadwal, setJadwal] = useState([]);
  const [kelas, setKelas] = useState([]);
  const [mataPelajaran, setMataPelajaran] = useState([]);
  const [guru, setGuru] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [kelasFilter, setKelasFilter] = useState('');
  const [hariFilter, setHariFilter] = useState('');

  const [formData, setFormData] = useState({
    kelas_id: '',
    mata_pelajaran_id: '',
    guru_id: '',
    hari: '',
    jam_mulai: '',
    jam_selesai: '',
    ruangan: ''
  });

  useEffect(() => {
    loadAllData();
  }, [kelasFilter, hariFilter]);

  const loadAllData = async () => {
    try {
      await Promise.all([
        loadJadwal(),
        loadKelas(),
        loadMataPelajaran(),
        loadGuru()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadJadwal = async () => {
    try {
      const params = {};
      if (kelasFilter) params.kelas_id = kelasFilter;
      if (hariFilter) params.hari = hariFilter;

      const response = await adminAPI.getJadwalPelajaran(params);
      if (response.success) {
        setJadwal(response.data);
      }
    } catch (error) {
      console.error('Error loading jadwal:', error);
    }
  };

  const loadKelas = async () => {
    try {
      const response = await adminAPI.getKelas();
      if (response.success) {
        setKelas(response.data);
      }
    } catch (error) {
      console.error('Error loading kelas:', error);
    }
  };

  const loadMataPelajaran = async () => {
    try {
      const response = await adminAPI.getMataPelajaran();
      if (response.success) {
        setMataPelajaran(response.data);
      }
    } catch (error) {
      console.error('Error loading mata pelajaran:', error);
    }
  };

  const loadGuru = async () => {
    try {
      const response = await adminAPI.getGuru();
      if (response.success) {
        setGuru(response.data);
      }
    } catch (error) {
      console.error('Error loading guru:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.kelas_id || !formData.mata_pelajaran_id || !formData.guru_id ||
        !formData.hari || !formData.jam_mulai || !formData.jam_selesai) {
      alert('Semua field wajib diisi kecuali ruangan');
      return;
    }

    try {
      if (editingId) {
        await adminAPI.updateJadwalPelajaran(editingId, formData);
        alert('Jadwal berhasil diperbarui');
      } else {
        await adminAPI.createJadwalPelajaran(formData);
        alert('Jadwal berhasil ditambahkan');
      }

      resetForm();
      loadJadwal();
    } catch (error) {
      console.error('Error saving jadwal:', error);
      alert(error.response?.data?.message || 'Gagal menyimpan jadwal');
    }
  };

  const handleEdit = (jadwalItem) => {
    setEditingId(jadwalItem.id);
    setFormData({
      kelas_id: jadwalItem.kelas_id,
      mata_pelajaran_id: jadwalItem.mata_pelajaran_id,
      guru_id: jadwalItem.guru_id,
      hari: jadwalItem.hari,
      jam_mulai: jadwalItem.jam_mulai,
      jam_selesai: jadwalItem.jam_selesai,
      ruangan: jadwalItem.ruangan || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus jadwal ini?')) return;

    try {
      await adminAPI.deleteJadwalPelajaran(id);
      alert('Jadwal berhasil dihapus');
      loadJadwal();
    } catch (error) {
      console.error('Error deleting jadwal:', error);
      alert(error.response?.data?.message || 'Gagal menghapus jadwal');
    }
  };

  const resetForm = () => {
    setFormData({
      kelas_id: '',
      mata_pelajaran_id: '',
      guru_id: '',
      hari: '',
      jam_mulai: '',
      jam_selesai: '',
      ruangan: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Group jadwal by hari
  const groupedJadwal = HARI_OPTIONS.reduce((acc, hari) => {
    acc[hari] = jadwal.filter(j => j.hari === hari);
    return acc;
  }, {});

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <Header title="Jadwal Pelajaran" subtitle="Kelola jadwal pelajaran per kelas" />

        {/* Filter and Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-3">
              {/* Kelas Filter */}
              <select
                value={kelasFilter}
                onChange={(e) => setKelasFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Semua Kelas</option>
                {kelas.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama_kelas}
                  </option>
                ))}
              </select>

              {/* Hari Filter */}
              <select
                value={hariFilter}
                onChange={(e) => setHariFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Semua Hari</option>
                {HARI_OPTIONS.map((hari) => (
                  <option key={hari} value={hari}>
                    {hari}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Tambah Jadwal
            </button>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full my-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {editingId ? 'Edit Jadwal' : 'Tambah Jadwal'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kelas <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.kelas_id}
                      onChange={(e) => setFormData({ ...formData, kelas_id: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    >
                      <option value="">Pilih Kelas</option>
                      {kelas.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.nama_kelas}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mata Pelajaran <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.mata_pelajaran_id}
                      onChange={(e) => setFormData({ ...formData, mata_pelajaran_id: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    >
                      <option value="">Pilih Mata Pelajaran</option>
                      {mataPelajaran.map((mapel) => (
                        <option key={mapel.id} value={mapel.id}>
                          {mapel.nama_mapel}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Guru Pengajar <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.guru_id}
                      onChange={(e) => setFormData({ ...formData, guru_id: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    >
                      <option value="">Pilih Guru</option>
                      {guru.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.nama_lengkap}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hari <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.hari}
                      onChange={(e) => setFormData({ ...formData, hari: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    >
                      <option value="">Pilih Hari</option>
                      {HARI_OPTIONS.map((hari) => (
                        <option key={hari} value={hari}>
                          {hari}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jam Mulai <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={formData.jam_mulai}
                      onChange={(e) => setFormData({ ...formData, jam_mulai: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jam Selesai <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={formData.jam_selesai}
                      onChange={(e) => setFormData({ ...formData, jam_selesai: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ruangan
                    </label>
                    <input
                      type="text"
                      value={formData.ruangan}
                      onChange={(e) => setFormData({ ...formData, ruangan: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Misal: R.101, Lab Komputer"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
                  >
                    {editingId ? 'Perbarui' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Jadwal Display - Grouped by Hari */}
        <div className="space-y-6">
          {HARI_OPTIONS.map((hari) => {
            const jadwalHari = groupedJadwal[hari];
            if (!hariFilter && jadwalHari.length === 0) return null;

            return (
              <div key={hari} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-emerald-600" />
                  {hari}
                </h3>

                {jadwalHari.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Tidak ada jadwal</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {jadwalHari.map((item) => (
                      <div
                        key={item.id}
                        className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-800">{item.mata_pelajaran?.nama_mapel}</h4>
                            <p className="text-sm text-gray-600">{item.kelas?.nama_kelas}</p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>{item.jam_mulai} - {item.jam_selesai}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Users className="w-4 h-4" />
                            <span>{item.guru?.nama_lengkap}</span>
                          </div>
                          {item.ruangan && (
                            <div className="text-gray-600">
                              <span className="font-medium">Ruangan:</span> {item.ruangan}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {jadwal.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada jadwal pelajaran</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default JadwalPelajaran;
