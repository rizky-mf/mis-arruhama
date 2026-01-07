import { useNavigate } from 'react-router-dom';
import { ShieldX, ArrowLeft } from 'lucide-react';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <ShieldX className="w-12 h-12 text-red-600" />
            </div>
          </div>

          {/* Error Code */}
          <h1 className="text-6xl font-bold text-red-600 mb-4">403</h1>

          {/* Message */}
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Akses Ditolak
          </h2>
          <p className="text-gray-600 mb-8">
            Maaf, Anda tidak memiliki izin untuk mengakses halaman ini.
            Silakan login dengan akun yang sesuai atau hubungi administrator.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => navigate(-1)}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft size={20} />
              Kembali
            </button>

            <button
              onClick={() => navigate('/login')}
              className="w-full px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Ke Halaman Login
            </button>
          </div>

          {/* Info */}
          <p className="text-sm text-gray-500 mt-6">
            Jika Anda merasa ini adalah kesalahan, silakan hubungi administrator sistem.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
