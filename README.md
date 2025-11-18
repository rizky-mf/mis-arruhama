# MIS Ar-Ruhama - Sistem Informasi Madrasah dengan Chatbot MIRA

Sistem Informasi Manajemen Madrasah Ar-Ruhama berbasis web dengan fitur Chatbot MIRA (Madrasah Information & Resource Assistant) yang menggunakan Natural Language Processing (NLP).

## 📋 Deskripsi Project

MIS Ar-Ruhama adalah aplikasi web full-stack untuk mengelola data siswa, guru, nilai, jadwal, presensi, dan informasi madrasah lainnya. Dilengkapi dengan chatbot pintar **MIRA** yang dapat menjawab pertanyaan pengguna secara interaktif menggunakan teknologi NLP.

### Fitur Utama:
- 🔐 **Autentikasi & Otorisasi** dengan JWT
- 👥 **Multi-role System** (Admin, Guru, Siswa)
- 📊 **Dashboard** berbeda untuk setiap role
- 🎓 **Manajemen Data** Siswa, Guru, Kelas, Nilai, Jadwal
- 📝 **Presensi & Absensi**
- 💰 **Manajemen Pembayaran**
- 🤖 **Chatbot MIRA** dengan NLP untuk menjawab pertanyaan secara natural
- 📱 **Responsive Design** (Mobile & Desktop)

---

## 🛠️ Tech Stack

### Frontend:
- **React 18** dengan Vite
- **Tailwind CSS** untuk styling
- **React Router** untuk routing
- **Lucide React** untuk icons
- **Axios** untuk HTTP requests

### Backend:
- **Node.js** dengan Express.js
- **MySQL** sebagai database
- **Sequelize ORM** untuk database management
- **node-nlp v5.0** untuk Natural Language Processing
- **JWT** untuk autentikasi
- **bcrypt** untuk hashing password

---


## 🚀 Cara Menjalankan Aplikasi

### Prerequisites:
Pastikan sudah terinstall:
- **Node.js** versi 16 atau lebih baru
- **MySQL** versi 5.7 atau lebih baru
- **npm** atau **yarn**

---

## 📦 Instalasi

### 1. Clone Repository
```bash
git clone <repository-url>
cd mis-arruhama
```

### 2. Setup Database

**Konfigurasi Database:**

Edit file `backend/config/database.js`:
```javascript
module.exports = {
  development: {
    username: "root",           // Sesuaikan dengan username MySQL Anda
    password: "password",       // Sesuaikan dengan password MySQL Anda
    database: "mis_arruhama",
    host: "127.0.0.1",
    dialect: "mysql"
  }
};
```

### 3. Setup Backend

```bash
cd backend
npm install
```

**Jalankan migrasi database:**
```bash
npx sequelize-cli db:migrate
```

**Jalankan seeder (data dummy):**
```bash
npx sequelize-cli db:seed:all
```

**Jalankan backend server:**
```bash
npm run dev
```

Backend akan berjalan di `http://localhost:5000`

### 4. Setup Frontend

Buka terminal baru, kemudian:

