import axios from 'axios';

// Base API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTH API
// ============================================

export const authAPI = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  changePassword: async (oldPassword, newPassword) => {
    const response = await api.put('/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

// ============================================
// CHATBOT API
// ============================================

export const chatbotAPI = {
  sendMessage: async (message, context = {}) => {
    const response = await api.post('/chatbot/ask', { message, context });
    return response.data;
  },

  getHistory: async (limit = 50) => {
    const response = await api.get('/chatbot/history', { params: { limit } });
    return response.data;
  },

  clearHistory: async () => {
    const response = await api.delete('/chatbot/history');
    return response.data;
  },

  getFAQ: async () => {
    const response = await api.get('/chatbot/faq');
    return response.data;
  },
};

// ============================================
// ADMIN API
// ============================================

export const adminAPI = {
  // Dashboard
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // Siswa
  getSiswa: async (params = {}) => {
    const response = await api.get('/admin/siswa', { params });
    return response.data;
  },

  createSiswa: async (data) => {
    const response = await api.post('/admin/siswa', data);
    return response.data;
  },

  updateSiswa: async (id, data) => {
    const response = await api.put(`/admin/siswa/${id}`, data);
    return response.data;
  },

  deleteSiswa: async (id) => {
    const response = await api.delete(`/admin/siswa/${id}`);
    return response.data;
  },

  // Guru
  getGuru: async (params = {}) => {
    const response = await api.get('/admin/guru', { params });
    return response.data;
  },

  createGuru: async (data) => {
    const response = await api.post('/admin/guru', data);
    return response.data;
  },

  updateGuru: async (id, data) => {
    const response = await api.put(`/admin/guru/${id}`, data);
    return response.data;
  },

  deleteGuru: async (id) => {
    const response = await api.delete(`/admin/guru/${id}`);
    return response.data;
  },

  // Kelas
  getKelas: async (params = {}) => {
    const response = await api.get('/admin/kelas', { params });
    return response.data;
  },

  createKelas: async (data) => {
    const response = await api.post('/admin/kelas', data);
    return response.data;
  },

  updateKelas: async (id, data) => {
    const response = await api.put(`/admin/kelas/${id}`, data);
    return response.data;
  },

  deleteKelas: async (id) => {
    const response = await api.delete(`/admin/kelas/${id}`);
    return response.data;
  },

  // Jadwal Pelajaran
  getJadwal: async (params = {}) => {
    const response = await api.get('/admin/jadwal-pelajaran', { params });
    return response.data;
  },

  // Presensi
  getPresensi: async (params = {}) => {
    const response = await api.get('/admin/presensi', { params });
    return response.data;
  },

  // Rapor
  getRapor: async (params = {}) => {
    const response = await api.get('/admin/rapor', { params });
    return response.data;
  },

  // Pembayaran
  getPembayaran: async (params = {}) => {
    const response = await api.get('/admin/pembayaran', { params });
    return response.data;
  },

  // Informasi Umum
  getInformasiUmum: async (params = {}) => {
    const response = await api.get('/admin/informasi-umum', { params });
    return response.data;
  },

  // Reset Password
  resetPassword: async (userId, newPassword) => {
    const response = await api.post('/admin/reset-password', {
      user_id: userId,
      new_password: newPassword
    });
    return response.data;
  },

  // Mata Pelajaran
  getMataPelajaran: async (params = {}) => {
    const response = await api.get('/admin/mata-pelajaran', { params });
    return response.data;
  },

  createMataPelajaran: async (data) => {
    const response = await api.post('/admin/mata-pelajaran', data);
    return response.data;
  },

  updateMataPelajaran: async (id, data) => {
    const response = await api.put(`/admin/mata-pelajaran/${id}`, data);
    return response.data;
  },

  deleteMataPelajaran: async (id) => {
    const response = await api.delete(`/admin/mata-pelajaran/${id}`);
    return response.data;
  },

  // Jadwal Pelajaran
  getJadwalPelajaran: async (params = {}) => {
    const response = await api.get('/admin/jadwal-pelajaran', { params });
    return response.data;
  },

  createJadwalPelajaran: async (data) => {
    const response = await api.post('/admin/jadwal-pelajaran', data);
    return response.data;
  },

  updateJadwalPelajaran: async (id, data) => {
    const response = await api.put(`/admin/jadwal-pelajaran/${id}`, data);
    return response.data;
  },

  deleteJadwalPelajaran: async (id) => {
    const response = await api.delete(`/admin/jadwal-pelajaran/${id}`);
    return response.data;
  },
};

// ============================================
// KEUANGAN API
// ============================================

export const keuanganAPI = {
  // List Pembayaran (Jenis Tagihan)
  getListPembayaran: async (params = {}) => {
    const response = await api.get('/keuangan/list-pembayaran', { params });
    return response.data;
  },

  createListPembayaran: async (data) => {
    const response = await api.post('/keuangan/list-pembayaran', data);
    return response.data;
  },

  updateListPembayaran: async (id, data) => {
    const response = await api.put(`/keuangan/list-pembayaran/${id}`, data);
    return response.data;
  },

  deleteListPembayaran: async (id) => {
    const response = await api.delete(`/keuangan/list-pembayaran/${id}`);
    return response.data;
  },

  // Pembayaran (Transaksi)
  getPembayaran: async (params = {}) => {
    const response = await api.get('/keuangan/pembayaran', { params });
    return response.data;
  },

  approvePembayaran: async (id, status, catatan = '') => {
    const response = await api.post(`/keuangan/pembayaran/${id}/approve`, {
      status,
      catatan
    });
    return response.data;
  },

  deletePembayaran: async (id) => {
    const response = await api.delete(`/keuangan/pembayaran/${id}`);
    return response.data;
  },
};

// ============================================
// INFORMASI API
// ============================================

export const informasiAPI = {
  // Informasi Umum
  getInformasiUmum: async (params = {}) => {
    const response = await api.get('/informasi/umum', { params });
    return response.data;
  },

  getInformasiUmumById: async (id) => {
    const response = await api.get(`/informasi/umum/${id}`);
    return response.data;
  },

  createInformasiUmum: async (data) => {
    const response = await api.post('/informasi/umum', data);
    return response.data;
  },

  updateInformasiUmum: async (id, data) => {
    const response = await api.put(`/informasi/umum/${id}`, data);
    return response.data;
  },

  deleteInformasiUmum: async (id) => {
    const response = await api.delete(`/informasi/umum/${id}`);
    return response.data;
  },

  // Informasi Kelas
  getInformasiKelas: async (params = {}) => {
    const response = await api.get('/informasi/kelas', { params });
    return response.data;
  },

  getInformasiKelasById: async (id) => {
    const response = await api.get(`/informasi/kelas/${id}`);
    return response.data;
  },

  createInformasiKelas: async (data) => {
    const response = await api.post('/informasi/kelas', data);
    return response.data;
  },

  updateInformasiKelas: async (id, data) => {
    const response = await api.put(`/informasi/kelas/${id}`, data);
    return response.data;
  },

  deleteInformasiKelas: async (id) => {
    const response = await api.delete(`/informasi/kelas/${id}`);
    return response.data;
  },
};

// ============================================
// PRESENSI API
// ============================================

export const presensiAPI = {
  // Get all presensi with filters
  getPresensi: async (params = {}) => {
    const response = await api.get('/presensi', { params });
    return response.data;
  },

  // Get presensi by kelas and tanggal
  getPresensiByKelasAndTanggal: async (kelasId, tanggal) => {
    const response = await api.get(`/presensi/kelas/${kelasId}/tanggal/${tanggal}`);
    return response.data;
  },

  // Get presensi by siswa
  getPresensiBySiswa: async (siswaId, params = {}) => {
    const response = await api.get(`/presensi/siswa/${siswaId}`, { params });
    return response.data;
  },

  // Get rekap presensi kelas
  getRekapPresensiKelas: async (kelasId, params = {}) => {
    const response = await api.get(`/presensi/rekap/kelas/${kelasId}`, { params });
    return response.data;
  },

  // Get single presensi
  getPresensiById: async (id) => {
    const response = await api.get(`/presensi/${id}`);
    return response.data;
  },

  // Create/Update single presensi
  createOrUpdatePresensi: async (data) => {
    const response = await api.post('/presensi', data);
    return response.data;
  },

  // Bulk create/update presensi
  bulkCreateOrUpdatePresensi: async (data) => {
    const response = await api.post('/presensi/bulk', data);
    return response.data;
  },

  // Update presensi
  updatePresensi: async (id, data) => {
    const response = await api.put(`/presensi/${id}`, data);
    return response.data;
  },

  // Delete presensi
  deletePresensi: async (id) => {
    const response = await api.delete(`/presensi/${id}`);
    return response.data;
  },
};

// ============================================
// RAPOR API
// ============================================

export const raporAPI = {
  // Get all rapor with filters
  getRapor: async (params = {}) => {
    const response = await api.get('/rapor', { params });
    return response.data;
  },

  // Get rapor by siswa
  getRaporBySiswa: async (siswaId, params = {}) => {
    const response = await api.get(`/rapor/siswa/${siswaId}`, { params });
    return response.data;
  },

  // Get rapor by kelas
  getRaporByKelas: async (kelasId, params = {}) => {
    const response = await api.get(`/rapor/kelas/${kelasId}`, { params });
    return response.data;
  },

  // Get ranking kelas
  getRankingKelas: async (kelasId, params = {}) => {
    const response = await api.get(`/rapor/ranking/kelas/${kelasId}`, { params });
    return response.data;
  },

  // Get single rapor
  getRaporById: async (id) => {
    const response = await api.get(`/rapor/${id}`);
    return response.data;
  },

  // Create rapor
  createRapor: async (data) => {
    const response = await api.post('/rapor', data);
    return response.data;
  },

  // Bulk create rapor
  bulkCreateRapor: async (data) => {
    const response = await api.post('/rapor/bulk', data);
    return response.data;
  },

  // Update rapor
  updateRapor: async (id, data) => {
    const response = await api.put(`/rapor/${id}`, data);
    return response.data;
  },

  // Delete rapor
  deleteRapor: async (id) => {
    const response = await api.delete(`/rapor/${id}`);
    return response.data;
  },
};

// ============================================
// SETTINGS API
// ============================================

export const settingsAPI = {
  // Get akademik aktif (public - accessible by all authenticated users)
  getAkademikAktif: async () => {
    const response = await api.get('/settings/akademik-aktif');
    return response.data;
  },

  // Get all settings
  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },

  // Update akademik settings
  updateSettings: async (data) => {
    const response = await api.put('/settings', data);
    return response.data;
  },

  // Update profil madrasah
  updateProfilMadrasah: async (data) => {
    const response = await api.put('/settings/profil-madrasah', data);
    return response.data;
  },

  // Get profile
  getProfile: async () => {
    const response = await api.get('/settings/profile');
    return response.data;
  },

  // Update profile
  updateProfile: async (data) => {
    const response = await api.put('/settings/profile', data);
    return response.data;
  },

  // Change password
  changePassword: async (data) => {
    const response = await api.post('/settings/change-password', data);
    return response.data;
  },

  // Get activity logs
  getActivityLogs: async (params = {}) => {
    const response = await api.get('/settings/logs', { params });
    return response.data;
  },
};

// ============================================
// GURU API
// ============================================

export const guruAPI = {
  // Get guru dashboard
  getDashboard: async () => {
    const response = await api.get('/guru/dashboard');
    return response.data;
  },

  // Get jadwal mengajar
  getJadwal: async () => {
    const response = await api.get('/guru/jadwal');
    return response.data;
  },

  // Get kelas yang diampu
  getKelasDiampu: async () => {
    const response = await api.get('/guru/kelas');
    return response.data;
  },

  // Get siswa by kelas
  getSiswaByKelas: async (kelasId) => {
    const response = await api.get(`/guru/kelas/${kelasId}/siswa`);
    return response.data;
  },

  // Get mata pelajaran yang diampu
  getMataPelajaranDiampu: async () => {
    const response = await api.get('/guru/mata-pelajaran');
    return response.data;
  },

  // Get profile
  getProfile: async () => {
    const response = await api.get('/guru/profile');
    return response.data;
  },

  // Update profile
  updateProfile: async (data) => {
    const response = await api.put('/guru/profile', data);
    return response.data;
  },

  // Change password
  changePassword: async (data) => {
    const response = await api.put('/guru/change-password', data);
    return response.data;
  },

  // Get info mengajar (jadwal + kelas + mata pelajaran)
  getInfoMengajar: async () => {
    const response = await api.get('/guru/info-mengajar');
    return response.data;
  },

  // Informasi Kelas (untuk wali kelas)
  getInformasiKelas: async () => {
    const response = await api.get('/guru/informasi-kelas');
    return response.data;
  },

  createInformasiKelas: async (data) => {
    const response = await api.post('/guru/informasi-kelas', data);
    return response.data;
  },

  updateInformasiKelas: async (id, data) => {
    const response = await api.put(`/guru/informasi-kelas/${id}`, data);
    return response.data;
  },

  deleteInformasiKelas: async (id) => {
    const response = await api.delete(`/guru/informasi-kelas/${id}`);
    return response.data;
  },
};

// ============================================
// SISWA API
// ============================================

export const siswaAPI = {
  // Get siswa dashboard
  getDashboard: async () => {
    const response = await api.get('/siswa/dashboard');
    return response.data;
  },

  // Get jadwal pelajaran
  getJadwalPelajaran: async () => {
    const response = await api.get('/siswa/jadwal');
    return response.data;
  },

  // Get nilai & rapor
  getNilaiRapor: async () => {
    const response = await api.get('/siswa/nilai');
    return response.data;
  },

  // Get presensi
  getPresensi: async (bulan, tahun) => {
    const params = {};
    if (bulan) params.bulan = bulan;
    if (tahun) params.tahun = tahun;
    const response = await api.get('/siswa/presensi', { params });
    return response.data;
  },

  // Get informasi kelas
  getInformasi: async () => {
    const response = await api.get('/siswa/informasi');
    return response.data;
  },

  // Profile & Settings
  getProfile: async () => {
    const response = await api.get('/siswa/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/siswa/profile', data);
    return response.data;
  },

  changePassword: async (data) => {
    const response = await api.put('/siswa/change-password', data);
    return response.data;
  },

  // Get pembayaran
  getPembayaran: async () => {
    const response = await api.get('/siswa/pembayaran');
    return response.data;
  },

  // Submit pembayaran
  submitPembayaran: async (data) => {
    const response = await api.post('/siswa/pembayaran', data);
    return response.data;
  },
};

export default api;
