import { useState, useEffect } from 'react';
import { guruAPI } from '../../services/api';
import './Pengaturan.css';

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
    <div className="pengaturan-container">
      <div className="pengaturan-header">
        <h1>Pengaturan</h1>
        <p>Kelola profil dan preferensi akun Anda</p>
      </div>

      {/* Tabs */}
      <div className="pengaturan-tabs">
        <button
          className={activeTab === 'profil' ? 'tab active' : 'tab'}
          onClick={() => handleTabChange('profil')}
        >
          Profil Pribadi
        </button>
        <button
          className={activeTab === 'password' ? 'tab active' : 'tab'}
          onClick={() => handleTabChange('password')}
        >
          Ubah Password
        </button>
        <button
          className={activeTab === 'info-mengajar' ? 'tab active' : 'tab'}
          onClick={() => handleTabChange('info-mengajar')}
        >
          Info Mengajar
        </button>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Tab Content */}
      <div className="pengaturan-content">
        {/* Profil Tab */}
        {activeTab === 'profil' && (
          <div className="tab-content">
            <h2>Profil Pribadi</h2>
            <form onSubmit={handleUpdateProfile}>
              <div className="form-grid">
                {/* Read-only fields */}
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    value={profileData.username}
                    disabled
                    className="input-disabled"
                  />
                </div>

                <div className="form-group">
                  <label>NIP</label>
                  <input
                    type="text"
                    value={profileData.nip}
                    disabled
                    className="input-disabled"
                  />
                </div>

                <div className="form-group">
                  <label>Nama Lengkap</label>
                  <input
                    type="text"
                    value={profileData.nama_lengkap}
                    disabled
                    className="input-disabled"
                  />
                </div>

                <div className="form-group">
                  <label>Jenis Kelamin</label>
                  <input
                    type="text"
                    value={profileData.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                    disabled
                    className="input-disabled"
                  />
                </div>

                {/* Editable fields */}
                <div className="form-group">
                  <label>Tanggal Lahir</label>
                  <input
                    type="date"
                    value={profileData.tanggal_lahir || ''}
                    onChange={(e) => setProfileData({ ...profileData, tanggal_lahir: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>No. Telepon</label>
                  <input
                    type="text"
                    placeholder="08xxxxxxxxxx"
                    value={profileData.telepon || ''}
                    onChange={(e) => setProfileData({ ...profileData, telepon: e.target.value })}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={profileData.email || ''}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Alamat</label>
                  <textarea
                    rows="3"
                    placeholder="Alamat lengkap"
                    value={profileData.alamat || ''}
                    onChange={(e) => setProfileData({ ...profileData, alamat: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="tab-content">
            <h2>Ubah Password</h2>
            <form onSubmit={handleChangePassword}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Password Lama *</label>
                  <input
                    type="password"
                    placeholder="Masukkan password lama"
                    value={passwordData.password_lama}
                    onChange={(e) => setPasswordData({ ...passwordData, password_lama: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Password Baru *</label>
                  <input
                    type="password"
                    placeholder="Masukkan password baru (min. 6 karakter)"
                    value={passwordData.password_baru}
                    onChange={(e) => setPasswordData({ ...passwordData, password_baru: e.target.value })}
                    required
                    minLength="6"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Konfirmasi Password Baru *</label>
                  <input
                    type="password"
                    placeholder="Ulangi password baru"
                    value={passwordData.konfirmasi_password}
                    onChange={(e) => setPasswordData({ ...passwordData, konfirmasi_password: e.target.value })}
                    required
                    minLength="6"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Mengubah...' : 'Ubah Password'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Info Mengajar Tab */}
        {activeTab === 'info-mengajar' && (
          <div className="tab-content">
            <h2>Informasi Mengajar</h2>

            {loading ? (
              <div className="loading">Memuat data...</div>
            ) : (
              <>
                {/* Mata Pelajaran */}
                <div className="info-section">
                  <h3>Mata Pelajaran yang Diampu</h3>
                  {infoMengajar.mata_pelajaran.length > 0 ? (
                    <div className="mapel-grid">
                      {infoMengajar.mata_pelajaran.map(mapel => (
                        <div key={mapel.id} className="mapel-card">
                          <div className="mapel-kode">{mapel.kode_mapel}</div>
                          <div className="mapel-nama">{mapel.nama_mapel}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-data">Tidak ada mata pelajaran yang diampu</p>
                  )}
                </div>

                {/* Kelas */}
                <div className="info-section">
                  <h3>Kelas yang Diajar</h3>
                  {infoMengajar.kelas.length > 0 ? (
                    <div className="kelas-grid">
                      {infoMengajar.kelas.map(kelas => (
                        <div key={kelas.id} className="kelas-card">
                          <div className="kelas-nama">{kelas.nama_kelas}</div>
                          <div className="kelas-info">
                            Tingkat {kelas.tingkat} - {kelas.tahun_ajaran}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-data">Tidak ada kelas yang diajar</p>
                  )}
                </div>

                {/* Jadwal */}
                <div className="info-section">
                  <h3>Jadwal Mengajar</h3>
                  {infoMengajar.jadwal.length > 0 ? (
                    <div className="jadwal-container">
                      {Object.entries(getJadwalByHari()).map(([hari, jadwalList]) => (
                        jadwalList.length > 0 && (
                          <div key={hari} className="jadwal-hari">
                            <h4>{hari}</h4>
                            <div className="jadwal-list">
                              {jadwalList.map((jadwal, idx) => (
                                <div key={idx} className="jadwal-item">
                                  <div className="jadwal-time">
                                    {jadwal.jam_mulai} - {jadwal.jam_selesai}
                                  </div>
                                  <div className="jadwal-detail">
                                    <div className="jadwal-mapel">{jadwal.mata_pelajaran}</div>
                                    <div className="jadwal-kelas">
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
                    <p className="no-data">Tidak ada jadwal mengajar</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pengaturan;
