import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Bell } from 'lucide-react';
import Layout from '../shared/Layout';
import Header from '../shared/Header';
import { guruAPI } from '../../services/api';

const InformasiKelas = () => {
  const [informasi, setInformasi] = useState([]);
  const [kelasWali, setKelasWali] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    kelas_id: '',
    judul: '',
    konten: ''
  });

  useEffect(() => {
    loadInformasiKelas();
  }, []);

  const loadInformasiKelas = async () => {
    try {
      const response = await guruAPI.getInformasiKelas();
      if (response.success) {
        setInformasi(response.data || []);
        setKelasWali(response.kelas_wali || []);
      }
    } catch (error) {
      console.error('Error loading informasi kelas:', error);
      alert('Gagal memuat informasi kelas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.kelas_id || !formData.judul || !formData.konten) {
      alert('Kelas, judul, dan konten harus diisi');
      return;
    }

    try {
      if (editingId) {
        await guruAPI.updateInformasiKelas(editingId, {
          judul: formData.judul,
          konten: formData.konten
        });
        alert('Informasi berhasil diperbarui');
      } else {
        await guruAPI.createInformasiKelas(formData);
        alert('Informasi berhasil ditambahkan');
      }

      resetForm();
      loadInformasiKelas();
    } catch (error) {
      console.error('Error saving informasi:', error);
      alert(error.response?.data?.message || 'Gagal menyimpan informasi');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      kelas_id: item.kelas_id,
      judul: item.judul,
      konten: item.konten
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus informasi ini?')) return;

    try {
      await guruAPI.deleteInformasiKelas(id);
      alert('Informasi berhasil dihapus');
      loadInformasiKelas();
    } catch (error) {
      console.error('Error deleting informasi:', error);
      alert(error.response?.data?.message || 'Gagal menghapus informasi');
    }
  };

  const resetForm = () => {
    setFormData({
      kelas_id: '',
      judul: '',
      konten: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  // Check if guru is wali kelas
  if (kelasWali.length === 0) {
    return (
      <Layout>
        <div className="space-y-6">
          <Header title="Informasi Kelas" subtitle="Kelola informasi untuk kelas yang Anda ampu sebagai wali kelas" />

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Anda Belum Menjadi Wali Kelas
            </h3>
            <p className="text-gray-500">
              Fitur informasi kelas hanya tersedia untuk guru yang menjadi wali kelas.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <Header title="Informasi Kelas" subtitle="Kelola informasi untuk kelas yang Anda ampu sebagai wali kelas" />

        {/* Actions */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Tambah Informasi
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {editingId ? 'Edit Informasi' : 'Tambah Informasi'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kelas <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.kelas_id}
                    onChange={(e) => setFormData({ ...formData, kelas_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                    disabled={editingId} // Cannot change class when editing
                  >
                    <option value="">Pilih Kelas</option>
                    {kelasWali.map((kelas) => (
                      <option key={kelas.id} value={kelas.id}>
                        {kelas.nama_kelas} - Tingkat {kelas.tingkat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Judul <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.judul}
                    onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Judul informasi"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Konten <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.konten}
                    onChange={(e) => setFormData({ ...formData, konten: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    rows={6}
                    placeholder="Isi informasi/pengumuman untuk kelas..."
                    required
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
                    {editingId ? 'Update' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Informasi List */}
        <div className="grid grid-cols-1 gap-4">
          {informasi.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Belum ada informasi untuk kelas Anda</p>
              <p className="text-sm text-gray-500 mt-1">Klik "Tambah Informasi" untuk membuat informasi baru</p>
            </div>
          ) : (
            informasi.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bell className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{item.judul}</h3>
                      <p className="text-sm text-gray-500">
                        {item.kelas?.nama_kelas} - {formatDate(item.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="text-gray-700 whitespace-pre-wrap pl-13">
                  {item.konten}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default InformasiKelas;
