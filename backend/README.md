# MIS Ar-Ruhama Backend API

Backend API untuk Sistem Informasi Madrasah Ar-Ruhama dengan fitur **Chatbot NLP**.

---

## 🚀 Teknologi Stack

- **Framework**: Express.js (Node.js)
- **Database**: MySQL dengan Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting
- **NLP**: node-nlp (Natural Language Processing)
- **File Upload**: Multer
- **Validation**: express-validator

---

## 📦 Instalasi

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Environment Variables

File `.env` sudah ada. Pastikan konfigurasi sesuai:

```env
# Server
PORT=5000
NODE_ENV=development

# Database (XAMPP MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=db_madrasah
DB_USER=root
DB_PASSWORD=

# JWT Secret (Generate strong key untuk production!)
JWT_SECRET=mis_arruhama_secret_key_2024_change_this_in_production
JWT_EXPIRES_IN=24h

# Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:5500,http://127.0.0.1:5501

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOGIN_RATE_LIMIT_MAX=5
```

### 3. Setup Database

Pastikan MySQL (XAMPP) sudah running, lalu:

```bash
# Database akan auto-create tables menggunakan Sequelize
npm run dev
```

Sequelize akan otomatis membuat tables berdasarkan models yang ada.

### 4. Jalankan Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server akan berjalan di: `http://localhost:5000`

---


### Fitur NLP:

- ✅ Intent Classification (7 intents)
- ✅ Entity Extraction
- ✅ Confidence Scoring
- ✅ Support Bahasa Indonesia
- ✅ Training API
- ✅ Auto-save model

### Intents yang Tersedia:

1. **greeting** - Sapaan (hai, halo, selamat pagi)
2. **jadwal** - Pertanyaan jadwal pelajaran
3. **nilai** - Pertanyaan nilai/rapor
4. **presensi** - Pertanyaan kehadiran
5. **pembayaran** - Pertanyaan SPP/tagihan
6. **informasi** - Pengumuman sekolah
7. **help** - Bantuan

---

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/login              - Login user
GET    /api/auth/me                 - Get current user profile
PUT    /api/auth/change-password    - Change password
POST   /api/auth/logout             - Logout
```

### Chatbot (🆕 Updated!)
```
POST   /api/chatbot/ask             - Kirim pesan ke chatbot
GET    /api/chatbot/history         - Riwayat chat user
DELETE /api/chatbot/history         - Hapus riwayat chat
GET    /api/chatbot/faq             - Frequently asked questions
POST   /api/chatbot/train           - Train model (Admin only)
GET    /api/chatbot/stats           - Statistik chatbot (Admin only)
```

### Admin - Dashboard
```
GET    /api/admin/dashboard         - Statistik dashboard
```

### Admin - Data Management
```
GET    /api/admin/siswa             - Get all siswa
POST   /api/admin/siswa             - Create siswa
PUT    /api/admin/siswa/:id         - Update siswa
DELETE /api/admin/siswa/:id         - Delete siswa

GET    /api/admin/guru              - Get all guru
POST   /api/admin/guru              - Create guru
PUT    /api/admin/guru/:id          - Update guru
DELETE /api/admin/guru/:id          - Delete guru

