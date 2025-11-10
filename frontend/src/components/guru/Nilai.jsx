import { useState, useEffect } from 'react';
import { raporAPI, guruAPI, settingsAPI } from '../../services/api';
import { BookOpen, Award, Save } from 'lucide-react';
import Layout from '../shared/Layout';
import Header from '../shared/Header';

function Nilai() {
  const [activeTab, setActiveTab] = useState('input'); // 'input' or 'ranking'

  // Common state
  const [kelasList, setKelasList] = useState([]);
  const [mataPelajaranList, setMataPelajaranList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Akademik Aktif from Settings
  const [tahunAjaranAktif, setTahunAjaranAktif] = useState('2024/2025');
  const [semesterAktif, setSemesterAktif] = useState('Ganjil');

  // Input Nilai state
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedMapel, setSelectedMapel] = useState('');
  const [siswaList, setSiswaList] = useState([]);
  const [nilaiData, setNilaiData] = useState({});

  // Ranking state
  const [rankingKelas, setRankingKelas] = useState('');
  const [rankingData, setRankingData] = useState(null);

  useEffect(() => {
    loadAkademikAktif();
    loadKelasList();
    loadMataPelajaranList();
  }, []);

  const loadAkademikAktif = async () => {
    try {
      const result = await settingsAPI.getAkademikAktif();
      if (result.success && result.data) {
        setTahunAjaranAktif(result.data.tahun_ajaran_aktif || '2024/2025');
        setSemesterAktif(result.data.semester_aktif || 'Ganjil');
      }
    } catch (error) {
      console.error('Error loading akademik aktif:', error);
    }
  };

  useEffect(() => {
    if (selectedKelas && selectedMapel && tahunAjaranAktif && semesterAktif) {
      loadNilaiData();
    }
  }, [selectedKelas, selectedMapel, tahunAjaranAktif, semesterAktif]);

  const loadKelasList = async () => {
    try {
      const result = await guruAPI.getKelasDiampu();
      setKelasList(result.data || []);
    } catch (error) {
      console.error('Error loading kelas:', error);
    }
  };

  const loadMataPelajaranList = async () => {
    try {
      const result = await guruAPI.getMataPelajaranDiampu();
      setMataPelajaranList(result.data || []);
    } catch (error) {
      console.error('Error loading mata pelajaran:', error);
    }
  };

  const loadNilaiData = async () => {
    if (!selectedKelas || !selectedMapel || !tahunAjaranAktif || !semesterAktif) return;

    setLoading(true);
    try {
      const result = await raporAPI.getRaporByKelas(selectedKelas, {
        mata_pelajaran_id: selectedMapel,
        semester: semesterAktif,
        tahun_ajaran: tahunAjaranAktif
      });

      console.log('Load nilai result:', result);

      // Backend returns data_rapor array with siswa data
      const dataRapor = result.data.data_rapor || [];
      console.log('Data rapor:', dataRapor);

      setSiswaList(dataRapor);

      // Initialize nilai data from existing records
      const initialData = {};
      dataRapor.forEach(item => {
        initialData[item.siswa.id] = {
          nilai_harian: item.nilai_harian || '',
          nilai_uts: item.nilai_uts || '',
          nilai_uas: item.nilai_uas || '',
          catatan: item.catatan || ''
        };
      });
      setNilaiData(initialData);

      console.log('Siswa list set:', dataRapor.length, 'items');
    } catch (error) {
      console.error('Error loading nilai data:', error);
      alert('Gagal memuat data nilai');
    } finally {
      setLoading(false);
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

  const handleNilaiChange = (siswaId, field, value) => {
    setNilaiData(prev => ({
      ...prev,
      [siswaId]: {
        ...prev[siswaId],
        [field]: value
      }
    }));
  };

  const handleSaveNilai = async () => {
    if (!selectedKelas || !selectedMapel) {
      alert('Pilih kelas dan mata pelajaran terlebih dahulu');
      return;
    }

    // Build rapor list - only include students with ALL three nilai filled (non-zero)
    const raporList = [];
    const invalidStudents = [];

    siswaList.forEach(item => {
      const nilai = nilaiData[item.siswa.id];

      // Check if at least one nilai is filled
      const hasNilai = nilai?.nilai_harian || nilai?.nilai_uts || nilai?.nilai_uas;

      if (hasNilai) {
        // Validate: semua nilai harus diisi dan tidak boleh 0
        const harian = nilai?.nilai_harian ? parseFloat(nilai.nilai_harian) : 0;
        const uts = nilai?.nilai_uts ? parseFloat(nilai.nilai_uts) : 0;
        const uas = nilai?.nilai_uas ? parseFloat(nilai.nilai_uas) : 0;

        // Check if all three are filled and > 0
        if (harian > 0 && uts > 0 && uas > 0) {
          // Valid: all three filled with values > 0
          raporList.push({
            siswa_id: item.siswa.id,
            nilai_harian: harian,
            nilai_uts: uts,
            nilai_uas: uas,
            catatan: nilai?.catatan || null
          });
        } else {
          // Invalid: some values are 0 or not filled
          invalidStudents.push(item.siswa.nama_lengkap);
        }
      }
    });

    // Show error if there are students with incomplete nilai
    if (invalidStudents.length > 0) {
      alert(
        `Nilai tidak lengkap untuk siswa berikut:\n\n${invalidStudents.join('\n')}\n\nSemua nilai (Harian, UTS, UAS) harus diisi dengan nilai > 0`
      );
      return;
    }

    if (raporList.length === 0) {
      alert('Tidak ada nilai yang diisi');
      return;
    }

    console.log('Sending rapor data:', {
      kelas_id: selectedKelas,
      mata_pelajaran_id: selectedMapel,
      semester: semesterAktif,
      tahun_ajaran: tahunAjaranAktif,
      rapor_list: raporList
    });

    setLoading(true);
    try {
      const result = await raporAPI.bulkCreateRapor({
        kelas_id: selectedKelas,
        mata_pelajaran_id: selectedMapel,
        semester: semesterAktif,
        tahun_ajaran: tahunAjaranAktif,
        rapor_list: raporList
      });

      console.log('Save result:', result);
      console.log('Save result data:', result.data);

      // Show detailed result
      let message = `Nilai berhasil diproses!\n\nBaru: ${result.data?.created || 0}\nUpdate: ${result.data?.updated || 0}`;

      if (result.data?.errors && result.data.errors.length > 0) {
        message += `\nError: ${result.data.errors.length}`;
        message += '\n\nDetail Error:';
        result.data.errors.forEach(err => {
          message += `\n- Siswa ID ${err.siswa_id}: ${err.error}`;
        });
        console.error('Save errors:', result.data.errors);
      }

      alert(message);

      // Reload data to get calculated nilai_akhir and predikat
      console.log('Reloading nilai data...');
      await loadNilaiData();
      console.log('Reload complete');
    } catch (error) {
      console.error('Error saving nilai:', error);
      console.error('Error response:', error.response?.data);
      alert(error.response?.data?.message || 'Gagal menyimpan nilai');
    } finally {
      setLoading(false);
    }
  };

  const getPredikatBadge = (predikat) => {
    if (!predikat) return null;

    const styles = {
      A: 'bg-green-100 text-green-800',
      B: 'bg-blue-100 text-blue-800',
      C: 'bg-yellow-100 text-yellow-800',
      D: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-bold ${styles[predikat] || 'bg-gray-100 text-gray-800'}`}>
        {predikat}
      </span>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <Header title="Input Nilai & Ranking" subtitle="Kelola nilai siswa dan lihat ranking kelas" />

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
            Input Nilai
          </button>
          <button
            onClick={() => setActiveTab('ranking')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'ranking'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Ranking Kelas
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'input' ? (
          <div className="space-y-6">
            {/* Info & Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="mb-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <p className="text-sm text-emerald-800">
                  <span className="font-semibold">Periode Aktif:</span> {tahunAjaranAktif} - Semester {semesterAktif}
                </p>
              </div>

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
                    Mata Pelajaran <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedMapel}
                    onChange={(e) => setSelectedMapel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Pilih Mapel</option>
                    {mataPelajaranList.map((mapel) => (
                      <option key={mapel.id} value={mapel.id}>
                        {mapel.nama_mapel}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={loadNilaiData}
                    disabled={!selectedKelas || !selectedMapel}
                    className="w-full px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <BookOpen size={20} className="inline mr-2" />
                    Tampilkan Data
                  </button>
                </div>
              </div>
            </div>

            {/* Nilai Table */}
            {siswaList.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NISN</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Siswa</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Nilai Harian</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Nilai UTS</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Nilai UAS</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Nilai Akhir</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Predikat</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {siswaList.map((item, index) => (
                        <tr key={item.siswa.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{item.siswa.nisn}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.siswa.nama_lengkap}</td>
                          <td className="px-6 py-4 text-sm text-center">
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={nilaiData[item.siswa.id]?.nilai_harian || ''}
                              onChange={(e) => handleNilaiChange(item.siswa.id, 'nilai_harian', e.target.value)}
                              placeholder="1-100"
                              className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="px-6 py-4 text-sm text-center">
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={nilaiData[item.siswa.id]?.nilai_uts || ''}
                              onChange={(e) => handleNilaiChange(item.siswa.id, 'nilai_uts', e.target.value)}
                              placeholder="1-100"
                              className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="px-6 py-4 text-sm text-center">
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={nilaiData[item.siswa.id]?.nilai_uas || ''}
                              onChange={(e) => handleNilaiChange(item.siswa.id, 'nilai_uas', e.target.value)}
                              placeholder="1-100"
                              className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="px-6 py-4 text-sm text-center">
                            <span className="font-bold text-gray-900">
                              {item.nilai_akhir ? parseFloat(item.nilai_akhir).toFixed(2) : '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-center">
                            {getPredikatBadge(item.predikat)}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <input
                              type="text"
                              value={nilaiData[item.siswa.id]?.catatan || ''}
                              onChange={(e) => handleNilaiChange(item.siswa.id, 'catatan', e.target.value)}
                              placeholder="Catatan (opsional)"
                              className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    onClick={handleSaveNilai}
                    disabled={loading}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Save size={18} />
                    {loading ? 'Menyimpan...' : 'Simpan Nilai'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100">
                <BookOpen size={48} className="mx-auto mb-4 text-gray-400" />
                <p>Pilih kelas, mata pelajaran, semester, dan tahun ajaran untuk menampilkan data siswa</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Ranking Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="mb-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <p className="text-sm text-emerald-800">
                  <span className="font-semibold">Periode Aktif:</span> {tahunAjaranAktif} - Semester {semesterAktif}
                </p>
              </div>

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
                    <Award size={20} className="inline mr-2" />
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
                <Award size={48} className="mx-auto mb-4 text-gray-400" />
                <p>Pilih kelas, semester, dan tahun ajaran untuk menampilkan ranking</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Nilai;
