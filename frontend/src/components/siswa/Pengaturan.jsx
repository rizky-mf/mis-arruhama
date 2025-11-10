import { useState, useEffect } from 'react';
import Layout from '../shared/Layout';
import Header from '../shared/Header';
import { User, Lock, Save, Eye, EyeOff } from 'lucide-react';
import { siswaAPI } from '../../services/api';
import './Pengaturan.css';

const SiswaPengaturan = () => {
  const [activeTab, setActiveTab] = useState('profil');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile data
  const [profileData, setProfileData] = useState({
    user: { username: '', role: '' },
    siswa: {
      nisn: '',
      nama_lengkap: '',
      jenis_kelamin: '',
      tempat_lahir: '',
      tanggal_lahir: '',
      alamat: '',
      telepon: '',
      email: '',
      nama_ayah: '',
      nama_ibu: '',
      telepon_ortu: '',
      foto: '',
      kelas: null
    }
  });

  // Editable fields
  const [formData, setFormData] = useState({
    telepon: '',
    email: '',
    alamat: '',
    tanggal_lahir: ''
  });

  // Password data
  const [passwordData, setPasswordData] = useState({
    password_lama: '',
    password_baru: '',
    konfirmasi_password: ''
  });

  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await siswaAPI.getProfile();
      if (response.success) {
        setProfileData(response.data);
        setFormData({
          telepon: response.data.siswa.telepon || '',
          email: response.data.siswa.email || '',
          alamat: response.data.siswa.alamat || '',
          tanggal_lahir: response.data.siswa.tanggal_lahir || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      alert('Gagal memuat data profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const response = await siswaAPI.updateProfile(formData);
      if (response.success) {
        alert('Profil berhasil diperbarui!');
        loadProfile();
      } else {
        alert(response.message || 'Gagal memperbarui profil');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Gagal memperbarui profil');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.password_lama || !passwordData.password_baru || !passwordData.konfirmasi_password) {
      alert('Semua field password harus diisi!');
      return;
    }

    if (passwordData.password_baru !== passwordData.konfirmasi_password) {
      alert('Password baru dan konfirmasi password tidak cocok!');
      return;
    }

    if (passwordData.password_baru.length < 6) {
      alert('Password baru minimal 6 karakter!');
      return;
    }

    try {
      setSaving(true);
      const response = await siswaAPI.changePassword(passwordData);
      if (response.success) {
        alert('Password berhasil diubah!');
        setPasswordData({
          password_lama: '',
          password_baru: '',
          konfirmasi_password: ''
        });
      } else {
        alert(response.message || 'Gagal mengubah password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert(error.response?.data?.message || 'Gagal mengubah password');
    } finally {
      setSaving(false);
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

  return (
    <Layout>
      <div className="pengaturan-container">
        <Header
          title="Pengaturan"
          subtitle="Kelola profil dan keamanan akun Anda"
        />

        {/* Tabs */}
        <div className="pengaturan-tabs">
          <button
            className={`tab-button ${activeTab === 'profil' ? 'active' : ''}`}
            onClick={() => setActiveTab('profil')}
          >
            <User className="w-5 h-5" />
            <span>Profil Pribadi</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <Lock className="w-5 h-5" />
            <span>Ubah Password</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'profil' && (
            <div className="profile-section">
              <h2 className="section-title">Informasi Pribadi</h2>

              {/* Read-only Info */}
              <div className="info-grid">
                <div className="info-item">
                  <label>Username</label>
                  <input type="text" value={profileData.user.username} disabled />
                </div>

                <div className="info-item">
                  <label>NISN</label>
                  <input type="text" value={profileData.siswa.nisn} disabled />
                </div>

                <div className="info-item">
                  <label>Nama Lengkap</label>
                  <input type="text" value={profileData.siswa.nama_lengkap} disabled />
                </div>

                <div className="info-item">
                  <label>Jenis Kelamin</label>
                  <input type="text" value={profileData.siswa.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'} disabled />
                </div>

                <div className="info-item">
                  <label>Tempat Lahir</label>
                  <input type="text" value={profileData.siswa.tempat_lahir || '-'} disabled />
                </div>

                <div className="info-item">
                  <label>Kelas</label>
                  <input type="text" value={profileData.siswa.kelas?.nama_kelas || 'Belum ada kelas'} disabled />
                </div>

                <div className="info-item">
                  <label>Nama Ayah</label>
                  <input type="text" value={profileData.siswa.nama_ayah || '-'} disabled />
                </div>

                <div className="info-item">
                  <label>Nama Ibu</label>
                  <input type="text" value={profileData.siswa.nama_ibu || '-'} disabled />
                </div>

                <div className="info-item">
                  <label>Telepon Orang Tua</label>
                  <input type="text" value={profileData.siswa.telepon_ortu || '-'} disabled />
                </div>
              </div>

              <h3 className="section-subtitle">Data yang Dapat Diubah</h3>

              {/* Editable Info */}
              <div className="info-grid">
                <div className="info-item">
                  <label>Tanggal Lahir</label>
                  <input
                    type="date"
                    value={formData.tanggal_lahir}
                    onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                  />
                </div>

                <div className="info-item">
                  <label>Telepon/HP</label>
                  <input
                    type="text"
                    value={formData.telepon}
                    onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                    placeholder="Nomor telepon/HP"
                  />
                </div>

                <div className="info-item">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Email"
                  />
                </div>

                <div className="info-item full-width">
                  <label>Alamat</label>
                  <textarea
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    placeholder="Alamat lengkap"
                    rows="3"
                  />
                </div>
              </div>

              <button
                className="save-button"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                <Save className="w-5 h-5" />
                <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
              </button>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="password-section">
              <h2 className="section-title">Ubah Password</h2>
              <p className="section-description">
                Pastikan password baru Anda kuat dan mudah diingat. Password minimal 6 karakter.
              </p>

              <div className="password-form">
                <div className="info-item">
                  <label>Password Lama</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword.old ? 'text' : 'password'}
                      value={passwordData.password_lama}
                      onChange={(e) => setPasswordData({ ...passwordData, password_lama: e.target.value })}
                      placeholder="Masukkan password lama"
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword({ ...showPassword, old: !showPassword.old })}
                    >
                      {showPassword.old ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="info-item">
                  <label>Password Baru</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword.new ? 'text' : 'password'}
                      value={passwordData.password_baru}
                      onChange={(e) => setPasswordData({ ...passwordData, password_baru: e.target.value })}
                      placeholder="Masukkan password baru"
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                    >
                      {showPassword.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="info-item">
                  <label>Konfirmasi Password Baru</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword.confirm ? 'text' : 'password'}
                      value={passwordData.konfirmasi_password}
                      onChange={(e) => setPasswordData({ ...passwordData, konfirmasi_password: e.target.value })}
                      placeholder="Masukkan ulang password baru"
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                    >
                      {showPassword.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                className="save-button"
                onClick={handleChangePassword}
                disabled={saving}
              >
                <Lock className="w-5 h-5" />
                <span>{saving ? 'Mengubah...' : 'Ubah Password'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SiswaPengaturan;
