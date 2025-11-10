import { useState, useEffect } from 'react';
import Layout from '../shared/Layout';
import Header from '../shared/Header';
import { ClipboardCheck, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react';
import { siswaAPI } from '../../services/api';

const SiswaPresensi = () => {
  const [presensiData, setPresensiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBulan, setSelectedBulan] = useState('');
  const [selectedTahun, setSelectedTahun] = useState('');

  const bulanList = [
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' }
  ];

  useEffect(() => {
    // Set current month and year
    const now = new Date();
    setSelectedBulan((now.getMonth() + 1).toString());
    setSelectedTahun(now.getFullYear().toString());
  }, []);

  useEffect(() => {
    if (selectedBulan && selectedTahun) {
      loadPresensi();
    }
  }, [selectedBulan, selectedTahun]);

  const loadPresensi = async () => {
    try {
      setLoading(true);
      const response = await siswaAPI.getPresensi(selectedBulan, selectedTahun);
      if (response.success) {
        setPresensiData(response.data);
      }
    } catch (error) {
      console.error('Error loading presensi:', error);
      alert('Gagal memuat data presensi');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'hadir':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'izin':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      case 'sakit':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'alpa':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      hadir: 'bg-emerald-100 text-emerald-700',
      izin: 'bg-blue-100 text-blue-700',
      sakit: 'bg-yellow-100 text-yellow-700',
      alpa: 'bg-red-100 text-red-700'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  const formatTanggal = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
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

  if (!presensiData || !presensiData.siswa.kelas) {
    return (
      <Layout>
        <div className="space-y-6">
          <Header
            title="Presensi Saya"
            subtitle="Lihat riwayat kehadiran"
          />
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
            <ClipboardCheck className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
            <p className="text-yellow-800 font-medium">Anda belum terdaftar di kelas manapun</p>
            <p className="text-yellow-600 text-sm mt-1">Silakan hubungi admin untuk pendaftaran kelas</p>
          </div>
        </div>
      </Layout>
    );
  }

  const { siswa, statistik, presensi } = presensiData;

  return (
    <Layout>
      <div className="space-y-6">
        <Header
          title="Presensi Saya"
          subtitle={`${siswa.nama} - ${siswa.kelas}`}
        />

        {/* Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Bulan</label>
              <select
                value={selectedBulan}
                onChange={(e) => setSelectedBulan(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {bulanList.map((bulan) => (
                  <option key={bulan.value} value={bulan.value}>
                    {bulan.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
              <select
                value={selectedTahun}
                onChange={(e) => setSelectedTahun(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
              <div>
                <p className="text-xs text-gray-600">Hadir</p>
                <p className="text-2xl font-bold text-emerald-600">{statistik.hadir}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Izin</p>
                <p className="text-2xl font-bold text-blue-600">{statistik.izin}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-xs text-gray-600">Sakit</p>
                <p className="text-2xl font-bold text-yellow-600">{statistik.sakit}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-xs text-gray-600">Alpa</p>
                <p className="text-2xl font-bold text-red-600">{statistik.alpa}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-2xl p-4 shadow-lg">
            <div className="text-center">
              <p className="text-xs mb-1">Persentase</p>
              <p className="text-3xl font-bold">{statistik.persentase_kehadiran}%</p>
            </div>
          </div>
        </div>

        {/* Presensi List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <ClipboardCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Riwayat Presensi</h2>
                <p className="text-sm text-gray-600">
                  {bulanList.find(b => b.value === selectedBulan)?.label} {selectedTahun}
                </p>
              </div>
            </div>
          </div>

          {presensi.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Belum ada data presensi</p>
              <p className="text-gray-500 text-sm mt-1">
                Presensi akan muncul setelah guru melakukan absensi
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status Kehadiran
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Keterangan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {presensi.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">{formatTanggal(item.tanggal)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {getStatusIcon(item.status)}
                          <span className={`px-3 py-1 rounded-lg text-sm font-medium capitalize ${getStatusBadge(item.status)}`}>
                            {item.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {item.keterangan || '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SiswaPresensi;