GET    /api/admin/kelas             - Get all kelas
GET    /api/admin/jadwal-pelajaran  - Get jadwal
GET    /api/admin/presensi          - Get presensi
GET    /api/admin/rapor             - Get rapor
GET    /api/admin/pembayaran        - Get pembayaran
GET    /api/admin/informasi-umum    - Get informasi
```

---

## 🗂️ Struktur Folder

```
backend/
├── config/
│   ├── database.js          # Sequelize config
│   └── multer.js            # File upload config
├── controllers/
│   ├── authController.js
│   ├── chatbotController.js # ✅ Updated with node-nlp
│   ├── dashboardController.js
│   ├── guruController.js
│   ├── siswaController.js
│   └── ... (other controllers)
├── middlewares/
│   └── auth.js              # JWT verification & role check
├── models/
│   ├── index.js             # Model associations
│   ├── User.js
│   ├── Siswa.js
│   ├── Guru.js
│   ├── ChatbotIntent.js
│   ├── ChatbotResponse.js
│   ├── ChatbotLog.js
│   └── ... (17 models total)
├── routes/
│   ├── auth.routes.js       # ✅ Added login rate limiter
│   ├── chatbot.routes.js
│   └── admin/
│       └── ... (admin routes)
├── services/                 # 🆕 NEW!
│   └── nlpManager.js        # NLP service with node-nlp
├── utils/
│   └── helper.js            # Response helpers
├── uploads/                 # File upload directory
├── .env                     # ✅ Updated with new configs
├── server.js                # ✅ Added security & NLP init
└── package.json
```

---

## 🔑 Role-Based Access

### Admin
- Full access ke semua endpoints
- Manage users, siswa, guru, kelas
- Chatbot analytics & training

### Guru
- View jadwal mengajar
- Input nilai siswa
- View data kelas diampu

### Siswa
- View jadwal pelajaran
- View nilai rapor
- View presensi
- Cek pembayaran
- Chat dengan bot

---

## 🧪 Testing Chatbot

### Contoh Request:

```bash
# Login dulu
POST http://localhost:5000/api/auth/login
{
  "username": "admin",
  "password": "admin123"
}

# Response: { token: "..." }

# Test chatbot (gunakan token)
POST http://localhost:5000/api/chatbot/ask
Headers: Authorization: Bearer <token>
{
  "message": "Jadwal saya hari ini apa?"
}

# Response:
{
  "success": true,
  "data": {
    "message": "📅 Jadwal Pelajaran Anda Hari Senin:\n\n1. Matematika\n   ⏰ 07:00 - 08:30...",
    "data": [...]
  },
  "intent": "jadwal",
  "confidence": 0.92,
  "entities": []
}
```

### Test Intent Lainnya:

```javascript
// Nilai
{ "message": "Berapa nilai matematika saya?" }

// Presensi
{ "message": "Berapa persentase kehadiran saya?" }

// Pembayaran
{ "message": "Status pembayaran SPP saya?" }

// Informasi
{ "message": "Ada pengumuman apa?" }

// Help
{ "message": "Bantuan" }
```

---

## 📊 Database Models

### Core Models:
- **User** - Admin, Guru, Siswa
- **ProfilMadrasah** - Data sekolah
- **Guru** - Data guru
- **Siswa** - Data siswa
- **Kelas** - Data kelas

### Academic Models:
- **MataPelajaran** - Mata pelajaran
- **JadwalPelajaran** - Jadwal
- **Presensi** - Kehadiran
- **Rapor** - Nilai

### Financial Models:
- **ListPembayaran** - Jenis pembayaran
- **Pembayaran** - Transaksi

### Communication Models:
- **InformasiUmum** - Pengumuman
- **InformasiKelas** - Info per kelas

### Chatbot Models:
- **ChatbotIntent** - Intent definitions
- **ChatbotResponse** - Custom responses
- **ChatbotLog** - Chat history

---

## 🛠️ Development Notes

### Generate Strong JWT Secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Ganti `JWT_SECRET` di `.env` dengan hasil output.

### Training NLP Model:

Model akan auto-train saat server start. Untuk retrain:

```bash
POST /api/chatbot/train
{
  "training_data": [
    { "text": "Kapan ujian semester?", "intent": "jadwal" },
    { "text": "Lihat nilai UTS saya", "intent": "nilai" }
  ]
}
```

---

## ✅ Summary Perbaikan Backend

| Item | Status | Keterangan |
|------|--------|-----------|
| Security (Helmet, CORS, Rate Limit) | ✅ DONE | Sudah aman |
| Plain Password Removed | ✅ DONE | Migration dihapus |
| NLP Service (node-nlp) | ✅ DONE | Ganti dari Python ke Node.js |
| Chatbot Response Handlers | ✅ DONE | Semua intent lengkap |
| Login Rate Limiter | ✅ DONE | Max 5 percobaan/15 menit |
| Environment Config | ✅ DONE | .env updated |
| NLP Auto-initialize | ✅ DONE | Load saat server start |

---
