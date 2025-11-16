import { useState, useEffect } from 'react';
import Layout from '../shared/Layout';
import Header from '../shared/Header';
import { User, Lock, BookOpen, Calendar, Clock, AlertCircle } from 'lucide-react';
import { guruAPI } from '../../services/api';

const Pengaturan = () => {
  const [activeTab, setActiveTab] = useState('profil');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Profile state
  const [profileData, setProfileData] = useState({
    username: '',
    nip: '',
    nama_lengkap: '',
    jenis_kelamin: '',
    tanggal_lahir: '',
    alamat: '',
    telepon: '',
    email: '',
    foto: ''
  });

  // Password state
  const [passwordData, setPasswordData] = useState({
    password_lama: '',
    password_baru: '',
    konfirmasi_password: ''
  });

  // Info Mengajar state
  const [infoMengajar, setInfoMengajar] = useState({
    guru: {},
    mata_pelajaran: [],
    kelas: [],
    jadwal: []
  });

  // Load profile data
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const result = await guruAPI.getProfile();
      if (result.success) {
        setProfileData(result.data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage({ type: 'error', text: 'Gagal memuat data profil' });
    } finally {
      setLoading(false);
    }
  };

  const loadInfoMengajar = async () => {
    try {
      setLoading(true);
      const result = await guruAPI.getInfoMengajar();
      if (result.success) {
        setInfoMengajar(result.data);
      }
    } catch (error) {
      console.error('Error loading info mengajar:', error);
      setMessage({ type: 'error', text: 'Gagal memuat info mengajar' });
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMessage({ type: '', text: '' });

    if (tab === 'info-mengajar') {
      loadInfoMengajar();
    }
  };

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      const updateData = {
        telepon: profileData.telepon,
        email: profileData.email,
        alamat: profileData.alamat,
        tanggal_lahir: profileData.tanggal_lahir
      };

      const result = await guruAPI.updateProfile(updateData);

      if (result.success) {
        setMessage({ type: 'success', text: 'Profil berhasil diperbarui' });
        loadProfile(); // Reload profile
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Gagal memperbarui profil'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handleChangePassword = async (e) => {
    e.preventDefault();

    // Validation
    if (!passwordData.password_lama || !passwordData.password_baru || !passwordData.konfirmasi_password) {
      setMessage({ type: 'error', text: 'Semua field harus diisi' });
      return;
    }

    if (passwordData.password_baru !== passwordData.konfirmasi_password) {
      setMessage({ type: 'error', text: 'Password baru dan konfirmasi password tidak cocok' });
      return;
    }

    if (passwordData.password_baru.length < 6) {
      setMessage({ type: 'error', text: 'Password baru minimal 6 karakter' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      const result = await guruAPI.changePassword(passwordData);

      if (result.success) {
        setMessage({ type: 'success', text: 'Password berhasil diubah' });
        setPasswordData({
          password_lama: '',
          password_baru: '',
          konfirmasi_password: ''
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Gagal mengubah password'
      });
    } finally {
      setLoading(false);
    }
  };

  // Format jadwal by hari
  const getJadwalByHari = () => {
    const hariOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const jadwalByHari = {};

    hariOrder.forEach(hari => {
      jadwalByHari[hari] = infoMengajar.jadwal.filter(j => j.hari === hari);
    });

    return jadwalByHari;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <Header
          title="Pengaturan"
          subtitle="Kelola profil dan preferensi akun Anda"
        />

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => handleTabChange('profil')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'profil'
                  ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <User className="w-4 h-4" />
                <span>Profil Pribadi</span>
              </div>
            </button>
            <button
              onClick={() => handleTabChange('password')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'password'
                  ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" />
                <span>Ubah Password</span>
              </div>
            </button>
            <button
              onClick={() => handleTabChange('info-mengajar')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'info-mengajar'
                  ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>Info Mengajar</span>
              </div>
            </button>
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`rounded-xl p-4 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {/* Profil Tab */}
        {activeTab === 'profil' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Profil Pribadi</h2>
            <form onSubmit={handleUpdateProfile}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Read-only fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={profileData.username}
                    disabled
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl text-gray-600 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">NIP</label>
                  <input
                    type="text"
                    value={profileData.nip}
                    disabled
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl text-gray-600 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                  <input
                    type="text"
                    value={profileData.nama_lengkap}
                    disabled
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl text-gray-600 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Kelamin</label>
                  <input
                    type="text"
                    value={profileData.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                    disabled
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl text-gray-600 cursor-not-allowed"
                  />
                </div>

                {/* Editable fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={profileData.tanggal_lahir || ''}
                    onChange={(e) => setProfileData({ ...profileData, tanggal_lahir: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">No. Telepon</label>
                  <input
                    type="text"
                    placeholder="08xxxxxxxxxx"
                    value={profileData.telepon || ''}
                    onChange={(e) => setProfileData({ ...profileData, telepon: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={profileData.email || ''}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
                  <textarea
                    rows="3"
                    placeholder="Alamat lengkap"
                    value={profileData.alamat || ''}
                    onChange={(e) => setProfileData({ ...profileData, alamat: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Ubah Password</h2>
            <form onSubmit={handleChangePassword}>
              <div className="max-w-xl space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Lama <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Masukkan password lama"
                    value={passwordData.password_lama}
                    onChange={(e) => setPasswordData({ ...passwordData, password_lama: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Baru <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Masukkan password baru (min. 6 karakter)"
                    value={passwordData.password_baru}
                    onChange={(e) => setPasswordData({ ...passwordData, password_baru: e.target.value })}
                    required
                    minLength="6"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Konfirmasi Password Baru <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Ulangi password baru"
                    value={passwordData.konfirmasi_password}
                    onChange={(e) => setPasswordData({ ...passwordData, konfirmasi_password: e.target.value })}
                    required
                    minLength="6"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Mengubah...' : 'Ubah Password'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Info Mengajar Tab */}
        {activeTab === 'info-mengajar' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Informasi Mengajar</h2>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Mata Pelajaran */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Mata Pelajaran yang Diampu</h3>
                  {infoMengajar.mata_pelajaran.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {infoMengajar.mata_pelajaran.map(mapel => (
                        <div
                          key={mapel.id}
                          className="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl text-center hover:shadow-md transition-shadow"
                        >
                          <div className="text-xs text-emerald-600 font-medium mb-1">{mapel.kode_mapel}</div>
                          <div className="text-sm font-semibold text-emerald-800">{mapel.nama_mapel}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500 italic">
                      Tidak ada mata pelajaran yang diampu
                    </div>
                  )}
                </div>

                {/* Kelas */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Kelas yang Diajar</h3>
                  {infoMengajar.kelas.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {infoMengajar.kelas.map(kelas => (
                        <div
                          key={kelas.id}
                          className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-emerald-300 transition-all"
                        >
                          <div className="text-base font-bold text-gray-800 mb-1">{kelas.nama_kelas}</div>
                          <div className="text-sm text-gray-600">
                            Tingkat {kelas.tingkat} - {kelas.tahun_ajaran}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500 italic">
                      Tidak ada kelas yang diajar
                    </div>
                  )}
                </div>

                {/* Jadwal */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Jadwal Mengajar</h3>
                  {infoMengajar.jadwal.length > 0 ? (
                    <div className="space-y-6">
                      {Object.entries(getJadwalByHari()).map(([hari, jadwalList]) => (
                        jadwalList.length > 0 && (
                          <div key={hari}>
                            <h4 className="text-base font-semibold text-emerald-700 mb-3 pb-2 border-b-2 border-emerald-200">
                              {hari}
                            </h4>
                            <div className="space-y-2">
                              {jadwalList.map((jadwal, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-4 p-3 bg-gray-50 border-l-4 border-emerald-500 rounded-lg"
                                >
                                  <div className="flex items-center gap-2 text-gray-600 min-w-[140px]">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-sm font-medium">
                                      {jadwal.jam_mulai} - {jadwal.jam_selesai}
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-semibold text-gray-800">{jadwal.mata_pelajaran}</div>
                                    <div className="text-sm text-gray-600">
                                      {jadwal.kelas} | {jadwal.ruangan}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500 italic">
                      Tidak ada jadwal mengajar
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </Layout>
  );
};

export default Pengaturan;
