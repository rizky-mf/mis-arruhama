import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmDialog from '../ui/ConfirmDialog';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Calendar,
  ClipboardList,
  CreditCard,
  BookOpen,
  LogOut,
  Settings,
  Bell,
  School,
  Award,
  Key,
} from 'lucide-react';

const Sidebar = ({ isOpen = false, onClose = () => {} }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate('/login');
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  // Menu items based on role
  const getMenuItems = () => {
    const baseRole = user?.role;

    if (baseRole === 'admin') {
      return [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
        { icon: Users, label: 'Data Siswa', path: '/admin/siswa' },
        { icon: GraduationCap, label: 'Data Guru', path: '/admin/guru' },
        { icon: School, label: 'Data Kelas', path: '/admin/kelas' },
        { icon: BookOpen, label: 'Mata Pelajaran', path: '/admin/mata-pelajaran' },
        { icon: Calendar, label: 'Jadwal', path: '/admin/jadwal' },
        { icon: ClipboardList, label: 'Presensi', path: '/admin/presensi' },
        { icon: Award, label: 'Rapor & Nilai', path: '/admin/rapor' },
        { icon: CreditCard, label: 'Pembayaran', path: '/admin/pembayaran' },
        { icon: Bell, label: 'Informasi', path: '/admin/informasi' },
        { icon: Key, label: 'Reset Password', path: '/admin/reset-password' },
      ];
    } else if (baseRole === 'guru') {
      return [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/guru' },
        { icon: Calendar, label: 'Jadwal Mengajar', path: '/guru/jadwal' },
        { icon: ClipboardList, label: 'Presensi', path: '/guru/presensi' },
        { icon: BookOpen, label: 'Input Nilai', path: '/guru/nilai' },
        { icon: Users, label: 'Siswa Saya', path: '/guru/siswa' },
        { icon: Bell, label: 'Informasi Kelas', path: '/guru/informasi' },
      ];
    } else {
      return [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/siswa' },
        { icon: Calendar, label: 'Jadwal Pelajaran', path: '/siswa/jadwal' },
        { icon: BookOpen, label: 'Nilai & Rapor', path: '/siswa/nilai' },
        { icon: ClipboardList, label: 'Presensi Saya', path: '/siswa/presensi' },
        { icon: CreditCard, label: 'Pembayaran', path: '/siswa/pembayaran' },
        { icon: Bell, label: 'Informasi', path: '/siswa/informasi' },
      ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside className={`fixed left-0 top-0 h-screen w-64 md:w-64 bg-gradient-to-b from-emerald-600 to-emerald-700 text-white shadow-2xl z-40 transition-transform duration-300 ease-in-out flex flex-col ${
      window.innerWidth >= 1024 ? '' : (isOpen ? 'translate-x-0' : '-translate-x-full')
    } lg:translate-x-0`}>
      {/* Logo & Brand */}
      <div className="p-4 md:p-6 border-b border-emerald-500/30 flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
            <GraduationCap className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base md:text-lg font-bold truncate">MIS Ar-Ruhama</h1>
            <p className="text-xs text-emerald-100 truncate">
              {user?.role === 'admin' ? 'Admin Panel' :
               user?.role === 'guru' ? 'Portal Guru' : 'Portal Siswa'}
            </p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-3 md:p-4 border-b border-emerald-500/30 flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-9 h-9 md:w-10 md:h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-base flex-shrink-0">
            {(user?.profile?.nama_lengkap || user?.username)?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm font-medium truncate">{user?.profile?.nama_lengkap || user?.username}</p>
            <p className="text-xs text-emerald-200 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 md:p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => onClose()}
              className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-white text-emerald-600 shadow-lg font-semibold'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
              <span className="text-xs md:text-sm truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-3 md:p-4 border-t border-emerald-500/30 space-y-1 flex-shrink-0">
        <Link
          to={`/${user?.role}/settings`}
          className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl text-white hover:bg-white/10 transition-all duration-200"
        >
          <Settings className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
          <span className="text-xs md:text-sm">Pengaturan</span>
        </Link>
        <button
          onClick={handleLogoutClick}
          className="w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl text-white hover:bg-red-500/20 transition-all duration-200"
        >
          <LogOut className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
          <span className="text-xs md:text-sm">Keluar</span>
        </button>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Konfirmasi Keluar"
        message="Apakah Anda yakin ingin keluar dari sistem?"
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
        confirmText="Ya, Keluar"
        cancelText="Batal"
        type="danger"
      />
    </aside>
  );
};

export default Sidebar;
