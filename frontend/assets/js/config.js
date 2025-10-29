// assets/js/config.js
// Configuration file untuk aplikasi

// API Configuration
const API_CONFIG = {
    BASE_URL: 'http://localhost:5000/api',
    TIMEOUT: 30000, // 30 seconds
};

// Application Configuration
const APP_CONFIG = {
    NAME: 'MIS Ar-Ruhama',
    VERSION: '1.0.0',
    DESCRIPTION: 'Sistem Informasi Akademik dengan NLP Chatbot',
};

// Storage Keys
const STORAGE_KEYS = {
    TOKEN: 'token',
    USER: 'user',
    THEME: 'theme',
};

// Roles
const ROLES = {
    ADMIN: 'admin',
    GURU: 'guru',
    SISWA: 'siswa',
};

// Routes mapping berdasarkan role
const ROUTES = {
    [ROLES.ADMIN]: {
        dashboard: 'admin/dashboard.html',
        siswa: 'admin/siswa.html',
        guru: 'admin/guru.html',
        kelas: 'admin/kelas.html',
    },
    [ROLES.GURU]: {
        dashboard: 'guru/dashboard.html',
        siswa: 'guru/siswa.html',
        nilai: 'guru/nilai.html',
        presensi: 'guru/presensi.html',
    },
    [ROLES.SISWA]: {
        dashboard: 'siswa/dashboard.html',
        nilai: 'siswa/nilai.html',
        jadwal: 'siswa/jadwal.html',
    },
};

// Pagination
const PAGINATION = {
    DEFAULT_LIMIT: 10,
    OPTIONS: [10, 25, 50, 100],
};

// Date Format
const DATE_FORMAT = {
    DISPLAY: 'DD/MM/YYYY',
    API: 'YYYY-MM-DD',
    DATETIME: 'DD/MM/YYYY HH:mm',
};

// Theme Colors (Emerald Green)
const THEME = {
    PRIMARY: '#10b981',
    PRIMARY_DARK: '#059669',
    SECONDARY: '#34d399',
    SUCCESS: '#10b981',
    WARNING: '#f59e0b',
    DANGER: '#ef4444',
    INFO: '#3b82f6',
};

// Export untuk digunakan di file lain
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        API_CONFIG,
        APP_CONFIG,
        STORAGE_KEYS,
        ROLES,
        ROUTES,
        PAGINATION,
        DATE_FORMAT,
        THEME,
    };
}