```bash
cd frontend
npm install
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

---

## 🔑 Default Login Credentials

Setelah menjalankan seeder, Anda dapat login dengan akun berikut:

### Admin:
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** Administrator (akses penuh)

---

## 🤖 Chatbot MIRA

**MIRA** (Madrasah Information & Resource Assistant) adalah chatbot pintar yang dapat menjawab pertanyaan dengan bahasa natural menggunakan NLP.

### Intent yang Tersedia:

1. **Greeting** - Perkenalan MIRA
   - Contoh: "halo", "hai", "assalamualaikum"

2. **Jadwal** - Informasi jadwal pelajaran
   - Contoh: "jadwal hari ini", "kapan pelajaran matematika"

3. **Nilai** - Informasi nilai/rapor
   - Contoh: "nilai saya", "rapor semester ini"

4. **Presensi** - Informasi kehadiran
   - Contoh: "absensi bulan ini", "berapa kali saya tidak hadir"

5. **Pembayaran** - Informasi pembayaran SPP
   - Contoh: "tagihan spp", "pembayaran bulan ini"

6. **Informasi** - Informasi umum sekolah
   - Contoh: "info madrasah", "alamat sekolah"

7. **Profil** - Informasi profil user
   - Contoh: "profil saya", "data saya"

8. **DateTime** - Informasi tanggal dan waktu
   - Contoh: "sekarang hari apa", "jam berapa sekarang"

9. **Hapus Chat** - Panduan menghapus riwayat chat
   - Contoh: "hapus chat", "reset percakapan"

10. **Help** - Menu bantuan
    - Contoh: "help", "bantuan", "apa yang bisa kamu lakukan"

### Cara Menggunakan MIRA:
1. Login ke sistem
2. Klik **floating button 🤖** di pojok kanan bawah
3. Ketik pertanyaan dengan bahasa natural (Indonesia/Inggris)
4. MIRA akan memproses dengan NLP dan memberikan jawaban

### Teknologi NLP:
- **Library:** node-nlp v5.0
- **Algorithm:** Naive Bayes Classification
- **Languages:** Indonesian (id), English (en)
- **Training Samples:** 500+ samples
- **Intents:** 15 intent categories
- **Confidence Threshold:** 0.6 (60%)

---

## 📚 API Endpoints

### Authentication:
```
POST   /api/auth/login          # Login user
POST   /api/auth/logout         # Logout user
GET    /api/auth/me             # Get current user
```

### Users:
```
GET    /api/users               # Get all users
GET    /api/users/:id           # Get user by ID
POST   /api/users               # Create new user
PUT    /api/users/:id           # Update user
DELETE /api/users/:id           # Delete user
```

### Siswa:
```
GET    /api/siswa               # Get all siswa
GET    /api/siswa/:id           # Get siswa by ID
POST   /api/siswa               # Create siswa
PUT    /api/siswa/:id           # Update siswa
DELETE /api/siswa/:id           # Delete siswa
```

### Guru:
```
GET    /api/guru                # Get all guru
GET    /api/guru/:id            # Get guru by ID
POST   /api/guru                # Create guru
PUT    /api/guru/:id            # Update guru
DELETE /api/guru/:id            # Delete guru
```

### Chatbot:
```
POST   /api/chatbot/ask         # Send message to MIRA
GET    /api/chatbot/history     # Get chat history
DELETE /api/chatbot/history     # Clear chat history
```

---

## 🎨 Fitur Frontend

### Dashboard Admin:
- Overview statistik (total siswa, guru, kelas)
- Chart data siswa per kelas
- Manajemen user (CRUD)
- Manajemen siswa, guru, kelas
- Monitoring sistem

### Dashboard Guru:
- Kelola data siswa
- Input dan edit nilai
- Presensi siswa
- Lihat jadwal mengajar
- Laporan dan statistik

### Dashboard Siswa:
- Lihat nilai dan rapor
- Lihat jadwal pelajaran
- Lihat absensi/presensi
- Lihat informasi pembayaran
- Profil siswa

### Chatbot Widget:
- Floating button di semua halaman
- Slide-up animation
- Typing indicator
- Clear chat button
- Smooth scroll
- Responsive design

---

## 🔧 Development

### Backend Development:
```bash
cd backend
npm run dev        # Jalankan dengan nodemon (auto-reload)
npm start          # Jalankan production mode
```

### Frontend Development:
```bash
cd frontend
npm run dev        # Jalankan development server
npm run build      # Build untuk production
npm run preview    # Preview production build
```

### Database Commands:
```bash
# Migrasi
npx sequelize-cli db:migrate              # Jalankan migrasi
npx sequelize-cli db:migrate:undo         # Rollback migrasi terakhir
npx sequelize-cli db:migrate:undo:all     # Rollback semua migrasi

# Seeder
npx sequelize-cli db:seed:all             # Jalankan semua seeder
npx sequelize-cli db:seed:undo            # Rollback seeder terakhir
npx sequelize-cli db:seed:undo:all        # Rollback semua seeder

# Generate
npx sequelize-cli model:generate --name NamaModel --attributes field1:type1,field2:type2
npx sequelize-cli seed:generate --name nama-seeder
```

---

## 📝 Environment Variables

Buat file `.env` di folder `backend/`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=mis_arruhama
DB_USER=root
DB_PASSWORD=password

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# NLP
NLP_MODEL_PATH=./models/chatbot-model.nlp
NLP_LANGUAGES=id,en
NLP_CONFIDENCE_THRESHOLD=0.6
```

---

## 🐛 Troubleshooting

### Error: "Cannot connect to MySQL"
- Pastikan MySQL server sudah berjalan
- Cek konfigurasi di `backend/config/database.js`
- Pastikan username dan password benar

### Error: "Port already in use"
- Backend: Ubah PORT di `.env` atau `server.js`
- Frontend: Ubah port di `vite.config.js`

### Chatbot tidak merespon:
- Pastikan file `chatbot-model.nlp` sudah di-generate
- Hapus file model lama, restart backend untuk regenerate
- Cek console log untuk error NLP

### Frontend tidak bisa connect ke Backend:
- Pastikan backend sudah berjalan di port 5000
- Cek `frontend/src/services/api.js` untuk base URL
- Disable CORS browser atau install CORS extension

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Developer

Developed by **[Rizky Maolana Firdaus]** - MIS Ar-Ruhama Development Team

---

