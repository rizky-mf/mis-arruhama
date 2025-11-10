import { useState, useEffect } from 'react';
import Layout from '../shared/Layout';
import Header from '../shared/Header';
import { BookOpen, Award, TrendingUp, CheckCircle, XCircle, User } from 'lucide-react';
import { siswaAPI } from '../../services/api';

const SiswaNilai = () => {
  const [nilaiData, setNilaiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNilai();
  }, []);

  const loadNilai = async () => {
    try {
      const response = await siswaAPI.getNilaiRapor();
      if (response.success) {
        setNilaiData(response.data);
      }
    } catch (error) {
      console.error('Error loading nilai:', error);
      alert('Gagal memuat nilai rapor');
    } finally {
      setLoading(false);
    }
  };

  const getPredikatColor = (predikat) => {
    if (!predikat) return 'gray';
    switch (predikat.toUpperCase()) {
      case 'A': return 'emerald';
      case 'B': return 'blue';
      case 'C': return 'yellow';
      case 'D': return 'orange';
      case 'E': return 'red';
      default: return 'gray';
    }
  };

  const getNilaiStatus = (nilaiAkhir, kkm) => {
    if (!nilaiAkhir) return null;
    return parseFloat(nilaiAkhir) >= kkm ? 'lulus' : 'tidak_lulus';
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

  if (!nilaiData || !nilaiData.siswa.kelas) {
    return (
      <Layout>
        <div className="space-y-6">
          <Header
            title="Nilai & Rapor"
            subtitle="Lihat nilai dan rapor semester"
          />
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
            <Award className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
            <p className="text-yellow-800 font-medium">Anda belum terdaftar di kelas manapun</p>
            <p className="text-yellow-600 text-sm mt-1">Silakan hubungi admin untuk pendaftaran kelas</p>
          </div>
        </div>
      </Layout>
    );
  }

  const { siswa, periode, statistik, nilai } = nilaiData;

  return (
    <Layout>
      <div className="space-y-6">
        <Header
          title="Nilai & Rapor"
          subtitle={`${siswa.nama} - ${siswa.kelas}`}
        />

        {/* Info Periode */}
        <div className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm mb-1">Periode Aktif</p>
              <p className="text-2xl font-bold">Semester {periode.semester}</p>
              <p className="text-emerald-100 mt-1">Tahun Ajaran {periode.tahun_ajaran}</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Award className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Rata-rata Nilai</p>
                <p className="text-3xl font-bold text-emerald-600">{statistik.rata_rata || '-'}</p>
              </div>
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Mata Pelajaran</p>
                <p className="text-3xl font-bold text-blue-600">{statistik.total_mapel}</p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Lulus KKM</p>
                <p className="text-3xl font-bold text-purple-600">
                  {statistik.total_lulus}/{statistik.total_mapel}
                </p>
              </div>
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Nilai Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Daftar Nilai</h2>
            </div>
          </div>

          {nilai.length === 0 ? (
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Belum ada nilai yang diinput</p>
              <p className="text-gray-500 text-sm mt-1">Guru akan menginput nilai secara bertahap</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Mata Pelajaran
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Guru
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      KKM
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Tugas
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      UTS
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      UAS
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Nilai Akhir
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Predikat
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {nilai.map((item) => {
                    const status = getNilaiStatus(item.nilai_akhir, item.kkm);
                    const predikatColor = getPredikatColor(item.predikat);

                    return (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-800">{item.mata_pelajaran}</p>
                            <p className="text-xs text-gray-500">Kode: {item.kode_mapel}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-purple-600" />
                            </div>
                            <span className="text-sm text-gray-700">{item.guru}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                            {item.kkm}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-medium text-gray-800">
                            {item.tugas !== null ? item.tugas : '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-medium text-gray-800">
                            {item.uts !== null ? item.uts : '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-medium text-gray-800">
                            {item.uas !== null ? item.uas : '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {item.nilai_akhir !== null ? (
                            <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-lg font-bold">
                              {item.nilai_akhir}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {item.predikat ? (
                            <span className={`inline-block px-3 py-1 bg-${predikatColor}-100 text-${predikatColor}-700 rounded-lg text-sm font-bold`}>
                              {item.predikat}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {status === 'lulus' ? (
                            <div className="flex items-center justify-center gap-2">
                              <CheckCircle className="w-5 h-5 text-emerald-600" />
                              <span className="text-emerald-600 font-medium text-sm">Lulus</span>
                            </div>
                          ) : status === 'tidak_lulus' ? (
                            <div className="flex items-center justify-center gap-2">
                              <XCircle className="w-5 h-5 text-red-600" />
                              <span className="text-red-600 font-medium text-sm">Remidi</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Belum Ada</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Catatan Section */}
        {nilai.some(n => n.catatan) && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Catatan Guru</h3>
            <div className="space-y-3">
              {nilai.filter(n => n.catatan).map((item) => (
                <div key={item.id} className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <p className="font-semibold text-gray-800 mb-1">{item.mata_pelajaran}</p>
                  <p className="text-sm text-gray-700 italic">{item.catatan}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SiswaNilai;
