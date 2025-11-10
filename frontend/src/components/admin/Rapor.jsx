import { useState, useEffect } from 'react';
import { raporAPI, adminAPI, settingsAPI } from '../../services/api';
import { Award, TrendingUp } from 'lucide-react';
import Layout from '../shared/Layout';
import Header from '../shared/Header';

function Rapor() {
  // Common state
  const [kelasList, setKelasList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Active academic period from settings
  const [tahunAjaranAktif, setTahunAjaranAktif] = useState('2024/2025');
  const [semesterAktif, setSemesterAktif] = useState('Ganjil');

  // Ranking state
  const [rankingKelas, setRankingKelas] = useState('');
  const [rankingData, setRankingData] = useState(null);

  useEffect(() => {
    loadKelasList();
    loadAkademikAktif();
  }, []);

  const loadKelasList = async () => {
    try {
      const result = await adminAPI.getKelas();
      setKelasList(result.data || []);
    } catch (error) {
      console.error('Error loading kelas:', error);
    }
  };

  const loadAkademikAktif = async () => {
    try {
      const result = await settingsAPI.getSettings();
      if (result.success && result.data.settings) {
        setTahunAjaranAktif(result.data.settings.tahun_ajaran_aktif || '2024/2025');
        setSemesterAktif(result.data.settings.semester_aktif || 'Ganjil');
      }
    } catch (error) {
      console.error('Error loading akademik aktif:', error);
    }
  };

  const loadRankingData = async () => {
    if (!rankingKelas) {
      alert('Pilih kelas terlebih dahulu');
      return;
    }

    setLoading(true);
    try {
      const result = await raporAPI.getRankingKelas(rankingKelas, {
        semester: semesterAktif,
        tahun_ajaran: tahunAjaranAktif
      });
      setRankingData(result.data);
    } catch (error) {
      console.error('Error loading ranking:', error);
      alert('Gagal memuat data ranking');
    } finally {
      setLoading(false);
    }
  };


  return (
    <Layout>
      <div className="space-y-6">
        <Header title="Ranking Kelas" subtitle="Lihat peringkat siswa berdasarkan rata-rata nilai" />

        <div>
            {/* Info Banner - Active Period */}
            <div className="mb-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <p className="text-sm text-emerald-800">
                <span className="font-semibold">Periode Aktif:</span> {tahunAjaranAktif} - Semester {semesterAktif}
              </p>
              <p className="text-xs text-emerald-700 mt-1">
                Ranking akan ditampilkan berdasarkan periode aktif yang diatur di menu Pengaturan
              </p>
            </div>

            {/* Ranking Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kelas <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={rankingKelas}
                    onChange={(e) => setRankingKelas(e.target.value)}
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

                <div className="flex items-end">
                  <button
                    onClick={loadRankingData}
                    disabled={!rankingKelas}
                    className="w-full px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <TrendingUp size={20} className="inline mr-2" />
                    Tampilkan Ranking
                  </button>
                </div>
              </div>
            </div>

            {/* Ranking Display */}
            {rankingData && (
              <>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Ranking Kelas - {rankingData.kelas.nama_kelas} ({rankingData.periode.semester}, {rankingData.periode.tahun_ajaran})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Total Siswa</p>
                      <p className="text-2xl font-bold text-gray-800">{rankingData.total_siswa}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Siswa dengan Nilai</p>
                      <p className="text-2xl font-bold text-emerald-600">{rankingData.ranking.length}</p>
                    </div>
                  </div>
                </div>

                {/* Ranking Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ranking</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NISN</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Siswa</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Jumlah Mapel</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Rata-rata Nilai</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {rankingData.ranking.map((siswa) => (
                          <tr key={siswa.siswa.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-center">
                              {siswa.ranking <= 3 ? (
                                <div className="flex justify-center">
                                  <Award
                                    size={32}
                                    className={
                                      siswa.ranking === 1 ? 'text-yellow-500' :
                                      siswa.ranking === 2 ? 'text-gray-400' :
                                      'text-orange-600'
                                    }
                                    fill="currentColor"
                                  />
                                </div>
                              ) : (
                                <span className="text-lg font-bold text-gray-600">{siswa.ranking}</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">{siswa.siswa.nisn}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{siswa.siswa.nama_lengkap}</td>
                            <td className="px-6 py-4 text-sm text-center text-gray-900">{siswa.jumlah_mapel}</td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-lg font-bold text-emerald-600">{siswa.rata_rata}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                siswa.rata_rata >= 85 ? 'bg-green-100 text-green-800' :
                                siswa.rata_rata >= 70 ? 'bg-blue-100 text-blue-800' :
                                siswa.rata_rata >= 55 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {siswa.rata_rata >= 85 ? 'Sangat Baik' :
                                 siswa.rata_rata >= 70 ? 'Baik' :
                                 siswa.rata_rata >= 55 ? 'Cukup' : 'Kurang'}
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

          {!rankingData && !loading && (
            <div className="text-center py-12 text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100">
              <TrendingUp size={48} className="mx-auto mb-4 text-gray-400" />
              <p>Pilih kelas untuk menampilkan ranking</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Rapor;
