import { useState, useEffect } from 'react';
import { Users, GraduationCap, School } from 'lucide-react';
import Layout from '../shared/Layout';
import Header from '../shared/Header';
import { adminAPI } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await adminAPI.getDashboard();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Siswa',
      value: stats?.total_siswa || 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Total Guru',
      value: stats?.total_guru || 0,
      icon: GraduationCap,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      title: 'Total Kelas',
      value: stats?.total_kelas || 0,
      icon: School,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
  ];

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
      <div className="space-y-6">
        {/* Header with Logout */}
        <Header
          title="Dashboard Admin"
          subtitle="Selamat datang di panel admin MIS Ar-Ruhama"
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-800">{card.value}</p>
                  </div>
                  <div className={`w-14 h-14 ${card.bgColor} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-7 h-7 ${card.textColor}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Data Siswa', path: '/admin/siswa', color: 'emerald' },
              { label: 'Data Guru', path: '/admin/guru', color: 'blue' },
              { label: 'Jadwal', path: '/admin/jadwal', color: 'purple' },
              { label: 'Pembayaran', path: '/admin/pembayaran', color: 'orange' },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => window.location.href = action.path}
                className={`p-4 rounded-xl bg-${action.color}-50 hover:bg-${action.color}-100 text-${action.color}-600 font-medium transition-colors`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
