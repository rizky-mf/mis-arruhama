import { useState, useEffect } from 'react';
import { presensiAPI, guruAPI } from '../../services/api';
import { Calendar, Users, Save, BarChart3 } from 'lucide-react';
import Layout from '../shared/Layout';
import Header from '../shared/Header';

function GuruPresensi() {
  const [activeTab, setActiveTab] = useState('input'); // 'input' or 'rekap'
  const [loading, setLoading] = useState(false);

  // Input Presensi State
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [siswaList, setSiswaList] = useState([]);
  const [presensiData, setPresensiData] = useState({});

  // Rekap State
  const [rekapKelas, setRekapKelas] = useState('');
  const [rekapBulan, setRekapBulan] = useState(new Date().toISOString().substring(0, 7));
  const [rekapData, setRekapData] = useState(null);

  useEffect(() => {
    loadKelasList();
  }, []);

  useEffect(() => {
    if (selectedKelas && selectedDate) {
      loadPresensiData();
    }
  }, [selectedKelas, selectedDate]);

  const loadKelasList = async () => {
    try {
      const result = await guruAPI.getKelasDiampu();
      if (result.success) {
        setKelasList(result.data || []);
      }
    } catch (error) {
      console.error('Error loading kelas:', error);
    }
  };

  const loadPresensiData = async () => {
    if (!selectedKelas || !selectedDate) return;

    setLoading(true);
    try {
      const result = await presensiAPI.getPresensiByKelasAndTanggal(selectedKelas, selectedDate);

      if (result.success && result.data) {
        const dataPresensi = result.data.data_presensi || [];

        // Transform data_presensi menjadi siswaList
        const siswa = dataPresensi.map(d => ({
          id: d.siswa_id,
          nisn: d.nisn,
          nama_lengkap: d.nama_lengkap,
          jenis_kelamin: d.jenis_kelamin
        }));
        setSiswaList(siswa);

        // Initialize presensi data
        const initialData = {};
        dataPresensi.forEach(d => {
          initialData[d.siswa_id] = {
            presensi_id: d.presensi_id,
            status: d.status || 'hadir',
            keterangan: d.keterangan || ''
          };
        });

        setPresensiData(initialData);
      }
    } catch (error) {
      console.error('Error loading presensi:', error);
      alert('Gagal memuat data presensi');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (siswaId, status) => {
    setPresensiData(prev => ({
      ...prev,
      [siswaId]: {
        ...prev[siswaId],
        status
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
    if (!selectedKelas || !selectedDate) {
      alert('Pilih kelas dan tanggal terlebih dahulu');
      return;
    }

    const presensiList = siswaList.map(siswa => ({
      siswa_id: siswa.id,
      status: presensiData[siswa.id]?.status || 'hadir',
      keterangan: presensiData[siswa.id]?.keterangan || null
    }));

    setLoading(true);
    try {
      await presensiAPI.bulkCreateOrUpdatePresensi({
        kelas_id: selectedKelas,
        tanggal: selectedDate,
        presensi_list: presensiList
      });

      alert('Presensi berhasil disimpan');
      loadPresensiData();
    } catch (error) {
      console.error('Error saving presensi:', error);
      alert(error.response?.data?.message || 'Gagal menyimpan presensi');
    } finally {
      setLoading(false);
    }
  };

  const loadRekapPresensi = async () => {
    if (!rekapKelas || !rekapBulan) {
      alert('Pilih kelas dan bulan terlebih dahulu');
      return;
    }

    setLoading(true);
    try {
      // rekapBulan format: "2025-01" -> extract bulan dan tahun
      const [tahun, bulan] = rekapBulan.split('-');

      const result = await presensiAPI.getRekapPresensiKelas(rekapKelas, {
        bulan: parseInt(bulan),
        tahun: parseInt(tahun)
      });

      if (result.success) {
        setRekapData(result.data);
      }
    } catch (error) {
      console.error('Error loading rekap:', error);
      alert('Gagal memuat rekap presensi');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      hadir: 'bg-green-100 text-green-800 border-green-300',
      sakit: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      izin: 'bg-blue-100 text-blue-800 border-blue-300',
      alpa: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || colors.hadir;
  };

  const statusButtons = [
    { value: 'hadir', label: 'Hadir', color: 'emerald' },
    { value: 'sakit', label: 'Sakit', color: 'yellow' },
    { value: 'izin', label: 'Izin', color: 'blue' },
    { value: 'alpa', label: 'Alpa', color: 'red' }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <Header title="Presensi Siswa" subtitle="Kelola presensi siswa" />

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('input')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'input'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Input Presensi
          </button>
          <button
            onClick={() => setActiveTab('rekap')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'rekap'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Rekap Kehadiran
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'input' ? (
          <div className="space-y-6">
            {/* Filter */}
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
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={loadPresensiData}
                    disabled={!selectedKelas || !selectedDate}
                    className="w-full px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:bg-gray-300"
                  >
                    <Users size={20} className="inline mr-2" />
                    Tampilkan Data
                  </button>
                </div>
              </div>
            </div>

            {/* Presensi Table */}
            {siswaList.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NISN</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Siswa</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {siswaList.map((siswa, index) => (
                        <tr key={siswa.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{siswa.nisn}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{siswa.nama_lengkap}</td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center gap-2">
                              {statusButtons.map(btn => (
                                <button
                                  key={btn.value}
                                  onClick={() => handleStatusChange(siswa.id, btn.value)}
                                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                                    presensiData[siswa.id]?.status === btn.value
                                      ? `bg-${btn.color}-600 text-white`
                                      : `bg-gray-100 text-gray-700 hover:bg-${btn.color}-100`
                                  }`}
                                >
                                  {btn.label}
                                </button>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={presensiData[siswa.id]?.keterangan || ''}
                              onChange={(e) => handleKeteranganChange(siswa.id, e.target.value)}
                              placeholder="Keterangan (opsional)"
                              className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Total Siswa: <span className="font-semibold">{siswaList.length}</span>
                  </p>
                  <button
                    onClick={handleSavePresensi}
                    disabled={loading}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:bg-gray-300 flex items-center gap-2"
                  >
                    <Save size={18} />
                    {loading ? 'Menyimpan...' : 'Simpan Presensi'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Rekap Filter */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
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
                  <input
                    type="month"
                    value={rekapBulan}
                    onChange={(e) => setRekapBulan(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={loadRekapPresensi}
                    disabled={!rekapKelas || !rekapBulan}
                    className="w-full px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:bg-gray-300"
                  >
                    <BarChart3 size={20} className="inline mr-2" />
                    Tampilkan Rekap
                  </button>
                </div>
              </div>
            </div>

            {/* Rekap Display */}
            {rekapData && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800">
                    Rekap Kehadiran - {rekapData.kelas?.nama_kelas}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Periode: {new Date(rekapBulan).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Siswa</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Hadir</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Sakit</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Izin</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Alpa</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Persentase</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {rekapData.rekap_per_siswa?.map((item, index) => (
                        <tr key={item.siswa_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.nama_lengkap}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                              {item.hadir}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                              {item.sakit}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                              {item.izin}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                              {item.alpa}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              item.persentase_kehadiran >= 90 ? 'bg-green-100 text-green-800' :
                              item.persentase_kehadiran >= 75 ? 'bg-blue-100 text-blue-800' :
                              item.persentase_kehadiran >= 60 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {item.persentase_kehadiran}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default GuruPresensi;
