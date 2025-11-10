import { useState, useEffect } from 'react';
import Layout from '../shared/Layout';
import Header from '../shared/Header';
import { Calendar, Clock, BookOpen, User, MapPin } from 'lucide-react';
import { siswaAPI } from '../../services/api';

const SiswaJadwal = () => {
  const [jadwalData, setJadwalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('Senin');

  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  useEffect(() => {
    loadJadwal();
    // Set selectedDay to today
    const today = new Date();
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const todayName = dayNames[today.getDay()];
    if (days.includes(todayName)) {
      setSelectedDay(todayName);
    }
  }, []);

  const loadJadwal = async () => {
    try {
      const response = await siswaAPI.getJadwalPelajaran();
      if (response.success) {
        setJadwalData(response.data);
      }
    } catch (error) {
      console.error('Error loading jadwal:', error);
      alert('Gagal memuat jadwal pelajaran');
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

  if (!jadwalData || !jadwalData.kelas) {
    return (
      <Layout>
        <div className="space-y-6">
          <Header
            title="Jadwal Pelajaran"
            subtitle="Lihat jadwal pelajaran mingguan"
          />
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
            <Calendar className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
            <p className="text-yellow-800 font-medium">Anda belum terdaftar di kelas manapun</p>
            <p className="text-yellow-600 text-sm mt-1">Silakan hubungi admin untuk pendaftaran kelas</p>
          </div>
        </div>
      </Layout>
    );
  }

  const currentJadwal = jadwalData.jadwal[selectedDay] || [];

  return (
    <Layout>
      <div className="space-y-6">
        <Header
          title="Jadwal Pelajaran"
          subtitle={`${jadwalData.kelas.nama} - ${jadwalData.kelas.tahun_ajaran}`}
        />

        {/* Day Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-wrap gap-2">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  selectedDay === day
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule Cards */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Jadwal {selectedDay}</h2>
          </div>

          {currentJadwal.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Tidak ada jadwal untuk hari {selectedDay}</p>
              <p className="text-gray-500 text-sm mt-1">Pilih hari lain untuk melihat jadwal</p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentJadwal.map((jadwal, index) => (
                <div
                  key={jadwal.id}
                  className="relative border-l-4 border-emerald-500 bg-gradient-to-r from-emerald-50 to-white rounded-xl p-5 hover:shadow-md transition-shadow"
                >
                  {/* Jam Number Badge */}
                  <div className="absolute -left-3 top-5 w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>

                  <div className="ml-4">
                    {/* Time */}
                    <div className="flex items-center gap-2 text-emerald-700 mb-3">
                      <Clock className="w-5 h-5" />
                      <span className="text-lg font-bold">
                        {jadwal.jam_mulai} - {jadwal.jam_selesai}
                      </span>
                    </div>

                    {/* Content Grid */}
                    <div className="grid md:grid-cols-3 gap-4">
                      {/* Mata Pelajaran */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Mata Pelajaran</p>
                          <p className="font-bold text-gray-800">{jadwal.mata_pelajaran}</p>
                          <p className="text-xs text-gray-600 mt-1">Kode: {jadwal.kode_mapel}</p>
                        </div>
                      </div>

                      {/* Guru */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Guru Pengajar</p>
                          <p className="font-semibold text-gray-800">{jadwal.guru}</p>
                        </div>
                      </div>

                      {/* Ruangan */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Ruangan</p>
                          <p className="font-semibold text-gray-800">{jadwal.ruangan}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl border border-emerald-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Jam Pelajaran Hari {selectedDay}</p>
              <p className="text-3xl font-bold text-emerald-600">{currentJadwal.length} Jam</p>
            </div>
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SiswaJadwal;
