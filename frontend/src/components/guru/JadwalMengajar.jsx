import { useState, useEffect } from 'react';
import { guruAPI } from '../../services/api';
import { Calendar, Clock, BookOpen, Users, MapPin } from 'lucide-react';
import Layout from '../shared/Layout';
import Header from '../shared/Header';

function JadwalMengajar() {
  const [jadwalData, setJadwalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('all');

  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  useEffect(() => {
    loadJadwal();
  }, []);

  const loadJadwal = async () => {
    setLoading(true);
    try {
      const result = await guruAPI.getJadwal();
      if (result.success) {
        setJadwalData(result.data || []);
      }
    } catch (error) {
      console.error('Error loading jadwal:', error);
      alert('Gagal memuat jadwal mengajar');
    } finally {
      setLoading(false);
    }
  };

  const filteredJadwal = selectedDay === 'all'
    ? jadwalData
    : jadwalData.filter(j => j.hari === selectedDay);

  const groupedByDay = days.reduce((acc, day) => {
    acc[day] = jadwalData.filter(j => j.hari === day)
      .sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai));
    return acc;
  }, {});

  const formatTime = (time) => {
    if (!time) return '-';
    return time.substring(0, 5);
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
        <Header
          title="Jadwal Mengajar"
          subtitle="Lihat jadwal mengajar Anda"
        />

        {/* Filter Hari */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-gray-800">Filter Hari</h3>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedDay('all')}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                selectedDay === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Semua Hari
            </button>
            {days.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  selectedDay === day
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Jadwal Cards - View All */}
        {selectedDay === 'all' ? (
          <div className="space-y-6">
            {days.map(day => (
              <div key={day} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  {day}
                </h3>

                {groupedByDay[day].length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groupedByDay[day].map((jadwal) => (
                      <div
                        key={jadwal.id}
                        className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-emerald-300 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-semibold text-gray-700">
                              {formatTime(jadwal.jam_mulai)} - {formatTime(jadwal.jam_selesai)}
                            </span>
                          </div>
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                            {jadwal.hari}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <BookOpen className="w-4 h-4 text-emerald-600 mt-0.5" />
                            <div>
                              <p className="font-bold text-gray-800">{jadwal.mataPelajaran?.nama_mapel || '-'}</p>
                              <p className="text-xs text-gray-500">{jadwal.mataPelajaran?.kode_mapel || '-'}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-gray-700">{jadwal.kelas?.nama_kelas || '-'}</span>
                          </div>

                          {jadwal.ruangan && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-purple-600" />
                              <span className="text-sm text-gray-700">{jadwal.ruangan}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">Tidak ada jadwal di hari {day}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          // View Single Day
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Jadwal {selectedDay}</h3>

            {filteredJadwal.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredJadwal
                  .sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai))
                  .map((jadwal) => (
                    <div
                      key={jadwal.id}
                      className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-emerald-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-semibold text-gray-700">
                            {formatTime(jadwal.jam_mulai)} - {formatTime(jadwal.jam_selesai)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <BookOpen className="w-4 h-4 text-emerald-600 mt-0.5" />
                          <div>
                            <p className="font-bold text-gray-800">{jadwal.mataPelajaran?.nama_mapel || '-'}</p>
                            <p className="text-xs text-gray-500">{jadwal.mataPelajaran?.kode_mapel || '-'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-700">{jadwal.kelas?.nama_kelas || '-'}</span>
                        </div>

                        {jadwal.ruangan && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-purple-600" />
                            <span className="text-sm text-gray-700">{jadwal.ruangan}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Tidak ada jadwal di hari {selectedDay}</p>
              </div>
            )}
          </div>
        )}

        {/* Summary Stats */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Ringkasan</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Total Jadwal</p>
              <p className="text-2xl font-bold text-blue-600">{jadwalData.length}</p>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Kelas Berbeda</p>
              <p className="text-2xl font-bold text-emerald-600">
                {[...new Set(jadwalData.map(j => j.kelas_id))].length}
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Mata Pelajaran</p>
              <p className="text-2xl font-bold text-purple-600">
                {[...new Set(jadwalData.map(j => j.mata_pelajaran_id))].length}
              </p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Hari Aktif</p>
              <p className="text-2xl font-bold text-orange-600">
                {[...new Set(jadwalData.map(j => j.hari))].length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default JadwalMengajar;
