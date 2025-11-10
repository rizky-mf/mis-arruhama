import { useState, useEffect } from 'react';
import { guruAPI } from '../../services/api';
import { Users, Search, GraduationCap, Calendar, Phone, Mail } from 'lucide-react';
import Layout from '../shared/Layout';
import Header from '../shared/Header';

function SiswaSaya() {
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState('');
  const [siswaList, setSiswaList] = useState([]);
  const [filteredSiswa, setFilteredSiswa] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadKelasList();
  }, []);

  useEffect(() => {
    if (selectedKelas) {
      loadSiswaByKelas();
    }
  }, [selectedKelas]);

  useEffect(() => {
    handleSearch();
  }, [searchQuery, siswaList]);

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

  const loadSiswaByKelas = async () => {
    if (!selectedKelas) return;

    setLoading(true);
    try {
      const result = await guruAPI.getSiswaByKelas(selectedKelas);
      if (result.success) {
        setSiswaList(result.data || []);
      }
    } catch (error) {
      console.error('Error loading siswa:', error);
      alert('Gagal memuat data siswa');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredSiswa(siswaList);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = siswaList.filter(siswa =>
      siswa.nama_lengkap.toLowerCase().includes(query) ||
      siswa.nisn.includes(query)
    );
    setFilteredSiswa(filtered);
  };

  const selectedKelasData = kelasList.find(k => k.id === parseInt(selectedKelas));

  return (
    <Layout>
      <div className="space-y-6">
        <Header
          title="Siswa Saya"
          subtitle="Lihat daftar siswa yang Anda ajar"
        />

        {/* Filter & Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pilih Kelas <span className="text-red-500">*</span>
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
                Cari Siswa
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari berdasarkan nama atau NISN..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Kelas Info */}
        {selectedKelasData && (
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl shadow-sm p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">{selectedKelasData.nama_kelas}</h3>
                <p className="text-emerald-100">
                  Tingkat {selectedKelasData.tingkat} • Tahun Ajaran {selectedKelasData.tahun_ajaran}
                </p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-2">
                  <Users className="w-10 h-10" />
                </div>
                <p className="text-sm text-emerald-100">Total Siswa</p>
                <p className="text-3xl font-bold">{selectedKelasData.jumlah_siswa}</p>
              </div>
            </div>
          </div>
        )}

        {/* Siswa Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : filteredSiswa.length > 0 ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <p className="text-sm text-gray-600 mb-1">Total Siswa</p>
                <p className="text-2xl font-bold text-emerald-600">{siswaList.length}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <p className="text-sm text-gray-600 mb-1">Laki-laki</p>
                <p className="text-2xl font-bold text-blue-600">
                  {siswaList.filter(s => s.jenis_kelamin === 'L').length}
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <p className="text-sm text-gray-600 mb-1">Perempuan</p>
                <p className="text-2xl font-bold text-pink-600">
                  {siswaList.filter(s => s.jenis_kelamin === 'P').length}
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <p className="text-sm text-gray-600 mb-1">Hasil Pencarian</p>
                <p className="text-2xl font-bold text-purple-600">{filteredSiswa.length}</p>
              </div>
            </div>

            {/* Siswa Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSiswa.map((siswa) => (
                <div
                  key={siswa.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                        siswa.jenis_kelamin === 'L' ? 'bg-blue-500' : 'bg-pink-500'
                      }`}>
                        {siswa.nama_lengkap.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{siswa.nama_lengkap}</h3>
                        <p className="text-sm text-gray-500">NISN: {siswa.nisn}</p>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <GraduationCap className="w-4 h-4 text-emerald-600" />
                      <span>{siswa.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                    </div>

                    {siswa.tempat_lahir && siswa.tanggal_lahir && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span>
                          {siswa.tempat_lahir}, {new Date(siswa.tanggal_lahir).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    )}

                    {siswa.no_telp && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4 text-purple-600" />
                        <span>{siswa.no_telp}</span>
                      </div>
                    )}

                    {siswa.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 text-orange-600" />
                        <span className="truncate">{siswa.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  {siswa.alamat && (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Alamat:</p>
                      <p className="text-sm text-gray-700 line-clamp-2">{siswa.alamat}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : selectedKelas ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">
              {searchQuery ? 'Tidak ada siswa yang sesuai dengan pencarian' : 'Tidak ada siswa di kelas ini'}
            </p>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
            <GraduationCap className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Pilih kelas untuk melihat daftar siswa</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default SiswaSaya;
