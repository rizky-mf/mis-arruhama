import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Key, Search, Users, GraduationCap, RefreshCw, Eye, EyeOff } from 'lucide-react';
import Layout from '../shared/Layout';
import Header from '../shared/Header';

function ResetPassword() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Reset form state
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, roleFilter, users]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Load guru and siswa
      const [guruRes, siswaRes] = await Promise.all([
        adminAPI.getGuru(),
        adminAPI.getSiswa()
      ]);

      // Combine and format users
      const guruUsers = (guruRes.data || []).map(guru => ({
        id: guru.user_id,
        name: guru.nama_lengkap,
        identifier: guru.nip,
        role: 'guru',
        username: guru.user?.username || 'N/A',
        email: guru.email || '-'
      }));

      const siswaUsers = (siswaRes.data || []).map(siswa => ({
        id: siswa.user_id,
        name: siswa.nama_lengkap,
        identifier: siswa.nisn,
        role: 'siswa',
        username: siswa.user?.username || 'N/A',
        email: siswa.email || '-',
        kelas: siswa.kelas?.nama_kelas || '-'
      }));

      setUsers([...guruUsers, ...siswaUsers]);
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Gagal memuat data pengguna');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filter by role
    if (roleFilter) {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(term) ||
        user.identifier.toLowerCase().includes(term) ||
        user.username.toLowerCase().includes(term)
      );
    }

    setFilteredUsers(filtered);
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setNewPassword('');
    setConfirmPassword('');
    setShowPassword(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Validation
    if (!newPassword || !confirmPassword) {
      alert('Password baru dan konfirmasi password wajib diisi');
      return;
    }

    if (newPassword.length < 6) {
      alert('Password minimal 6 karakter');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('Password dan konfirmasi password tidak cocok');
      return;
    }

    if (!window.confirm(`Apakah Anda yakin ingin mereset password untuk ${selectedUser.name}?`)) {
      return;
    }

    setLoading(true);
    try {
      await adminAPI.resetPassword(selectedUser.id, newPassword);
      alert('Password berhasil direset');

      // Reset form
      setSelectedUser(null);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error resetting password:', error);
      alert(error.response?.data?.message || 'Gagal mereset password');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const styles = {
      guru: 'bg-blue-100 text-blue-800',
      siswa: 'bg-green-100 text-green-800'
    };
    const labels = {
      guru: 'Guru',
      siswa: 'Siswa'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[role]}`}>
        {labels[role]}
      </span>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <Header title="Reset Password" subtitle="Reset password untuk akun guru dan siswa" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Search & Filter */}
              <div className="p-6 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Cari nama, NIP/NISN, atau username..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Semua Role</option>
                    <option value="guru">Guru</option>
                    <option value="siswa">Siswa</option>
                  </select>
                </div>
              </div>

              {/* User List */}
              <div className="max-h-[600px] overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users size={48} className="mx-auto mb-4 text-gray-400" />
                    <p>Tidak ada pengguna ditemukan</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                          selectedUser?.id === user.id ? 'bg-emerald-50 border-l-4 border-emerald-600' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              user.role === 'guru' ? 'bg-blue-100' : 'bg-green-100'
                            }`}>
                              {user.role === 'guru' ? (
                                <GraduationCap className={user.role === 'guru' ? 'text-blue-600' : 'text-green-600'} size={20} />
                              ) : (
                                <Users className="text-green-600" size={20} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 truncate">{user.name}</h3>
                              <p className="text-sm text-gray-600">
                                {user.role === 'guru' ? 'NIP' : 'NISN'}: {user.identifier}
                              </p>
                              <p className="text-xs text-gray-500">Username: {user.username}</p>
                              {user.kelas && (
                                <p className="text-xs text-gray-500">Kelas: {user.kelas}</p>
                              )}
                            </div>
                          </div>
                          <div className="ml-2">
                            {getRoleBadge(user.role)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reset Password Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
              {selectedUser ? (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="text-center pb-4 border-b border-gray-200">
                    <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-3 ${
                      selectedUser.role === 'guru' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      <Key className={selectedUser.role === 'guru' ? 'text-blue-600' : 'text-green-600'} size={32} />
                    </div>
                    <h3 className="font-bold text-gray-800">{selectedUser.name}</h3>
                    <p className="text-sm text-gray-600">{selectedUser.username}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedUser.role === 'guru' ? 'NIP' : 'NISN'}: {selectedUser.identifier}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password Baru <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Konfirmasi Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ketik ulang password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                      minLength={6}
                    />
                  </div>

                  {newPassword && confirmPassword && newPassword !== confirmPassword && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                      Password tidak cocok
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <button
                      type="submit"
                      disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <RefreshCw size={20} />
                      {loading ? 'Mereset...' : 'Reset Password'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedUser(null)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-12">
                  <Key size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500 text-sm">Pilih pengguna dari daftar untuk mereset password</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pengguna</p>
                <p className="text-2xl font-bold text-gray-800">{users.length}</p>
              </div>
              <Users className="text-gray-400" size={32} />
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl shadow-sm border border-blue-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Guru</p>
                <p className="text-2xl font-bold text-blue-800">
                  {users.filter(u => u.role === 'guru').length}
                </p>
              </div>
              <GraduationCap className="text-blue-400" size={32} />
            </div>
          </div>

          <div className="bg-green-50 rounded-2xl shadow-sm border border-green-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Siswa</p>
                <p className="text-2xl font-bold text-green-800">
                  {users.filter(u => u.role === 'siswa').length}
                </p>
              </div>
              <Users className="text-green-400" size={32} />
            </div>
          </div>

          <div className="bg-purple-50 rounded-2xl shadow-sm border border-purple-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Hasil Filter</p>
                <p className="text-2xl font-bold text-purple-800">{filteredUsers.length}</p>
              </div>
              <Search className="text-purple-400" size={32} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ResetPassword;
