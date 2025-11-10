import { useState, useEffect } from 'react';
import Layout from '../shared/Layout';
import Header from '../shared/Header';
import { Calendar, BookOpen, ClipboardCheck, Bell, Clock } from 'lucide-react';
import { siswaAPI } from '../../services/api';

const SiswaDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await siswaAPI.getDashboard();
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      alert('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
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

  if (!dashboardData) {
    return (
      <Layout>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-gray-600">Gagal memuat data dashboard</p>
        </div>
      </Layout>
    );
  }

  const { siswa, statistics, jadwal_hari_ini, informasi_terbaru } = dashboardData;

  const statCards = [
    {
      title: 'Jadwal Hari Ini',
      value: statistics.jadwal_hari_ini,
      icon: Calendar,
      color: 'blue'
    },
    {
      title: 'Rata-rata Nilai',
      value: statistics.rata_rata_nilai || '-',
      icon: BookOpen,
      color: 'emerald'
    },
    {
      title: 'Kehadiran',
      value: statistics.persentase_kehadiran ? `${statistics.persentase_kehadiran}%` : '-',
      icon: ClipboardCheck,
      color: 'purple'
    },
    {
      title: 'Info Terbaru',
      value: statistics.total_informasi,
      icon: Bell,
      color: 'orange'
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <Header
          title={`Selamat Datang, ${siswa.nama}`}
          subtitle={siswa.kelas ? `${siswa.kelas} - NISN: ${siswa.nisn}` : `NISN: ${siswa.nisn}`}
        />

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                  <div className={`w-14 h-14 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-7 h-7 text-${stat.color}-600`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Jadwal Hari Ini */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Jadwal Hari Ini</h2>
          </div>

          {jadwal_hari_ini.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Tidak ada jadwal pelajaran hari ini</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jadwal_hari_ini.map((jadwal) => (
                <div
                  key={jadwal.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-blue-600 min-w-[120px]">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {jadwal.jam_mulai} - {jadwal.jam_selesai}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{jadwal.mata_pelajaran}</p>
                      <p className="text-sm text-gray-500">{jadwal.guru}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-lg">
                    {jadwal.ruangan}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Informasi Terbaru */}
        {informasi_terbaru.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-orange-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Informasi dari Wali Kelas</h2>
            </div>

            <div className="space-y-4">
              {informasi_terbaru.map((info) => (
                <div
                  key={info.id}
                  className="p-4 bg-orange-50 border border-orange-100 rounded-xl"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-800">{info.judul}</h3>
                    <span className="text-xs text-gray-500">
                      {formatDate(info.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap mb-2">{info.konten}</p>
                  <p className="text-xs text-gray-500">- {info.guru}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Class Message */}
        {!siswa.kelas && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
            <Bell className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
            <p className="text-yellow-800 font-medium">Anda belum terdaftar di kelas manapun</p>
            <p className="text-yellow-600 text-sm mt-1">Silakan hubungi admin untuk pendaftaran kelas</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SiswaDashboard;
