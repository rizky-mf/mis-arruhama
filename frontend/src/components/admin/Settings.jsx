import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { settingsAPI } from '../../services/api';
import { User, Lock, GraduationCap, History, Eye, EyeOff, Save, Building2 } from 'lucide-react';
import Layout from '../shared/Layout';
import Header from '../shared/Header';

function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profil'); // 'profil', 'akademik', 'log'
  const [loading, setLoading] = useState(false);

  // Profil & Keamanan state
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    nama_lengkap: ''
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });

  // Pengaturan Akademik state
  const [akademikData, setAkademikData] = useState({
    tahun_ajaran_aktif: '2024/2025',
    semester_aktif: 'Ganjil',
    nama_madrasah: 'Madrasah Ar-Ruhama',
    kepala_madrasah: '',
    alamat_madrasah: '',
    telepon_madrasah: '',
    email_madrasah: '',
    kkm_default: '75',
    bobot_harian: '30',
    bobot_uts: '30',
    bobot_uas: '40'
  });

  // Log Sistem state
  const [logData, setLogData] = useState([]);
  const [logFilter, setLogFilter] = useState('all'); // 'all', 'login', 'admin'

  useEffect(() => {
    loadProfileData();
    loadAkademikData();
    loadLogData();
  }, []);

  const loadProfileData = async () => {
    try {
      const result = await settingsAPI.getProfile();
      if (result.success) {
        setProfileData({
          username: result.data.username || '',
          email: result.data.email || '',
          nama_lengkap: result.data.nama_lengkap || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadAkademikData = async () => {
    try {
      const result = await settingsAPI.getSettings();
      if (result.success) {
        const { settings, profil_madrasah } = result.data;

        setAkademikData({
          tahun_ajaran_aktif: settings.tahun_ajaran_aktif || '2024/2025',
          semester_aktif: settings.semester_aktif || 'Ganjil',
          nama_madrasah: profil_madrasah?.nama_madrasah || 'Madrasah Ar-Ruhama',
          kepala_madrasah: profil_madrasah?.kepala_sekolah || '',
          alamat_madrasah: profil_madrasah?.alamat || '',
          telepon_madrasah: profil_madrasah?.telepon || '',
          email_madrasah: profil_madrasah?.email || '',
          kkm_default: settings.kkm_default || '75',
          bobot_harian: settings.bobot_harian || '30',
          bobot_uts: settings.bobot_uts || '30',
          bobot_uas: settings.bobot_uas || '40'
        });
      }
    } catch (error) {
      console.error('Error loading akademik settings:', error);
    }
  };

  const loadLogData = async () => {
    try {
      const result = await settingsAPI.getActivityLogs({ limit: 50 });
      if (result.success) {
        setLogData(result.data.map(log => ({
          id: log.id,
          user: log.username,
          action: log.action,
          description: log.description,
          timestamp: log.created_at,
          ip_address: log.ip_address
        })));
      }
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await settingsAPI.updateProfile({
        email: profileData.email,
        nama_lengkap: profileData.nama_lengkap
      });

      if (result.success) {
        alert('Profil berhasil diperbarui');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert(error.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Password baru dan konfirmasi password tidak cocok');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('Password minimal 6 karakter');
      return;
    }

    setLoading(true);
    try {
      const result = await settingsAPI.changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });

      if (result.success) {
        alert('Password berhasil diubah');
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert(error.response?.data?.message || 'Gagal mengubah password');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAkademik = async (e) => {
    e.preventDefault();

    // Validate bobot total = 100
    const totalBobot = parseInt(akademikData.bobot_harian) +
                       parseInt(akademikData.bobot_uts) +
                       parseInt(akademikData.bobot_uas);

    if (totalBobot !== 100) {
      alert(`Total bobot nilai harus 100%. Saat ini: ${totalBobot}%`);
      return;
    }

    setLoading(true);
    try {
      // Update settings
      await settingsAPI.updateSettings({
        tahun_ajaran_aktif: akademikData.tahun_ajaran_aktif,
        semester_aktif: akademikData.semester_aktif,
        kkm_default: akademikData.kkm_default,
        bobot_harian: akademikData.bobot_harian,
        bobot_uts: akademikData.bobot_uts,
        bobot_uas: akademikData.bobot_uas
      });

      // Update profil madrasah
      await settingsAPI.updateProfilMadrasah({
        nama_madrasah: akademikData.nama_madrasah,
        kepala_sekolah: akademikData.kepala_madrasah,
        alamat: akademikData.alamat_madrasah,
        telepon: akademikData.telepon_madrasah,
        email: akademikData.email_madrasah
      });

      alert('Pengaturan akademik berhasil disimpan');
    } catch (error) {
      console.error('Error saving akademik settings:', error);
      alert(error.response?.data?.message || 'Gagal menyimpan pengaturan akademik');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const filteredLogs = logData.filter(log => {
    if (logFilter === 'all') return true;
    if (logFilter === 'login') return log.action === 'Login';
    if (logFilter === 'admin') return log.action !== 'Login';
    return true;
  });

  return (
    <Layout>
      <div className="space-y-6">
        <Header title="Pengaturan" subtitle="Kelola pengaturan sistem dan profil" />

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('profil')}
            className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'profil'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <User size={18} />
            Profil & Keamanan
          </button>
          <button
            onClick={() => setActiveTab('akademik')}
            className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'akademik'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <GraduationCap size={18} />
            Pengaturan Akademik
          </button>
          <button
            onClick={() => setActiveTab('log')}
            className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'log'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <History size={18} />
            Log Sistem
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'profil' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Edit Profil */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User size={20} className="text-emerald-600" />
                Informasi Profil
              </h3>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={profileData.username}
                    onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Username tidak dapat diubah</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={profileData.nama_lengkap}
                    onChange={(e) => setProfileData({...profileData, nama_lengkap: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:bg-gray-300 flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {loading ? 'Menyimpan...' : 'Simpan Profil'}
                </button>
              </form>
            </div>

            {/* Ganti Password */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Lock size={20} className="text-emerald-600" />
                Ganti Password
              </h3>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password Lama
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.old ? 'text' : 'password'}
                      value={passwordData.oldPassword}
                      onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, old: !showPasswords.old})}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswords.old ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimal 6 karakter</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Konfirmasi Password Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:bg-gray-300 flex items-center justify-center gap-2"
                >
                  <Lock size={18} />
                  {loading ? 'Mengubah...' : 'Ubah Password'}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'akademik' && (
          <div className="space-y-6">
            <form onSubmit={handleSaveAkademik}>
              {/* Informasi Madrasah */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Building2 size={20} className="text-emerald-600" />
                  Informasi Madrasah
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Madrasah
                    </label>
                    <input
                      type="text"
                      value={akademikData.nama_madrasah}
                      onChange={(e) => setAkademikData({...akademikData, nama_madrasah: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Kepala Madrasah
                    </label>
                    <input
                      type="text"
                      value={akademikData.kepala_madrasah}
                      onChange={(e) => setAkademikData({...akademikData, kepala_madrasah: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Nama Kepala Madrasah"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Madrasah
                    </label>
                    <input
                      type="email"
                      value={akademikData.email_madrasah}
                      onChange={(e) => setAkademikData({...akademikData, email_madrasah: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="admin@arruhama.sch.id"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telepon
                    </label>
                    <input
                      type="tel"
                      value={akademikData.telepon_madrasah}
                      onChange={(e) => setAkademikData({...akademikData, telepon_madrasah: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="021-xxxxx"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alamat
                    </label>
                    <textarea
                      value={akademikData.alamat_madrasah}
                      onChange={(e) => setAkademikData({...akademikData, alamat_madrasah: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      rows={2}
                      placeholder="Alamat lengkap madrasah"
                    />
                  </div>
                </div>
              </div>

              {/* Periode Akademik */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <GraduationCap size={20} className="text-emerald-600" />
                  Periode Akademik Aktif
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tahun Ajaran <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={akademikData.tahun_ajaran_aktif}
                      onChange={(e) => setAkademikData({...akademikData, tahun_ajaran_aktif: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    >
                      <option value="2022/2023">2022/2023</option>
                      <option value="2023/2024">2023/2024</option>
                      <option value="2024/2025">2024/2025</option>
                      <option value="2025/2026">2025/2026</option>
                      <option value="2026/2027">2026/2027</option>
                      <option value="2027/2028">2027/2028</option>
                      <option value="2028/2029">2028/2029</option>
                      <option value="2029/2030">2029/2030</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Semester Aktif <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={akademikData.semester_aktif}
                      onChange={(e) => setAkademikData({...akademikData, semester_aktif: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    >
                      <option value="Ganjil">Semester Ganjil</option>
                      <option value="Genap">Semester Genap</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Pengaturan Nilai */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Pengaturan Nilai</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      KKM Default
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={akademikData.kkm_default}
                      onChange={(e) => setAkademikData({...akademikData, kkm_default: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Bobot Penilaian</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Nilai Harian (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={akademikData.bobot_harian}
                        onChange={(e) => setAkademikData({...akademikData, bobot_harian: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Nilai UTS (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={akademikData.bobot_uts}
                        onChange={(e) => setAkademikData({...akademikData, bobot_uts: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Nilai UAS (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={akademikData.bobot_uas}
                        onChange={(e) => setAkademikData({...akademikData, bobot_uas: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Total bobot harus 100%.
                    Saat ini: {parseInt(akademikData.bobot_harian) + parseInt(akademikData.bobot_uts) + parseInt(akademikData.bobot_uas)}%
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:bg-gray-300 flex items-center gap-2"
                >
                  <Save size={18} />
                  {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'log' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">Riwayat Aktivitas Sistem</h3>
                <select
                  value={logFilter}
                  onChange={(e) => setLogFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">Semua Aktivitas</option>
                  <option value="login">Login</option>
                  <option value="admin">Aktivitas Admin</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {formatDate(log.timestamp)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{log.user}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          log.action === 'Login' ? 'bg-blue-100 text-blue-800' :
                          log.action === 'Create' ? 'bg-green-100 text-green-800' :
                          log.action === 'Update' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{log.description}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{log.ip_address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredLogs.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <History size={48} className="mx-auto mb-4 text-gray-400" />
                <p>Tidak ada riwayat aktivitas</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Settings;
