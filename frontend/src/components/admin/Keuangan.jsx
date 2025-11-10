import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, DollarSign, Check, X, Clock } from 'lucide-react';
import Layout from '../shared/Layout';
import Header from '../shared/Header';
import { keuanganAPI } from '../../services/api';

const Keuangan = () => {
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'transaksi'
  const [listPembayaran, setListPembayaran] = useState([]);
  const [pembayaran, setPembayaran] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const [formData, setFormData] = useState({
    nama_pembayaran: '',
    nominal: '',
    periode: '',
    tingkat: '0',
    deskripsi: '',
    status: 'aktif'
  });

  useEffect(() => {
    loadAllData();
  }, [statusFilter]);

  const loadAllData = async () => {
    try {
      await Promise.all([
        loadListPembayaran(),
        loadPembayaran()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadListPembayaran = async () => {
    try {
      const response = await keuanganAPI.getListPembayaran();
      if (response.success) {
        setListPembayaran(response.data);
      }
    } catch (error) {
      console.error('Error loading list pembayaran:', error);
    }
  };

  const loadPembayaran = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const response = await keuanganAPI.getPembayaran(params);
      if (response.success) {
        setPembayaran(response.data);
      }
    } catch (error) {
      console.error('Error loading pembayaran:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nama_pembayaran || !formData.nominal || !formData.periode) {
      alert('Nama pembayaran, nominal, dan periode wajib diisi');
      return;
    }

    try {
      if (editingId) {
        await keuanganAPI.updateListPembayaran(editingId, formData);
        alert('List pembayaran berhasil diperbarui');
      } else {
        await keuanganAPI.createListPembayaran(formData);
        alert('List pembayaran berhasil ditambahkan');
      }

      resetForm();
      loadListPembayaran();
    } catch (error) {
      console.error('Error saving list pembayaran:', error);
      alert(error.response?.data?.message || 'Gagal menyimpan list pembayaran');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      nama_pembayaran: item.nama_pembayaran,
      nominal: item.nominal,
      periode: item.periode,
      tingkat: item.tingkat || '0',
      deskripsi: item.deskripsi || '',
      status: item.status
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus list pembayaran ini?')) return;

    try {
      await keuanganAPI.deleteListPembayaran(id);
      alert('List pembayaran berhasil dihapus');
      loadListPembayaran();
    } catch (error) {
      console.error('Error deleting list pembayaran:', error);
      alert(error.response?.data?.message || 'Gagal menghapus list pembayaran');
    }
  };

  const handleApprove = async (id, status) => {
    const action = status === 'approved' ? 'menyetujui' : 'menolak';
    if (!window.confirm(`Yakin ingin ${action} pembayaran ini?`)) return;

    try {
      await keuanganAPI.approvePembayaran(id, status);
      alert(`Pembayaran berhasil di${status === 'approved' ? 'setujui' : 'tolak'}`);
      loadPembayaran();
    } catch (error) {
      console.error('Error approving pembayaran:', error);
      alert(error.response?.data?.message || 'Gagal memproses pembayaran');
    }
  };

  const handleDeletePembayaran = async (id) => {
    if (!window.confirm('Yakin ingin menghapus transaksi pembayaran ini?')) return;

    try {
      await keuanganAPI.deletePembayaran(id);
      alert('Transaksi berhasil dihapus');
      loadPembayaran();
    } catch (error) {
      console.error('Error deleting pembayaran:', error);
      alert(error.response?.data?.message || 'Gagal menghapus transaksi');
    }
  };

  const resetForm = () => {
    setFormData({
      nama_pembayaran: '',
      nominal: '',
      periode: '',
      tingkat: '0',
      deskripsi: '',
      status: 'aktif'
    });
    setEditingId(null);
    setShowForm(false);
  };

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      aktif: 'bg-green-100 text-green-800',
      nonaktif: 'bg-gray-100 text-gray-800'
    };

    const labels = {
      pending: 'Pending',
      approved: 'Disetujui',
      rejected: 'Ditolak',
      aktif: 'Aktif',
      nonaktif: 'Nonaktif'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
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
        <Header title="Keuangan" subtitle="Kelola pembayaran dan transaksi siswa" />

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('list')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'list'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Jenis Tagihan
              </button>
              <button
                onClick={() => setActiveTab('transaksi')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'transaksi'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Transaksi Pembayaran
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Tab: Jenis Tagihan */}
            {activeTab === 'list' && (
              <div className="space-y-6">
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    Tambah Jenis Tagihan
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listPembayaran.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Belum ada jenis tagihan</p>
                    </div>
                  ) : (
                    listPembayaran.map((item) => (
                      <div
                        key={item.id}
                        className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-800 mb-1">{item.nama_pembayaran}</h3>
                            <p className="text-2xl font-bold text-emerald-600">{formatRupiah(item.nominal)}</p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Periode:</span>
                            <span className="font-medium capitalize">{item.periode}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Tingkat:</span>
                            <span className="font-medium">
                              {item.tingkat === 0 ? 'Semua Kelas' : `Kelas ${item.tingkat}`}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Status:</span>
                            {getStatusBadge(item.status)}
                          </div>
                          {item.deskripsi && (
                            <p className="text-gray-600 pt-2 border-t">{item.deskripsi}</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tab: Transaksi Pembayaran */}
            {activeTab === 'transaksi' && (
              <div className="space-y-6">
                <div className="flex gap-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Semua Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Disetujui</option>
                    <option value="rejected">Ditolak</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Siswa</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jenis</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pembayaran.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                            Belum ada transaksi pembayaran
                          </td>
                        </tr>
                      ) : (
                        pembayaran.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="font-medium text-gray-900">{item.siswa?.nama_lengkap}</div>
                                <div className="text-sm text-gray-500">{item.siswa?.kelas?.nama_kelas}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.jenis_pembayaran?.nama_pembayaran}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatRupiah(item.jumlah_bayar)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {new Date(item.tanggal_bayar).toLocaleDateString('id-ID')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(item.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                              <div className="flex justify-end gap-2">
                                {item.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleApprove(item.id, 'approved')}
                                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                      title="Setujui"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleApprove(item.id, 'rejected')}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                      title="Tolak"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                                {item.status !== 'approved' && (
                                  <button
                                    onClick={() => handleDeletePembayaran(item.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                    title="Hapus"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {editingId ? 'Edit Jenis Tagihan' : 'Tambah Jenis Tagihan'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Pembayaran <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nama_pembayaran}
                    onChange={(e) => setFormData({ ...formData, nama_pembayaran: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Misal: SPP, Uang Gedung"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nominal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.nominal}
                    onChange={(e) => setFormData({ ...formData, nominal: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="250000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Periode <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.periode}
                    onChange={(e) => setFormData({ ...formData, periode: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Pilih Periode</option>
                    <option value="bulanan">Bulanan</option>
                    <option value="semester">Semester</option>
                    <option value="tahunan">Tahunan</option>
                  </select>
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
                    <option value="0">Semua Kelas</option>
                    {[1, 2, 3, 4, 5, 6].map((t) => (
                      <option key={t} value={t}>Kelas {t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
      </div>
    </Layout>
  );
};

export default Keuangan;
