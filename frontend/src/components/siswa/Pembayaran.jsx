import { useState, useEffect } from 'react';
import Layout from '../shared/Layout';
import Header from '../shared/Header';
import { CreditCard, CheckCircle, Clock, XCircle, AlertCircle, DollarSign, Upload, X } from 'lucide-react';
import { siswaAPI } from '../../services/api';
import { useToast } from '../ui/Toast';

const SiswaPembayaran = () => {
  const [pembayaranData, setPembayaranData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tagihan'); // tagihan or riwayat
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedTagihan, setSelectedTagihan] = useState(null);
  const [formData, setFormData] = useState({
    jumlah_bayar: '',
    tanggal_bayar: new Date().toISOString().split('T')[0],
    catatan: ''
  });
  const toast = useToast();

  useEffect(() => {
    loadPembayaran();
  }, []);

  const loadPembayaran = async () => {
    try {
      const response = await siswaAPI.getPembayaran();
      if (response.success) {
        setPembayaranData(response.data);
      }
    } catch (error) {
      console.error('Error loading pembayaran:', error);
      alert('Gagal memuat data pembayaran');
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Menunggu Verifikasi', icon: Clock },
      approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Lunas', icon: CheckCircle },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Ditolak', icon: XCircle },
      belum_bayar: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Belum Dibayar', icon: AlertCircle }
    };
    return badges[status] || badges.belum_bayar;
  };

  const getPeriodeLabel = (periode) => {
    const labels = {
      bulanan: 'Bulanan',
      semester: 'Per Semester',
      tahunan: 'Tahunan'
    };
    return labels[periode] || periode;
  };

  const handleAjukanPembayaran = (tagihan) => {
    setSelectedTagihan(tagihan);
    setFormData({
      jumlah_bayar: tagihan.nominal,
      tanggal_bayar: new Date().toISOString().split('T')[0],
      catatan: ''
    });
    setShowPaymentForm(true);
  };

  const handleSubmitPembayaran = async (e) => {
    e.preventDefault();

    if (!formData.jumlah_bayar || !formData.tanggal_bayar) {
      toast.error('Jumlah bayar dan tanggal bayar wajib diisi');
      return;
    }

    try {
      setLoading(true);
      const response = await siswaAPI.submitPembayaran({
        list_pembayaran_id: selectedTagihan.id,
        jumlah_bayar: formData.jumlah_bayar,
        tanggal_bayar: formData.tanggal_bayar,
        catatan: formData.catatan
      });

      if (response.success) {
        toast.success('Pengajuan pembayaran berhasil dikirim! Menunggu persetujuan admin.');
        setShowPaymentForm(false);
        setSelectedTagihan(null);
        loadPembayaran();
      }
    } catch (error) {
      console.error('Error submitting pembayaran:', error);
      toast.error(error.response?.data?.message || 'Gagal mengajukan pembayaran');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseForm = () => {
    setShowPaymentForm(false);
    setSelectedTagihan(null);
    setFormData({
      jumlah_bayar: '',
      tanggal_bayar: new Date().toISOString().split('T')[0],
      catatan: ''
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

  if (!pembayaranData || !pembayaranData.siswa.kelas) {
    return (
      <Layout>
        <div className="space-y-6">
          <Header
            title="Pembayaran"
            subtitle="Kelola tagihan dan riwayat pembayaran"
          />
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
            <CreditCard className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
            <p className="text-yellow-800 font-medium">Anda belum terdaftar di kelas manapun</p>
            <p className="text-yellow-600 text-sm mt-1">Silakan hubungi admin untuk pendaftaran kelas</p>
          </div>
        </div>
      </Layout>
    );
  }

  const { siswa, tagihan, riwayat_pembayaran, statistik } = pembayaranData;

  return (
    <Layout>
      <div className="space-y-6 pb-20 md:pb-6">
        <Header
          title="Pembayaran"
          subtitle={`${siswa.nama} - ${siswa.kelas}`}
        />

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-white rounded-2xl p-3 md:p-4 shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3">
              <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
              <div className="w-full">
                <p className="text-xs text-gray-600">Total Tagihan</p>
                <p className="text-lg md:text-2xl font-bold text-blue-600">{statistik.total_tagihan}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-3 md:p-4 shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3">
              <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-emerald-600" />
              <div className="w-full">
                <p className="text-xs text-gray-600">Sudah Bayar</p>
                <p className="text-lg md:text-2xl font-bold text-emerald-600">{statistik.sudah_bayar}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-3 md:p-4 shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3">
              <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-red-600" />
              <div className="w-full">
                <p className="text-xs text-gray-600">Belum Bayar</p>
                <p className="text-lg md:text-2xl font-bold text-red-600">{statistik.belum_bayar}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-3 md:p-4 shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3">
              <Clock className="w-6 h-6 md:w-8 md:h-8 text-yellow-600" />
              <div className="w-full">
                <p className="text-xs text-gray-600">Pending</p>
                <p className="text-lg md:text-2xl font-bold text-yellow-600">{statistik.pending}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('tagihan')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'tagihan'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Tagihan
            </button>
            <button
              onClick={() => setActiveTab('riwayat')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'riwayat'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Riwayat Pembayaran
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'tagihan' ? (
          <div className="space-y-4">
            {tagihan.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">Tidak ada tagihan</p>
              </div>
            ) : (
              tagihan.map((item) => {
                const statusInfo = getStatusBadge(item.status_bayar);
                const StatusIcon = statusInfo.icon;

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      {/* Left Section */}
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base md:text-lg font-bold text-gray-800 mb-1 truncate">{item.nama_pembayaran}</h3>
                            <p className="text-xs md:text-sm text-gray-600 mb-2 line-clamp-1">{item.deskripsi || 'Tidak ada deskripsi'}</p>
                            <div className="flex flex-wrap items-center gap-2 md:gap-4">
                              <span className="inline-block px-2 md:px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs md:text-sm font-medium">
                                {getPeriodeLabel(item.periode)}
                              </span>
                              <p className="text-xl md:text-2xl font-bold text-emerald-600">
                                {formatRupiah(item.nominal)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Section */}
                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-2 md:gap-3">
                        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                          <StatusIcon className="w-4 h-4 md:w-5 md:h-5" />
                          <span className={`px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm font-medium ${statusInfo.bg} ${statusInfo.text} whitespace-nowrap`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        {item.status_bayar === 'belum_bayar' && (
                          <button
                            onClick={() => handleAjukanPembayaran(item)}
                            className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium text-xs md:text-sm whitespace-nowrap"
                          >
                            <Upload className="w-3 h-3 md:w-4 md:h-4" />
                            <span className="hidden sm:inline">Ajukan Pembayaran</span>
                            <span className="sm:hidden">Ajukan</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Riwayat Pembayaran</h2>
              </div>
            </div>

            {riwayat_pembayaran.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">Belum ada riwayat pembayaran</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Jenis Pembayaran
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Nominal
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Jumlah Bayar
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Tanggal Bayar
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {riwayat_pembayaran.map((item) => {
                      const statusInfo = getStatusBadge(item.status);
                      const StatusIcon = statusInfo.icon;

                      return (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-gray-800">{item.jenis_pembayaran}</p>
                            {item.catatan && (
                              <p className="text-xs text-gray-500 mt-1">{item.catatan}</p>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-medium text-gray-700">
                              {formatRupiah(item.nominal)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-bold text-emerald-600">
                              {formatRupiah(item.jumlah_bayar)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-sm text-gray-600">
                              {formatDate(item.tanggal_bayar)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <StatusIcon className="w-5 h-5" />
                              <span className={`px-3 py-1 rounded-lg text-sm font-medium ${statusInfo.bg} ${statusInfo.text}`}>
                                {statusInfo.label}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 md:p-4">
          <div className="flex items-start gap-2 md:gap-3">
            <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm text-blue-800 font-medium">Informasi Pembayaran:</p>
              <p className="text-xs md:text-sm text-blue-700 mt-1">
                Klik tombol "Ajukan Pembayaran" pada tagihan yang ingin dibayar, lalu isi form dengan detail pembayaran Anda. Pengajuan akan diverifikasi oleh admin.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Form Modal */}
      {showPaymentForm && selectedTagihan && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={handleCloseForm}></div>

          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeInUp">
              {/* Close Button */}
              <button
                onClick={handleCloseForm}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                  Ajukan Pembayaran
                </h3>
                <p className="text-gray-600 text-center text-sm">
                  {selectedTagihan.nama_pembayaran}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitPembayaran} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nominal Tagihan
                  </label>
                  <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl">
                    <p className="text-lg font-bold text-gray-800">
                      {formatRupiah(selectedTagihan.nominal)}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jumlah Bayar <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.jumlah_bayar}
                    onChange={(e) => setFormData({ ...formData, jumlah_bayar: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Masukkan jumlah bayar"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Bisa berbeda dari nominal tagihan (misal: bayar sebagian)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Bayar <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.tanggal_bayar}
                    onChange={(e) => setFormData({ ...formData, tanggal_bayar: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catatan
                  </label>
                  <textarea
                    value={formData.catatan}
                    onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Catatan tambahan (opsional)"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium disabled:bg-gray-400"
                  >
                    {loading ? 'Mengirim...' : 'Ajukan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default SiswaPembayaran;
