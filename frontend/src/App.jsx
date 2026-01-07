import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './components/auth/Login';
import Unauthorized from './components/auth/Unauthorized';
import AdminDashboard from './components/admin/Dashboard';
import AdminKelas from './components/admin/Kelas';
import AdminGuru from './components/admin/Guru';
import AdminSiswa from './components/admin/Siswa';
import AdminMataPelajaran from './components/admin/MataPelajaran';
import AdminJadwalPelajaran from './components/admin/JadwalPelajaranSimple';
import AdminKeuangan from './components/admin/Keuangan';
import AdminInformasi from './components/admin/Informasi';
import AdminPresensi from './components/admin/Presensi';
import AdminRapor from './components/admin/Rapor';
import AdminResetPassword from './components/admin/ResetPassword';
import AdminSettings from './components/admin/Settings';
import GuruDashboard from './components/guru/Dashboard';
import GuruNilai from './components/guru/Nilai';
import GuruJadwalMengajar from './components/guru/JadwalMengajar';
import GuruPresensi from './components/guru/Presensi';
import GuruSiswaSaya from './components/guru/SiswaSaya';
import GuruInformasiKelas from './components/guru/InformasiKelas';
import GuruPengaturan from './components/guru/Pengaturan';
import SiswaDashboard from './components/siswa/Dashboard';
import SiswaJadwal from './components/siswa/Jadwal';
import SiswaNilai from './components/siswa/Nilai';
import SiswaPresensi from './components/siswa/Presensi';
import SiswaInformasi from './components/siswa/Informasi';
import SiswaPembayaran from './components/siswa/Pembayaran';
import SiswaPengaturan from './components/siswa/Pengaturan';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/kelas"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminKelas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/guru"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminGuru />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/siswa"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminSiswa />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/mata-pelajaran"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminMataPelajaran />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/jadwal"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminJadwalPelajaran />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/pembayaran"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminKeuangan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/informasi"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminInformasi />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/presensi"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPresensi />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/rapor"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminRapor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reset-password"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminResetPassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminSettings />
              </ProtectedRoute>
            }
          />

          {/* Guru Routes */}
          <Route
            path="/guru"
            element={
              <ProtectedRoute allowedRoles={['guru']}>
                <GuruDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/guru/jadwal"
            element={
              <ProtectedRoute allowedRoles={['guru']}>
                <GuruJadwalMengajar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/guru/presensi"
            element={
              <ProtectedRoute allowedRoles={['guru']}>
                <GuruPresensi />
              </ProtectedRoute>
            }
          />
          <Route
            path="/guru/nilai"
            element={
              <ProtectedRoute allowedRoles={['guru']}>
                <GuruNilai />
              </ProtectedRoute>
            }
          />
          <Route
            path="/guru/siswa"
            element={
              <ProtectedRoute allowedRoles={['guru']}>
                <GuruSiswaSaya />
              </ProtectedRoute>
            }
          />
          <Route
            path="/guru/informasi"
            element={
              <ProtectedRoute allowedRoles={['guru']}>
                <GuruInformasiKelas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/guru/settings"
            element={
              <ProtectedRoute allowedRoles={['guru']}>
                <GuruPengaturan />
              </ProtectedRoute>
            }
          />

          {/* Siswa Routes */}
          <Route
            path="/siswa"
            element={
              <ProtectedRoute allowedRoles={['siswa']}>
                <SiswaDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/siswa/jadwal"
            element={
              <ProtectedRoute allowedRoles={['siswa']}>
                <SiswaJadwal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/siswa/nilai"
            element={
              <ProtectedRoute allowedRoles={['siswa']}>
                <SiswaNilai />
              </ProtectedRoute>
            }
          />
          <Route
            path="/siswa/presensi"
            element={
              <ProtectedRoute allowedRoles={['siswa']}>
                <SiswaPresensi />
              </ProtectedRoute>
            }
          />
          <Route
            path="/siswa/informasi"
            element={
              <ProtectedRoute allowedRoles={['siswa']}>
                <SiswaInformasi />
              </ProtectedRoute>
            }
          />
          <Route
            path="/siswa/pembayaran"
            element={
              <ProtectedRoute allowedRoles={['siswa']}>
                <SiswaPembayaran />
              </ProtectedRoute>
            }
          />
          <Route
            path="/siswa/settings"
            element={
              <ProtectedRoute allowedRoles={['siswa']}>
                <SiswaPengaturan />
              </ProtectedRoute>
            }
          />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-emerald-600 mb-4">404</h1>
                  <p className="text-gray-600 mb-4">Halaman tidak ditemukan</p>
                  <a href="/login" className="text-emerald-600 hover:underline">
                    Kembali ke Login
                  </a>
                </div>
              </div>
            }
          />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
