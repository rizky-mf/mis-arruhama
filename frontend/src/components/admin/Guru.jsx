import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Eye, EyeOff, Key } from 'lucide-react';
import Layout from '../shared/Layout';
import Header from '../shared/Header';
import { adminAPI } from '../../services/api';

const Guru = () => {
  const [guru, setGuru] = useState([]);
  const [kelas, setKelas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState({});
  const [newCredentials, setNewCredentials] = useState(null);

  const [formData, setFormData] = useState({
    nip: '',
    nama_lengkap: '',
    jenis_kelamin: '',
    tanggal_lahir: '',
    alamat: '',
    telepon: '',
    email: '',
    username: '',
    password: '',
    kelas_id: ''
  });

  useEffect(() => {
    loadGuru();
    loadKelas();
  }, [searchTerm]);

  const loadGuru = async () => {
    try {
      const params = {
        sort: 'nama_lengkap',
        order: 'ASC'
      };
      if (searchTerm) params.search = searchTerm;

      const response = await adminAPI.getGuru(params);
      if (response.success) {
        setGuru(response.data);
      }
    } catch (error) {
      console.error('Error loading guru:', error);
      alert('Gagal memuat data guru');
    } finally {
      setLoading(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.nip || !formData.nama_lengkap || !formData.jenis_kelamin || !formData.email) {
      alert('NIP, nama lengkap, jenis kelamin, dan email wajib diisi');
      return;
    }

    if (!editingId && (!formData.username || !formData.password)) {
      alert('Username dan password wajib diisi untuk guru baru');
      return;
    }

    try {
      if (editingId) {
        // Update - don't send username/password
        const { username, password, ...updateData } = formData;
        await adminAPI.updateGuru(editingId, updateData);
        alert('Data guru berhasil diperbarui');
        setNewCredentials(null);
      } else {
        // Create - send all data
        const response = await adminAPI.createGuru(formData);

        // Show credentials dialog
        if (response.success && response.data.plain_password) {
          setNewCredentials({
            username: formData.username,
            password: response.data.plain_password
          });
        }

        alert('Data guru berhasil ditambahkan');
      }

      resetForm();
      loadGuru();
    } catch (error) {
      console.error('Error saving guru:', error);
      alert(error.response?.data?.message || 'Gagal menyimpan data guru');
    }
  };

  const handleEdit = (guruItem) => {
    setEditingId(guruItem.id);

    // Get kelas_id if guru is wali kelas
    const kelasId = guruItem.kelas_diampu && guruItem.kelas_diampu.length > 0
      ? guruItem.kelas_diampu[0].id
      : '';

    setFormData({
      nip: guruItem.nip,
      nama_lengkap: guruItem.nama_lengkap,
      jenis_kelamin: guruItem.jenis_kelamin,
      tanggal_lahir: guruItem.tanggal_lahir || '',
      alamat: guruItem.alamat || '',
      telepon: guruItem.telepon || '',
      email: guruItem.email || '',
      username: '',
      password: '',
      kelas_id: kelasId
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus data guru ini? Akun login guru juga akan dihapus.')) return;

    try {
      await adminAPI.deleteGuru(id);
      alert('Data guru berhasil dihapus');
      loadGuru();
    } catch (error) {
      console.error('Error deleting guru:', error);
      alert(error.response?.data?.message || 'Gagal menghapus data guru');
    }
  };

  const resetForm = () => {
    setFormData({
      nip: '',
      nama_lengkap: '',
      jenis_kelamin: '',
      tanggal_lahir: '',
      alamat: '',
      telepon: '',
      email: '',
      username: '',
      password: '',
      kelas_id: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const togglePasswordVisibility = (guruId) => {
    setShowPassword(prev => ({
      ...prev,
      [guruId]: !prev[guruId]
    }));
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
        <Header title="Data Guru" subtitle="Kelola data guru madrasah" />

        {/* Filter and Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-3 flex-1 max-w-md">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari nama atau NIP..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Tambah Guru
            </button>
          </div>
        </div>

        {/* Credentials Display Modal */}
        {newCredentials && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-emerald-600 mb-4">Akun Berhasil Dibuat!</h2>
              <p className="text-gray-600 mb-4">Simpan kredensial login berikut:</p>

              <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">Username:</label>
                  <p className="text-lg font-bold text-gray-800">{newCredentials.username}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Password:</label>
                  <p className="text-lg font-bold text-gray-800">{newCredentials.password}</p>
                </div>
              </div>

              <p className="text-sm text-red-600 mb-4">
                ⚠️ Catat password ini! Password tidak akan ditampilkan lagi.
              </p>

              <button
                onClick={() => setNewCredentials(null)}
                className="w-full px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full my-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {editingId ? 'Edit Data Guru' : 'Tambah Guru Baru'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      NIP <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.nip}
                      onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      disabled={editingId}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.nama_lengkap}
                      onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jenis Kelamin <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.jenis_kelamin}
                      onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Pilih</option>
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Lahir
                    </label>
                    <input
                      type="date"
                      value={formData.tanggal_lahir}
                      onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telepon
                    </label>
                    <input
                      type="tel"
                      value={formData.telepon}
                      onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat
                  </label>
                  <textarea
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {editingId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Wali Kelas
                    </label>
                    <select
                      value={formData.kelas_id}
                      onChange={(e) => setFormData({ ...formData, kelas_id: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Tidak menjadi wali kelas</option>
                      {kelas.map((kelasItem) => (
                        <option key={kelasItem.id} value={kelasItem.id}>
                          {kelasItem.nama_kelas}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Pilih kelas untuk menjadikan guru ini sebagai wali kelas
                    </p>
                  </div>
                )}

                {!editingId && (
                  <>
                    <div className="border-t pt-4 mt-4">
                      <h3 className="font-medium text-gray-800 mb-3">Akun Login</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Username <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

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

        {/* Guru Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NIP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Lengkap
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    JK
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telepon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wali Kelas
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {guru.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      Belum ada data guru
                    </td>
                  </tr>
                ) : (
                  guru.map((guruItem) => (
                    <tr key={guruItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {guruItem.nip}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {guruItem.nama_lengkap}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {guruItem.jenis_kelamin}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {guruItem.telepon || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                          {guruItem.user?.username}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {guruItem.kelas_diampu && guruItem.kelas_diampu.length > 0
                          ? guruItem.kelas_diampu[0].nama_kelas
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(guruItem)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(guruItem.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <p className="text-sm text-blue-800">
            <strong>Catatan:</strong> Username dan password hanya ditampilkan saat pertama kali membuat akun guru.
            Untuk mengubah password, gunakan fitur Reset Password.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Guru;
