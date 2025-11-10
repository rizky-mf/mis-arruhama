import { useState, useEffect } from 'react';
import { informasiAPI, adminAPI } from '../../services/api';
import { Plus, Edit2, Trash2, Calendar, Bell, X } from 'lucide-react';
import Layout from '../shared/Layout';
import Header from '../shared/Header';

function Informasi() {
  const [activeTab, setActiveTab] = useState('umum'); // 'umum' or 'kelas'

  // Informasi Umum State
  const [informasiUmum, setInformasiUmum] = useState([]);
  const [filterJenis, setFilterJenis] = useState('');

  // Informasi Kelas State
  const [informasiKelas, setInformasiKelas] = useState([]);
  const [filterKelas, setFilterKelas] = useState('');
  const [kelasList, setKelasList] = useState([]);
  const [guruList, setGuruList] = useState([]);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    judul: '',
    konten: '',
    jenis: 'pengumuman',
    tanggal_mulai: '',
    tanggal_selesai: '',
    kelas_id: '',
    guru_id: ''
  });

  useEffect(() => {
    loadKelasList();
    loadGuruList();
  }, []);

  useEffect(() => {
    if (activeTab === 'umum') {
      loadInformasiUmum();
    } else {
      loadInformasiKelas();
    }
  }, [activeTab, filterJenis, filterKelas]);

  const loadInformasiUmum = async () => {
    try {
      const params = {};
      if (filterJenis) params.jenis = filterJenis;
      const result = await informasiAPI.getInformasiUmum(params);
      setInformasiUmum(result.data || []);
    } catch (error) {
      console.error('Error loading informasi umum:', error);
      alert('Gagal memuat informasi umum');
    }
  };

  const loadInformasiKelas = async () => {
    try {
      const params = {};
      if (filterKelas) params.kelas_id = filterKelas;
      const result = await informasiAPI.getInformasiKelas(params);
      setInformasiKelas(result.data || []);
    } catch (error) {
      console.error('Error loading informasi kelas:', error);
      alert('Gagal memuat informasi kelas');
    }
  };

  const loadKelasList = async () => {
    try {
      const result = await adminAPI.getKelas();
      setKelasList(result.data || []);
    } catch (error) {
      console.error('Error loading kelas:', error);
    }
  };

  const loadGuruList = async () => {
    try {
      const result = await adminAPI.getGuru();
      setGuruList(result.data || []);
    } catch (error) {
      console.error('Error loading guru:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (activeTab === 'umum') {
        // Validate Informasi Umum
        if (!formData.judul || !formData.konten || !formData.jenis) {
          alert('Judul, konten, dan jenis wajib diisi');
          return;
        }

        const data = {
          judul: formData.judul,
          konten: formData.konten,
          jenis: formData.jenis,
          tanggal_mulai: formData.tanggal_mulai || null,
          tanggal_selesai: formData.tanggal_selesai || null
        };

        if (editingId) {
          await informasiAPI.updateInformasiUmum(editingId, data);
          alert('Informasi umum berhasil diperbarui');
        } else {
          await informasiAPI.createInformasiUmum(data);
          alert('Informasi umum berhasil ditambahkan');
        }
        loadInformasiUmum();
      } else {
        // Validate Informasi Kelas
        if (!formData.judul || !formData.konten || !formData.kelas_id || !formData.guru_id) {
          alert('Judul, konten, kelas, dan guru wajib diisi');
          return;
        }

        const data = {
          judul: formData.judul,
          konten: formData.konten,
          kelas_id: formData.kelas_id,
          guru_id: formData.guru_id
        };

        if (editingId) {
          await informasiAPI.updateInformasiKelas(editingId, data);
          alert('Informasi kelas berhasil diperbarui');
        } else {
          await informasiAPI.createInformasiKelas(data);
          alert('Informasi kelas berhasil ditambahkan');
        }
        loadInformasiKelas();
      }

      resetForm();
    } catch (error) {
      console.error('Error saving informasi:', error);
      alert(error.response?.data?.message || 'Gagal menyimpan informasi');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);

    if (activeTab === 'umum') {
      setFormData({
        judul: item.judul,
        konten: item.konten,
        jenis: item.jenis,
        tanggal_mulai: item.tanggal_mulai || '',
        tanggal_selesai: item.tanggal_selesai || '',
        kelas_id: '',
        guru_id: ''
      });
    } else {
      setFormData({
        judul: item.judul,
        konten: item.konten,
        jenis: 'pengumuman',
        tanggal_mulai: '',
        tanggal_selesai: '',
        kelas_id: item.kelas_id,
        guru_id: item.guru_id
      });
    }

    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus informasi ini?')) return;

    try {
      if (activeTab === 'umum') {
        await informasiAPI.deleteInformasiUmum(id);
        alert('Informasi umum berhasil dihapus');
        loadInformasiUmum();
      } else {
        await informasiAPI.deleteInformasiKelas(id);
        alert('Informasi kelas berhasil dihapus');
        loadInformasiKelas();
      }
    } catch (error) {
      console.error('Error deleting informasi:', error);
      alert(error.response?.data?.message || 'Gagal menghapus informasi');
    }
  };

  const resetForm = () => {
    setFormData({
      judul: '',
      konten: '',
      jenis: 'pengumuman',
      tanggal_mulai: '',
      tanggal_selesai: '',
      kelas_id: '',
      guru_id: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getJenisBadge = (jenis) => {
    const styles = {
      event: 'bg-blue-100 text-blue-800',
      libur: 'bg-green-100 text-green-800',
      pengumuman: 'bg-purple-100 text-purple-800',
    };
    const labels = {
      event: 'Event',
      libur: 'Libur',
      pengumuman: 'Pengumuman'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[jenis]}`}>
        {labels[jenis]}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <Header title="Informasi & Pengumuman" subtitle="Kelola informasi umum dan informasi khusus kelas" />

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => {
            setActiveTab('umum');
            resetForm();
          }}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'umum'
              ? 'text-emerald-600 border-b-2 border-emerald-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Informasi Umum
        </button>
        <button
          onClick={() => {
            setActiveTab('kelas');
            resetForm();
          }}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'kelas'
              ? 'text-emerald-600 border-b-2 border-emerald-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Informasi Kelas
        </button>
      </div>

      {/* Actions Bar */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          {activeTab === 'umum' ? (
            <select
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Semua Jenis</option>
              <option value="pengumuman">Pengumuman</option>
              <option value="event">Event</option>
              <option value="libur">Libur</option>
            </select>
          ) : (
            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Semua Kelas</option>
              {kelasList.map((kelas) => (
                <option key={kelas.id} value={kelas.id}>
                  {kelas.nama_kelas}
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
        >
          <Plus size={20} />
          Tambah Informasi
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? 'Edit' : 'Tambah'} {activeTab === 'umum' ? 'Informasi Umum' : 'Informasi Kelas'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Judul <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  rows="6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {activeTab === 'umum' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jenis <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.jenis}
                      onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    >
                      <option value="pengumuman">Pengumuman</option>
                      <option value="event">Event</option>
                      <option value="libur">Libur</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tanggal Mulai
                      </label>
                      <input
                        type="date"
                        value={formData.tanggal_mulai}
                        onChange={(e) => setFormData({ ...formData, tanggal_mulai: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tanggal Selesai
                      </label>
                      <input
                        type="date"
                        value={formData.tanggal_selesai}
                        onChange={(e) => setFormData({ ...formData, tanggal_selesai: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kelas <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.kelas_id}
                      onChange={(e) => setFormData({ ...formData, kelas_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    >
                      <option value="">Pilih Kelas</option>
                      {kelasList.map((kelas) => (
                        <option key={kelas.id} value={kelas.id}>
                          {kelas.nama_kelas}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Guru <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.guru_id}
                      onChange={(e) => setFormData({ ...formData, guru_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    >
                      <option value="">Pilih Guru</option>
                      {guruList.map((guru) => (
                        <option key={guru.id} value={guru.id}>
                          {guru.nama_lengkap} - {guru.nip}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  {editingId ? 'Perbarui' : 'Simpan'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Content */}
      {activeTab === 'umum' ? (
        <div className="space-y-4">
          {informasiUmum.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Bell size={48} className="mx-auto mb-4 text-gray-400" />
              <p>Belum ada informasi umum</p>
            </div>
          ) : (
            informasiUmum.map((info) => (
              <div
                key={info.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-800">{info.judul}</h3>
                      {getJenisBadge(info.jenis)}
                    </div>
                    <p className="text-gray-600 whitespace-pre-wrap">{info.konten}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(info)}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(info.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {(info.tanggal_mulai || info.tanggal_selesai) && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-4 pt-4 border-t border-gray-200">
                    <Calendar size={16} />
                    <span>
                      {formatDate(info.tanggal_mulai)}
                      {info.tanggal_selesai && ` - ${formatDate(info.tanggal_selesai)}`}
                    </span>
                  </div>
                )}

                <div className="text-xs text-gray-400 mt-2">
                  Dibuat oleh: {info.creator?.username || 'N/A'} • {formatDate(info.created_at)}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {informasiKelas.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Bell size={48} className="mx-auto mb-4 text-gray-400" />
              <p>Belum ada informasi kelas</p>
            </div>
          ) : (
            informasiKelas.map((info) => (
              <div
                key={info.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-800">{info.judul}</h3>
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-semibold">
                        {info.kelas?.nama_kelas || 'N/A'}
                      </span>
                    </div>
                    <p className="text-gray-600 whitespace-pre-wrap">{info.konten}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(info)}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(info.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-gray-400 mt-2">
                  Oleh: {info.guru?.nama_lengkap || 'N/A'} • {formatDate(info.created_at)}
                </div>
              </div>
            ))
          )}
        </div>
      )}
      </div>
    </Layout>
  );
}

export default Informasi;
