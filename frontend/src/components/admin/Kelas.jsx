import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Users } from 'lucide-react';
import Layout from '../shared/Layout';
import Header from '../shared/Header';
import { adminAPI, settingsAPI } from '../../services/api';

const Kelas = () => {
  const [kelas, setKelas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [tingkatFilter, setTingkatFilter] = useState('');
  const [tahunAjaranAktif, setTahunAjaranAktif] = useState('');

  const [formData, setFormData] = useState({
    nama_kelas: '',
    tingkat: '',
    tahun_ajaran: '',
    guru_id: null
  });

  useEffect(() => {
    loadKelas();
    loadTahunAjaranAktif();
  }, [tingkatFilter]);

  const loadTahunAjaranAktif = async () => {
    try {
      const result = await settingsAPI.getAkademikAktif();
      if (result.success && result.data) {
        const tahunAjaran = result.data.tahun_ajaran_aktif || '2024/2025';
        setTahunAjaranAktif(tahunAjaran);
        // Set default tahun ajaran untuk form baru
        if (!editingId) {
          setFormData(prev => ({ ...prev, tahun_ajaran: tahunAjaran }));
        }
      }
    } catch (error) {
      console.error('Error loading tahun ajaran aktif:', error);
    }
  };

  const loadKelas = async () => {
    try {
      const params = {
        sort: 'nama_kelas',
        order: 'ASC'
      };
      if (tingkatFilter) params.tingkat = tingkatFilter;

      const response = await adminAPI.getKelas(params);
      if (response.success) {
        setKelas(response.data);
      }
    } catch (error) {
      console.error('Error loading kelas:', error);
      alert('Gagal memuat data kelas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.nama_kelas || !formData.tingkat || !formData.tahun_ajaran) {
      alert('Nama kelas, tingkat, dan tahun ajaran wajib diisi');
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        guru_id: formData.guru_id || null
      };

      if (editingId) {
        await adminAPI.updateKelas(editingId, dataToSend);
        alert('Kelas berhasil diperbarui');
      } else {
        await adminAPI.createKelas(dataToSend);
        alert('Kelas berhasil ditambahkan');
      }

      resetForm();
      loadKelas();
    } catch (error) {
      console.error('Error saving kelas:', error);
      alert(error.response?.data?.message || 'Gagal menyimpan data kelas');
    }
  };

  const handleEdit = (kelasItem) => {
    setEditingId(kelasItem.id);
    setFormData({
      nama_kelas: kelasItem.nama_kelas,
      tingkat: kelasItem.tingkat,
      tahun_ajaran: tahunAjaranAktif, // Always use active tahun ajaran, not from existing data
      guru_id: kelasItem.guru_id || null
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus kelas ini?')) return;

    try {
      await adminAPI.deleteKelas(id);
      alert('Kelas berhasil dihapus');
      loadKelas();
    } catch (error) {
      console.error('Error deleting kelas:', error);
      alert(error.response?.data?.message || 'Gagal menghapus kelas');
    }
  };

  const resetForm = () => {
    setFormData({
      nama_kelas: '',
      tingkat: '',
      tahun_ajaran: tahunAjaranAktif, // Use active tahun ajaran
      guru_id: null
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleTambahKelas = () => {
    setFormData({
      nama_kelas: '',
      tingkat: '',
      tahun_ajaran: tahunAjaranAktif, // Set to active tahun ajaran
      guru_id: null
    });
    setEditingId(null);
    setShowForm(true);
  };

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
        <Header title="Data Kelas" subtitle="Kelola data kelas madrasah" />

        {/* Filter and Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-3">
              {/* Tingkat Filter */}
              <select
                value={tingkatFilter}
                onChange={(e) => setTingkatFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Semua Tingkat</option>
                {[1, 2, 3, 4, 5, 6].map((tingkat) => (
                  <option key={tingkat} value={tingkat}>
                    Kelas {tingkat}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleTambahKelas}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Tambah Kelas
            </button>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {editingId ? 'Edit Kelas' : 'Tambah Kelas'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Kelas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nama_kelas}
                    onChange={(e) => setFormData({ ...formData, nama_kelas: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Misal: 1A, 2B, 3C"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tingkat <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.tingkat}
                    onChange={(e) => setFormData({ ...formData, tingkat: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Pilih Tingkat</option>
                    {[1, 2, 3, 4, 5, 6].map((tingkat) => (
                      <option key={tingkat} value={tingkat}>
                        Kelas {tingkat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tahun Ajaran <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.tahun_ajaran}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
                    placeholder="Otomatis dari pengaturan"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tahun ajaran otomatis diambil dari pengaturan sistem
                  </p>
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

        {/* Kelas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kelas.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-100">
              <p className="text-gray-500">Belum ada data kelas</p>
            </div>
          ) : (
            kelas.map((kelasItem) => (
              <div
                key={kelasItem.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{kelasItem.nama_kelas}</h3>
                    <p className="text-sm text-gray-600">Tingkat {kelasItem.tingkat}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(kelasItem)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(kelasItem.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{kelasItem.jumlah_siswa || 0} Siswa</span>
                  </div>
                  <div className="text-gray-600">
                    <span className="font-medium">Tahun Ajaran:</span> {kelasItem.tahun_ajaran}
                  </div>
                  {kelasItem.wali_kelas && (
                    <div className="text-gray-600">
                      <span className="font-medium">Wali Kelas:</span> {kelasItem.wali_kelas.nama_lengkap}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Kelas;
