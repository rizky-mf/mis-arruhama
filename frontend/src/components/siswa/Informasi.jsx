import { useState, useEffect } from 'react';
import Layout from '../shared/Layout';
import Header from '../shared/Header';
import { Bell, User, Calendar } from 'lucide-react';
import { siswaAPI } from '../../services/api';

const SiswaInformasi = () => {
  const [informasiData, setInformasiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInformasi();
  }, []);

  const loadInformasi = async () => {
    try {
      const response = await siswaAPI.getInformasi();
      if (response.success) {
        setInformasiData(response.data);
      }
    } catch (error) {
      console.error('Error loading informasi:', error);
      alert('Gagal memuat informasi kelas');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInMs = now - past;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Baru saja';
    if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`;
    if (diffInHours < 24) return `${diffInHours} jam yang lalu`;
    if (diffInDays < 7) return `${diffInDays} hari yang lalu`;
    return formatDate(dateString);
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

  if (!informasiData || !informasiData.siswa.kelas) {
    return (
      <Layout>
        <div className="space-y-6">
          <Header
            title="Informasi Kelas"
            subtitle="Pengumuman dari wali kelas"
          />
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
            <Bell className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
            <p className="text-yellow-800 font-medium">Anda belum terdaftar di kelas manapun</p>
            <p className="text-yellow-600 text-sm mt-1">Silakan hubungi admin untuk pendaftaran kelas</p>
          </div>
        </div>
      </Layout>
    );
  }

  const { siswa, informasi } = informasiData;

  return (
    <Layout>
      <div className="space-y-6">
        <Header
          title="Informasi Kelas"
          subtitle={`Pengumuman untuk ${siswa.kelas}`}
        />

        {/* Info Header */}
        <div className="bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm mb-1">Kelas Anda</p>
              <p className="text-2xl font-bold">{siswa.kelas}</p>
              <p className="text-orange-100 mt-1">Tingkat {siswa.tingkat}</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Bell className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Informasi List */}
        <div className="space-y-4">
          {informasi.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium">Belum ada informasi</p>
              <p className="text-gray-500 text-sm mt-1">
                Wali kelas belum membuat pengumuman untuk kelas Anda
              </p>
            </div>
          ) : (
            informasi.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-50 to-pink-50 px-6 py-4 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{item.judul}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-orange-600" />
                          </div>
                          <span>{item.guru}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span>{getTimeAgo(item.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 py-5">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {item.konten}
                  </p>
                </div>

                {/* Footer */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Diposting pada {formatDate(item.created_at)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom Info */}
        {informasi.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800 font-medium">Tips:</p>
                <p className="text-sm text-blue-700 mt-1">
                  Periksa halaman ini secara berkala untuk mendapatkan informasi terbaru dari wali kelas Anda.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SiswaInformasi;
