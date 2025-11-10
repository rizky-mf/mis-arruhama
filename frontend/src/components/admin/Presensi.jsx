import { useState, useEffect } from 'react';
import { presensiAPI, adminAPI } from '../../services/api';
import { Calendar, Users, CheckCircle, XCircle, AlertCircle, Clock, BarChart3 } from 'lucide-react';
import Layout from '../shared/Layout';
import Header from '../shared/Header';

function Presensi() {
  const [activeTab, setActiveTab] = useState('absen'); // 'absen' or 'rekap'

  // Data state
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedTanggal, setSelectedTanggal] = useState(getTodayDate());
  const [siswaList, setSiswaList] = useState([]);
  const [presensiData, setPresensiData] = useState([]);
  const [stats, setStats] = useState(null);

  // Rekap state
  const [rekapKelas, setRekapKelas] = useState('');
  const [rekapBulan, setRekapBulan] = useState(new Date().getMonth() + 1);
  const [rekapTahun, setRekapTahun] = useState(new Date().getFullYear());
  const [rekapData, setRekapData] = useState(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadKelasList();
  }, []);

  useEffect(() => {
    if (selectedKelas && selectedTanggal) {
      loadPresensiData();
    }
  }, [selectedKelas, selectedTanggal]);

  function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  const loadKelasList = async () => {
    try {
      const result = await adminAPI.getKelas();
      setKelasList(result.data || []);
    } catch (error) {
      console.error('Error loading kelas:', error);
    }
  };

  const loadPresensiData = async () => {
    if (!selectedKelas || !selectedTanggal) return;

    setLoading(true);
    try {
      const result = await presensiAPI.getPresensiByKelasAndTanggal(selectedKelas, selectedTanggal);
      setSiswaList(result.data.data_presensi || []);
      setStats(result.data.statistik);

      // Initialize presensi data from existing records
      const initialData = {};
      result.data.data_presensi.forEach(siswa => {
        if (siswa.status) {
          initialData[siswa.siswa_id] = {
            status: siswa.status,
            keterangan: siswa.keterangan || ''
          };
        }
      });
      setPresensiData(initialData);
    } catch (error) {
      console.error('Error loading presensi data:', error);
      alert('Gagal memuat data presensi');
    } finally {
      setLoading(false);
    }
  };

  const loadRekapPresensi = async () => {
    if (!rekapKelas) {
      alert('Pilih kelas terlebih dahulu');
      return;
    }

    setLoading(true);
    try {
      const result = await presensiAPI.getRekapPresensiKelas(rekapKelas, {
        bulan: rekapBulan,
        tahun: rekapTahun
      });
      setRekapData(result.data);
    } catch (error) {
      console.error('Error loading rekap:', error);
      alert('Gagal memuat rekap presensi');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (siswaId, status) => {
    setPresensiData(prev => ({
      ...prev,
      [siswaId]: {
        status,
        keterangan: prev[siswaId]?.keterangan || ''
      }
    }));
  };

  const handleKeteranganChange = (siswaId, keterangan) => {
    setPresensiData(prev => ({
      ...prev,
      [siswaId]: {
        ...prev[siswaId],
        keterangan
      }
    }));
  };

  const handleSavePresensi = async () => {
    if (!selectedKelas || !selectedTanggal) {
      alert('Pilih kelas dan tanggal terlebih dahulu');
      return;
    }

    // Build presensi list
    const presensiList = siswaList.map(siswa => ({
      siswa_id: siswa.siswa_id,
      status: presensiData[siswa.siswa_id]?.status || 'hadir', // Default hadir
      keterangan: presensiData[siswa.siswa_id]?.keterangan || null
    }));

    setLoading(true);
    try {
      await presensiAPI.bulkCreateOrUpdatePresensi({
        kelas_id: selectedKelas,
        tanggal: selectedTanggal,
        presensi_list: presensiList
      });
      alert('Presensi berhasil disimpan');
      loadPresensiData(); // Reload to get updated stats
    } catch (error) {
      console.error('Error saving presensi:', error);
      alert(error.response?.data?.message || 'Gagal menyimpan presensi');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      hadir: 'bg-green-100 text-green-800',
      sakit: 'bg-yellow-100 text-yellow-800',
      izin: 'bg-blue-100 text-blue-800',
      alpa: 'bg-red-100 text-red-800',
    };
    const labels = {
      hadir: 'Hadir',
      sakit: 'Sakit',
      izin: 'Izin',
      alpa: 'Alpa'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'hadir':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'sakit':
        return <AlertCircle size={20} className="text-yellow-600" />;
      case 'izin':
        return <Clock size={20} className="text-blue-600" />;
      case 'alpa':
        return <XCircle size={20} className="text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <Header title="Manajemen Presensi" subtitle="Kelola absensi siswa harian dan lihat rekap kehadiran" />

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('absen')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'absen'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Input Absen
        </button>
        <button
          onClick={() => setActiveTab('rekap')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'rekap'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Rekap Kehadiran
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'absen' ? (
        <div>
          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kelas <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedKelas}
                  onChange={(e) => setSelectedKelas(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  Tanggal <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={selectedTanggal}
                  onChange={(e) => setSelectedTanggal(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={loadPresensiData}
                  disabled={!selectedKelas || !selectedTanggal}
                  className="w-full px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Calendar size={20} className="inline mr-2" />
                  Tampilkan Data
                </button>
              </div>
            </div>
          </div>

          {/* Statistics */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Siswa</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.total_siswa}</p>
                  </div>
                  <Users className="text-gray-400" size={32} />
                </div>
              </div>

              <div className="bg-green-50 rounded-2xl shadow-sm border border-green-100 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600">Hadir</p>
                    <p className="text-2xl font-bold text-green-800">{stats.hadir}</p>
                  </div>
                  <CheckCircle className="text-green-400" size={32} />
                </div>
              </div>

              <div className="bg-yellow-50 rounded-2xl shadow-sm border border-yellow-100 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600">Sakit</p>
                    <p className="text-2xl font-bold text-yellow-800">{stats.sakit}</p>
                  </div>
                  <AlertCircle className="text-yellow-400" size={32} />
                </div>
              </div>

              <div className="bg-blue-50 rounded-2xl shadow-sm border border-blue-100 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600">Izin</p>
                    <p className="text-2xl font-bold text-blue-800">{stats.izin}</p>
                  </div>
                  <Clock className="text-blue-400" size={32} />
                </div>
              </div>

              <div className="bg-red-50 rounded-2xl shadow-sm border border-red-100 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600">Alpa</p>
                    <p className="text-2xl font-bold text-red-800">{stats.alpa}</p>
                  </div>
                  <XCircle className="text-red-400" size={32} />
                </div>
              </div>
            </div>
          )}

          {/* Presensi Table */}
          {siswaList.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NISN</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Siswa</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jenis Kelamin</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {siswaList.map((siswa, index) => (
                      <tr key={siswa.siswa_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{siswa.nisn}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{siswa.nama_lengkap}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{siswa.jenis_kelamin}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2 justify-center">
                            {['hadir', 'sakit', 'izin', 'alpa'].map((status) => (
                              <button
                                key={status}
                                onClick={() => handleStatusChange(siswa.siswa_id, status)}
                                className={`px-3 py-1 rounded-xl text-xs font-medium transition-colors ${
                                  presensiData[siswa.siswa_id]?.status === status
                                    ? status === 'hadir'
                                      ? 'bg-green-600 text-white'
                                      : status === 'sakit'
                                      ? 'bg-yellow-600 text-white'
                                      : status === 'izin'
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-red-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <input
                            type="text"
                            value={presensiData[siswa.siswa_id]?.keterangan || ''}
                            onChange={(e) => handleKeteranganChange(siswa.siswa_id, e.target.value)}
                            placeholder="Keterangan (opsional)"
                            className="w-full px-2 py-1 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={handleSavePresensi}
                  disabled={loading}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? 'Menyimpan...' : 'Simpan Presensi'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100">
              <Users size={48} className="mx-auto mb-4 text-gray-400" />
              <p>Pilih kelas dan tanggal untuk menampilkan data siswa</p>
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Rekap Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kelas <span className="text-red-500">*</span>
                </label>
                <select
                  value={rekapKelas}
                  onChange={(e) => setRekapKelas(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
                <select
                  value={rekapBulan}
                  onChange={(e) => setRekapBulan(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={month}>
                      {new Date(2000, month - 1).toLocaleString('id-ID', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
                <input
                  type="number"
                  value={rekapTahun}
                  onChange={(e) => setRekapTahun(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={loadRekapPresensi}
                  disabled={!rekapKelas}
                  className="w-full px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <BarChart3 size={20} className="inline mr-2" />
                  Tampilkan Rekap
                </button>
              </div>
            </div>
          </div>

          {/* Rekap Statistics */}
          {rekapData && (
            <>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Statistik Kelas - {rekapData.kelas.nama_kelas} ({rekapData.periode})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Siswa</p>
                    <p className="text-2xl font-bold text-gray-800">{rekapData.statistik_kelas.total_siswa}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Hadir</p>
                    <p className="text-2xl font-bold text-green-600">{rekapData.statistik_kelas.total_hadir}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Presensi</p>
                    <p className="text-2xl font-bold text-blue-600">{rekapData.statistik_kelas.total_presensi}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Rata-rata Kehadiran</p>
                    <p className="text-2xl font-bold text-purple-600">{rekapData.statistik_kelas.rata_rata_kehadiran}%</p>
                  </div>
                </div>
              </div>

              {/* Rekap Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NISN</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Siswa</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Hadir</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Sakit</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Izin</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Alpa</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Kehadiran</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {rekapData.rekap_per_siswa.map((siswa, index) => (
                        <tr key={siswa.siswa_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{siswa.nisn}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{siswa.nama_lengkap}</td>
                          <td className="px-6 py-4 text-sm text-center text-green-600 font-semibold">{siswa.hadir}</td>
                          <td className="px-6 py-4 text-sm text-center text-yellow-600 font-semibold">{siswa.sakit}</td>
                          <td className="px-6 py-4 text-sm text-center text-blue-600 font-semibold">{siswa.izin}</td>
                          <td className="px-6 py-4 text-sm text-center text-red-600 font-semibold">{siswa.alpa}</td>
                          <td className="px-6 py-4 text-sm text-center font-semibold">{siswa.total_presensi}</td>
                          <td className="px-6 py-4 text-sm text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              siswa.persentase_kehadiran >= 80
                                ? 'bg-green-100 text-green-800'
                                : siswa.persentase_kehadiran >= 60
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {siswa.persentase_kehadiran}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {!rekapData && !loading && (
            <div className="text-center py-12 text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100">
              <BarChart3 size={48} className="mx-auto mb-4 text-gray-400" />
              <p>Pilih kelas, bulan, dan tahun untuk menampilkan rekap kehadiran</p>
            </div>
          )}
        </div>
      )}
      </div>
    </Layout>
  );
}

export default Presensi;
