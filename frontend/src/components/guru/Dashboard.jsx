import { useState, useEffect } from 'react';
import Layout from '../shared/Layout';
import Header from '../shared/Header';
import { Calendar, Users, BookOpen, ClipboardCheck, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { guruAPI } from '../../services/api';

const GuruDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const result = await guruAPI.getDashboard();
      if (result.success) {
        setDashboardData(result.data);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
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

  const stats = dashboardData?.statistics || {};
  const jadwalHariIni = dashboardData?.jadwal_hari_ini || [];
  const kelasDiampu = dashboardData?.kelas_diampu || [];
  const recentNilai = dashboardData?.recent_nilai || [];

  const statCards = [
    {
      title: 'Jadwal Hari Ini',
      value: stats.jadwal_hari_ini || 0,
      icon: Calendar,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Total Siswa',
      value: stats.total_siswa || 0,
      icon: Users,
      color: 'emerald',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      title: 'Mata Pelajaran',
      value: stats.total_mapel || 0,
      icon: BookOpen,
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Tugas Pending',
      value: stats.nilai_pending || 0,
      icon: AlertCircle,
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
  ];

  const formatTime = (time) => {
    if (!time) return '-';
    return time.substring(0, 5); // HH:MM
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <Header
          title="Dashboard Guru"
          subtitle={`Selamat datang, ${dashboardData?.guru?.nama || 'Guru'}!`}
        />

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-800">{card.value}</p>
                  </div>
                  <div className={`w-14 h-14 ${card.bgColor} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-7 h-7 ${card.textColor}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Jadwal Hari Ini */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-bold text-gray-800">Jadwal Mengajar Hari Ini</h2>
            </div>

            {jadwalHariIni.length > 0 ? (
              <div className="space-y-3">
                {jadwalHariIni.map((jadwal, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-emerald-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-semibold text-gray-700">
                            {formatTime(jadwal.jam_mulai)} - {formatTime(jadwal.jam_selesai)}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-800 mb-1">{jadwal.mata_pelajaran}</h3>
                        <p className="text-sm text-gray-600">
                          Kelas: {jadwal.kelas}
                          {jadwal.ruangan && ` • Ruangan: ${jadwal.ruangan}`}
                        </p>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                          {jadwal.hari}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>Tidak ada jadwal mengajar hari ini</p>
              </div>
            )}
          </div>

          {/* Kelas yang Diampu */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-bold text-gray-800">Kelas yang Diampu</h2>
            </div>

            {kelasDiampu.length > 0 ? (
              <div className="space-y-3">
                {kelasDiampu.map((kelas) => (
                  <div
                    key={kelas.id}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-emerald-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-800 mb-1">{kelas.nama_kelas}</h3>
                        <p className="text-sm text-gray-600">
                          Tingkat {kelas.tingkat} • {kelas.jumlah_siswa} siswa
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Tahun Ajaran: {kelas.tahun_ajaran}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <span className="text-emerald-600 font-bold text-lg">
                          {kelas.jumlah_siswa}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>Tidak ada kelas yang diampu</p>
              </div>
            )}
          </div>
        </div>

        {/* Reminder & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reminder */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <h2 className="text-xl font-bold text-gray-800">Reminder</h2>
            </div>

            <div className="space-y-3">
              {stats.nilai_pending > 0 && (
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <div className="flex items-start gap-3">
                    <ClipboardCheck className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-800">Nilai Belum Diinput</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Ada <span className="font-bold text-orange-600">{stats.nilai_pending}</span> nilai
                        yang belum diinput
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {stats.presensi_pending > 0 && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-800">Presensi Belum Diisi</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Ada <span className="font-bold text-blue-600">{stats.presensi_pending}</span> kelas
                        yang belum absen hari ini
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {stats.nilai_pending === 0 && stats.presensi_pending === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>Semua tugas sudah selesai!</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-bold text-gray-800">Nilai Terakhir Diinput</h2>
            </div>

            {recentNilai.length > 0 ? (
              <div className="space-y-3">
                {recentNilai.map((nilai, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 rounded-xl border border-gray-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-sm">{nilai.siswa}</h3>
                        <p className="text-xs text-gray-600 mt-1">
                          {nilai.mata_pelajaran} • {nilai.kelas}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(nilai.updated_at)}</p>
                      </div>
                      <div className="text-right ml-3">
                        <div className="font-bold text-lg text-emerald-600">{nilai.nilai_akhir}</div>
                        <div className="text-xs text-gray-600">{nilai.predikat}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>Belum ada nilai yang diinput</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default GuruDashboard;
