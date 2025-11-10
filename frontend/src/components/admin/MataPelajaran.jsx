import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, BookOpen, Search } from 'lucide-react';
import Layout from '../shared/Layout';
import Header from '../shared/Header';
import { adminAPI } from '../../services/api';

const MataPelajaran = () => {
  const [mataPelajaran, setMataPelajaran] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [tingkatFilter, setTingkatFilter] = useState('');

  const [formData, setFormData] = useState({
    kode_mapel: '',
    nama_mapel: '',
    tingkat: '',
    deskripsi: ''
  });

  useEffect(() => {
    loadMataPelajaran();
  }, [tingkatFilter]);

  const loadMataPelajaran = async () => {
    try {
      const params = {
        sort: 'nama_mapel',
        order: 'ASC'
      };
      if (tingkatFilter) params.tingkat = tingkatFilter;

      const response = await adminAPI.getMataPelajaran(params);
      if (response.success) {
        setMataPelajaran(response.data);
      }
    } catch (error) {
      console.error('Error loading mata pelajaran:', error);
      alert('Gagal memuat data mata pelajaran');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.kode_mapel || !formData.nama_mapel) {
      alert('Kode dan nama mata pelajaran wajib diisi');
      return;
    }

    try {
      if (editingId) {
        await adminAPI.updateMataPelajaran(editingId, formData);
        alert('Mata pelajaran berhasil diperbarui');
      } else {
        await adminAPI.createMataPelajaran(formData);
        alert('Mata pelajaran berhasil ditambahkan');
      }

      resetForm();
      loadMataPelajaran();
    } catch (error) {
      console.error('Error saving mata pelajaran:', error);
      alert(error.response?.data?.message || 'Gagal menyimpan data mata pelajaran');
    }
  };

  const handleEdit = (mapel) => {
    setEditingId(mapel.id);
    setFormData({
      kode_mapel: mapel.kode_mapel,
      nama_mapel: mapel.nama_mapel,
      tingkat: mapel.tingkat || '',
      deskripsi: mapel.deskripsi || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus mata pelajaran ini?')) return;

    try {
      await adminAPI.deleteMataPelajaran(id);
      alert('Mata pelajaran berhasil dihapus');
      loadMataPelajaran();
    } catch (error) {
      console.error('Error deleting mata pelajaran:', error);
      alert(error.response?.data?.message || 'Gagal menghapus mata pelajaran');
    }
  };

  const resetForm = () => {
    setFormData({
      kode_mapel: '',
      nama_mapel: '',
      tingkat: '',
      deskripsi: ''
    });
    setEditingId(null);
    setShowForm(false);
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
        <Header title="Mata Pelajaran" subtitle="Kelola data mata pelajaran madrasah" />

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
                <option value="0">Umum (Semua Kelas)</option>
                {[1, 2, 3, 4, 5, 6].map((tingkat) => (
                  <option key={tingkat} value={tingkat}>
                    Kelas {tingkat}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Tambah Mata Pelajaran
            </button>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {editingId ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kode Mata Pelajaran <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.kode_mapel}
                    onChange={(e) => setFormData({ ...formData, kode_mapel: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Misal: MTK, IPA, BHS-IND"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Mata Pelajaran <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nama_mapel}
                    onChange={(e) => setFormData({ ...formData, nama_mapel: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Misal: Matematika"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tingkat
                  </label>
                  <select
                    value={formData.tingkat}
                    onChange={(e) => setFormData({ ...formData, tingkat: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="0">Umum (Semua Kelas)</option>
                    {[1, 2, 3, 4, 5, 6].map((tingkat) => (
                      <option key={tingkat} value={tingkat}>
                        Kelas {tingkat}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Pilih tingkat kelas atau umum jika untuk semua kelas
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Deskripsi singkat mata pelajaran"
                  />
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

        {/* Mata Pelajaran Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mataPelajaran.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-100">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada data mata pelajaran</p>
            </div>
          ) : (
            mataPelajaran.map((mapel) => (
              <div
                key={mapel.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm font-mono bg-emerald-50 text-emerald-700 px-2 py-1 rounded">
                        {mapel.kode_mapel}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">{mapel.nama_mapel}</h3>
                    <p className="text-sm text-gray-600">
                      {mapel.tingkat === 0 ? 'Umum (Semua Kelas)' : `Kelas ${mapel.tingkat}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(mapel)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(mapel.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {mapel.deskripsi && (
                  <div className="text-sm text-gray-600 border-t pt-3 mt-3">
                    {mapel.deskripsi}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MataPelajaran;
