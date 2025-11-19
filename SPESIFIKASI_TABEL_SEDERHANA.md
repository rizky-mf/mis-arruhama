# SPESIFIKASI TABEL DATABASE
## Sistem Informasi Madrasah (MIS Ar-Ruhama)

---

## 1. TABEL USERS

Menyimpan data pengguna sistem (admin, guru, siswa)

| No | Nama Field | Tipe data | Panjang | Keterangan |
|----|------------|-----------|---------|------------|
| 1 | id | Int | 11 | Primary Key, Auto Increment |
| 2 | username | Varchar | 100 | Username unik untuk login |
| 3 | password | Varchar | 255 | Password terenkripsi (bcrypt) |
| 4 | plain_password | Varchar | 255 | Password asli (siswa only) |
| 5 | role | Enum | - | admin, guru, siswa |
| 6 | is_active | Boolean | - | Status aktif user |
| 7 | created_at | Datetime | - | Waktu pembuatan |
| 8 | updated_at | Datetime | - | Waktu update terakhir |

**Index:**
- PRIMARY KEY (id)
- UNIQUE KEY (username)
- INDEX (role)

---

## 2. TABEL GURU

Menyimpan data guru

| No | Nama Field | Tipe data | Panjang | Keterangan |
|----|------------|-----------|---------|------------|
| 1 | id | Int | 11 | Primary Key, Auto Increment |
| 2 | user_id | Int | 11 | Foreign Key ke tabel users |
| 3 | nip | Varchar | 50 | Nomor Induk Pegawai (unik) |
| 4 | nama_lengkap | Varchar | 100 | Nama lengkap guru |
| 5 | jenis_kelamin | Enum | - | L (Laki-laki), P (Perempuan) |
| 6 | tanggal_lahir | Date | - | Tanggal lahir |
| 7 | alamat | Text | - | Alamat lengkap |
| 8 | telepon | Varchar | 20 | Nomor telepon |
| 9 | email | Varchar | 100 | Email guru |
| 10 | foto | Varchar | 255 | Path foto profil |
| 11 | created_at | Datetime | - | Waktu pembuatan |
| 12 | updated_at | Datetime | - | Waktu update terakhir |

**Index:**
- PRIMARY KEY (id)
- UNIQUE KEY (user_id)
- UNIQUE KEY (nip)
- INDEX (nip)

**Relasi:**
- user_id → users.id (CASCADE)

---

## 3. TABEL SISWA

Menyimpan data siswa

| No | Nama Field | Tipe data | Panjang | Keterangan |
|----|------------|-----------|---------|------------|
| 1 | id | Int | 11 | Primary Key, Auto Increment |
| 2 | user_id | Int | 11 | Foreign Key ke tabel users |
| 3 | nisn | Varchar | 20 | Nomor Induk Siswa Nasional (unik) |
| 4 | nama_lengkap | Varchar | 100 | Nama lengkap siswa |
| 5 | jenis_kelamin | Enum | - | L (Laki-laki), P (Perempuan) |
| 6 | tanggal_lahir | Date | - | Tanggal lahir |
| 7 | alamat | Text | - | Alamat lengkap |
| 8 | nama_orang_tua | Varchar | 100 | Nama orang tua/wali |
| 9 | telepon_orang_tua | Varchar | 20 | Nomor telepon orang tua |
| 10 | kelas_id | Int | 11 | Foreign Key ke tabel kelas |
| 11 | foto | Varchar | 255 | Path foto profil |
| 12 | status | Enum | - | aktif, lulus, pindah |
| 13 | created_at | Datetime | - | Waktu pembuatan |
| 14 | updated_at | Datetime | - | Waktu update terakhir |

**Index:**
- PRIMARY KEY (id)
- UNIQUE KEY (user_id)
- UNIQUE KEY (nisn)
- INDEX (nisn)
- INDEX (kelas_id)
- INDEX (status)

**Relasi:**
- user_id → users.id (CASCADE)
- kelas_id → kelas.id (SET NULL)

---

## 4. TABEL KELAS

Menyimpan data kelas

| No | Nama Field | Tipe data | Panjang | Keterangan |
|----|------------|-----------|---------|------------|
| 1 | id | Int | 11 | Primary Key, Auto Increment |
| 2 | nama_kelas | Varchar | 20 | Nama kelas (contoh: 7A, 8B, 9C) |
| 3 | tingkat | Int | 11 | Tingkat kelas (7, 8, 9) |
| 4 | guru_id | Int | 11 | Foreign Key ke tabel guru (wali kelas) |
| 5 | tahun_ajaran | Varchar | 20 | Tahun ajaran (contoh: 2023/2024) |
| 6 | created_at | Datetime | - | Waktu pembuatan |
| 7 | updated_at | Datetime | - | Waktu update terakhir |

**Index:**
- PRIMARY KEY (id)
- UNIQUE KEY (nama_kelas)

**Relasi:**
- guru_id → guru.id (SET NULL)

---

## 5. TABEL MATA_PELAJARAN

Menyimpan data mata pelajaran

| No | Nama Field | Tipe data | Panjang | Keterangan |
|----|------------|-----------|---------|------------|
| 1 | id | Int | 11 | Primary Key, Auto Increment |
| 2 | kode_mapel | Varchar | 20 | Kode mata pelajaran (unik) |
| 3 | nama_mapel | Varchar | 100 | Nama mata pelajaran |
| 4 | tingkat | Int | 11 | Tingkat kelas (0=semua, 7, 8, 9) |
| 5 | deskripsi | Text | - | Deskripsi mata pelajaran |
| 6 | created_at | Datetime | - | Waktu pembuatan |
| 7 | updated_at | Datetime | - | Waktu update terakhir |

**Index:**
- PRIMARY KEY (id)
- UNIQUE KEY (kode_mapel)

---

## 6. TABEL JADWAL_PELAJARAN

Menyimpan jadwal pelajaran kelas

| No | Nama Field | Tipe data | Panjang | Keterangan |
|----|------------|-----------|---------|------------|
| 1 | id | Int | 11 | Primary Key, Auto Increment |
| 2 | kelas_id | Int | 11 | Foreign Key ke tabel kelas |
| 3 | mata_pelajaran_id | Int | 11 | Foreign Key ke tabel mata_pelajaran |
| 4 | guru_id | Int | 11 | Foreign Key ke tabel guru |
| 5 | hari | Enum | - | Senin, Selasa, Rabu, Kamis, Jumat, Sabtu |
| 6 | jam_mulai | Time | - | Jam mulai pelajaran |
| 7 | jam_selesai | Time | - | Jam selesai pelajaran |
| 8 | ruangan | Varchar | 50 | Nama ruangan |
| 9 | created_at | Datetime | - | Waktu pembuatan |
| 10 | updated_at | Datetime | - | Waktu update terakhir |

**Index:**
- PRIMARY KEY (id)

**Relasi:**
- kelas_id → kelas.id
- mata_pelajaran_id → mata_pelajaran.id
- guru_id → guru.id

---

## 7. TABEL LIST_PEMBAYARAN

Menyimpan jenis/list pembayaran

| No | Nama Field | Tipe data | Panjang | Keterangan |
|----|------------|-----------|---------|------------|
| 1 | id | Int | 11 | Primary Key, Auto Increment |
| 2 | nama_pembayaran | Varchar | 100 | Nama jenis pembayaran |
| 3 | nominal | Decimal | 15,2 | Nominal pembayaran |
| 4 | periode | Enum | - | bulanan, semester, tahunan |
| 5 | tingkat | Int | 11 | Tingkat kelas (0=semua, 7, 8, 9) |
| 6 | deskripsi | Text | - | Deskripsi pembayaran |
| 7 | status | Enum | - | aktif, nonaktif |
| 8 | created_at | Datetime | - | Waktu pembuatan |
| 9 | updated_at | Datetime | - | Waktu update terakhir |

**Index:**
- PRIMARY KEY (id)

---

## 8. TABEL PEMBAYARAN

Menyimpan transaksi pembayaran siswa

| No | Nama Field | Tipe data | Panjang | Keterangan |
|----|------------|-----------|---------|------------|
| 1 | id | Int | 11 | Primary Key, Auto Increment |
| 2 | siswa_id | Int | 11 | Foreign Key ke tabel siswa |
| 3 | list_pembayaran_id | Int | 11 | Foreign Key ke tabel list_pembayaran |
| 4 | jumlah_bayar | Decimal | 15,2 | Jumlah yang dibayarkan |
| 5 | tanggal_bayar | Date | - | Tanggal pembayaran |
| 6 | bukti_bayar | Varchar | 255 | Path file bukti bayar |
| 7 | status | Enum | - | pending, approved, rejected |
| 8 | approved_by | Int | 11 | Foreign Key ke users (yang approve) |
| 9 | approved_at | Datetime | - | Waktu approval |
| 10 | catatan | Text | - | Catatan pembayaran |
| 11 | created_at | Datetime | - | Waktu pembuatan |
| 12 | updated_at | Datetime | - | Waktu update terakhir |

**Index:**
- PRIMARY KEY (id)

**Relasi:**
- siswa_id → siswa.id
- list_pembayaran_id → list_pembayaran.id
- approved_by → users.id

---

## 9. TABEL PRESENSI

Menyimpan data kehadiran siswa

| No | Nama Field | Tipe data | Panjang | Keterangan |
|----|------------|-----------|---------|------------|
| 1 | id | Int | 11 | Primary Key, Auto Increment |
| 2 | siswa_id | Int | 11 | Foreign Key ke tabel siswa |
| 3 | kelas_id | Int | 11 | Foreign Key ke tabel kelas |
| 4 | tanggal | Date | - | Tanggal presensi |
| 5 | status | Enum | - | hadir, sakit, izin, alpa |
| 6 | keterangan | Text | - | Keterangan tambahan |
| 7 | created_by | Int | 11 | Foreign Key ke users (yang input) |
| 8 | created_at | Datetime | - | Waktu pembuatan |
| 9 | updated_at | Datetime | - | Waktu update terakhir |

**Index:**
- PRIMARY KEY (id)

**Relasi:**
- siswa_id → siswa.id
- kelas_id → kelas.id
- created_by → users.id

---

## 10. TABEL RAPOR

Menyimpan nilai rapor siswa

| No | Nama Field | Tipe data | Panjang | Keterangan |
|----|------------|-----------|---------|------------|
| 1 | id | Int | 11 | Primary Key, Auto Increment |
| 2 | siswa_id | Int | 11 | Foreign Key ke tabel siswa |
| 3 | mata_pelajaran_id | Int | 11 | Foreign Key ke tabel mata_pelajaran |
| 4 | kelas_id | Int | 11 | Foreign Key ke tabel kelas |
| 5 | semester | Enum | - | 1, 2, Ganjil, Genap |
| 6 | tahun_ajaran | Varchar | 20 | Tahun ajaran (contoh: 2023/2024) |
| 7 | nilai_harian | Decimal | 5,2 | Nilai tugas harian |
| 8 | nilai_uts | Decimal | 5,2 | Nilai Ujian Tengah Semester |
| 9 | nilai_uas | Decimal | 5,2 | Nilai Ujian Akhir Semester |
| 10 | nilai_akhir | Decimal | 5,2 | Nilai akhir (hasil perhitungan) |
| 11 | predikat | Varchar | 2 | Predikat nilai (A, B, C, D, E) |
| 12 | catatan | Text | - | Catatan guru |
| 13 | created_by | Int | 11 | Foreign Key ke users (yang input) |
| 14 | created_at | Datetime | - | Waktu pembuatan |
| 15 | updated_at | Datetime | - | Waktu update terakhir |

**Index:**
- PRIMARY KEY (id)

**Relasi:**
- siswa_id → siswa.id
- mata_pelajaran_id → mata_pelajaran.id
- kelas_id → kelas.id
- created_by → users.id

---

## 11. TABEL INFORMASI_UMUM

Menyimpan informasi umum madrasah

| No | Nama Field | Tipe data | Panjang | Keterangan |
|----|------------|-----------|---------|------------|
| 1 | id | Int | 11 | Primary Key, Auto Increment |
| 2 | judul | Varchar | 255 | Judul informasi |
| 3 | konten | Text | - | Konten/isi informasi |
| 4 | jenis | Enum | - | event, libur, pengumuman |
| 5 | tanggal_mulai | Date | - | Tanggal mulai event/libur |
| 6 | tanggal_selesai | Date | - | Tanggal selesai event/libur |
| 7 | created_by | Int | 11 | Foreign Key ke users (yang buat) |
| 8 | created_at | Datetime | - | Waktu pembuatan |
| 9 | updated_at | Datetime | - | Waktu update terakhir |

**Index:**
- PRIMARY KEY (id)

**Relasi:**
- created_by → users.id

---

## 12. TABEL INFORMASI_KELAS

Menyimpan informasi khusus kelas

| No | Nama Field | Tipe data | Panjang | Keterangan |
|----|------------|-----------|---------|------------|
| 1 | id | Int | 11 | Primary Key, Auto Increment |
| 2 | kelas_id | Int | 11 | Foreign Key ke tabel kelas |
| 3 | guru_id | Int | 11 | Foreign Key ke tabel guru (pembuat) |
| 4 | judul | Varchar | 255 | Judul informasi |
| 5 | konten | Text | - | Konten/isi informasi |
| 6 | created_at | Datetime | - | Waktu pembuatan |
| 7 | updated_at | Datetime | - | Waktu update terakhir |

**Index:**
- PRIMARY KEY (id)

**Relasi:**
- kelas_id → kelas.id
- guru_id → guru.id

---

## 13. TABEL PROFIL_MADRASAH

Menyimpan profil madrasah (single row)

| No | Nama Field | Tipe data | Panjang | Keterangan |
|----|------------|-----------|---------|------------|
| 1 | id | Int | 11 | Primary Key, Auto Increment |
| 2 | nama_madrasah | Varchar | 255 | Nama madrasah |
| 3 | alamat | Text | - | Alamat lengkap madrasah |
| 4 | telepon | Varchar | 20 | Nomor telepon madrasah |
| 5 | email | Varchar | 100 | Email madrasah |
| 6 | kepala_sekolah | Varchar | 100 | Nama kepala sekolah |
| 7 | visi | Text | - | Visi madrasah |
| 8 | misi | Text | - | Misi madrasah |
| 9 | logo | Varchar | 255 | Path file logo madrasah |
| 10 | updated_at | Datetime | - | Waktu update terakhir |

**Index:**
- PRIMARY KEY (id)

---

## 14. TABEL SETTINGS

Menyimpan pengaturan sistem

| No | Nama Field | Tipe data | Panjang | Keterangan |
|----|------------|-----------|---------|------------|
| 1 | id | Int | 11 | Primary Key, Auto Increment |
| 2 | key | Varchar | 100 | Key setting (unik) |
| 3 | value | Text | - | Value setting |
| 4 | description | Varchar | 255 | Deskripsi setting |
| 5 | updated_at | Datetime | - | Waktu update terakhir |

**Index:**
- PRIMARY KEY (id)
- UNIQUE KEY (key)

**Contoh Data:**
- key: `tahun_ajaran_aktif`, value: `2023/2024`
- key: `semester_aktif`, value: `Ganjil`

---

## 15. TABEL ACTIVITY_LOGS

Menyimpan log aktivitas user

| No | Nama Field | Tipe data | Panjang | Keterangan |
|----|------------|-----------|---------|------------|
| 1 | id | Int | 11 | Primary Key, Auto Increment |
| 2 | user_id | Int | 11 | Foreign Key ke tabel users |
| 3 | username | Varchar | 100 | Username (untuk referensi cepat) |
| 4 | action | Varchar | 50 | Jenis aksi (Login, Create, Update, Delete) |
| 5 | description | Text | - | Deskripsi detail aksi |
| 6 | ip_address | Varchar | 45 | IP address user |
| 7 | user_agent | Text | - | Browser user agent |
| 8 | created_at | Datetime | - | Waktu pembuatan log |

**Index:**
- PRIMARY KEY (id)
- INDEX (user_id)
- INDEX (action)
- INDEX (created_at)

**Relasi:**
- user_id → users.id

---

## 16. TABEL CHATBOT_INTENTS

Menyimpan intent chatbot

| No | Nama Field | Tipe data | Panjang | Keterangan |
|----|------------|-----------|---------|------------|
| 1 | id | Int | 11 | Primary Key, Auto Increment |
| 2 | intent_name | Varchar | 100 | Nama intent (unik) |
| 3 | description | Text | - | Deskripsi intent |
| 4 | created_at | Datetime | - | Waktu pembuatan |
| 5 | updated_at | Datetime | - | Waktu update terakhir |

**Index:**
- PRIMARY KEY (id)
- UNIQUE KEY (intent_name)

**Contoh Data:**
- `greeting`, `jadwal_pelajaran`, `info_pembayaran`, `cara_login`

---

## 17. TABEL CHATBOT_RESPONSES

Menyimpan response chatbot

| No | Nama Field | Tipe data | Panjang | Keterangan |
|----|------------|-----------|---------|------------|
| 1 | id | Int | 11 | Primary Key, Auto Increment |
| 2 | intent_id | Int | 11 | Foreign Key ke tabel chatbot_intents |
| 3 | response_text | Text | - | Teks response |
| 4 | priority | Int | 11 | Prioritas response (default: 1) |
| 5 | created_at | Datetime | - | Waktu pembuatan |
| 6 | updated_at | Datetime | - | Waktu update terakhir |

**Index:**
- PRIMARY KEY (id)

**Relasi:**
- intent_id → chatbot_intents.id

---

## 18. TABEL CHATBOT_LOGS

Menyimpan log percakapan chatbot

| No | Nama Field | Tipe data | Panjang | Keterangan |
|----|------------|-----------|---------|------------|
| 1 | id | Int | 11 | Primary Key, Auto Increment |
| 2 | user_id | Int | 11 | Foreign Key ke tabel users |
| 3 | user_message | Text | - | Pesan dari user |
| 4 | bot_response | Text | - | Response dari bot |
| 5 | intent_id | Int | 11 | Foreign Key ke chatbot_intents |
| 6 | confidence_score | Decimal | 5,4 | Confidence score NLP (0-1) |
| 7 | created_at | Datetime | - | Waktu percakapan |

**Index:**
- PRIMARY KEY (id)

**Relasi:**
- user_id → users.id
- intent_id → chatbot_intents.id

---

## RINGKASAN DATABASE

**Total Tabel:** 18 tabel

### Kategori Tabel:

#### A. TABEL CORE (4 tabel)
1. users
2. guru
3. siswa
4. kelas

#### B. TABEL AKADEMIK (4 tabel)
5. mata_pelajaran
6. jadwal_pelajaran
7. presensi
8. rapor

#### C. TABEL KEUANGAN (2 tabel)
9. list_pembayaran
10. pembayaran

#### D. TABEL INFORMASI (3 tabel)
11. informasi_umum
12. informasi_kelas
13. profil_madrasah

#### E. TABEL CHATBOT (3 tabel)
14. chatbot_intents
15. chatbot_responses
16. chatbot_logs

#### F. TABEL SISTEM (2 tabel)
17. settings
18. activity_logs

---

## DIAGRAM RELASI UTAMA

```
users (1) ─→ (1) guru
users (1) ─→ (1) siswa
users (1) ─→ (*) activity_logs
users (1) ─→ (*) chatbot_logs

guru (1) ─→ (*) kelas (sebagai wali kelas)
guru (1) ─→ (*) jadwal_pelajaran
guru (1) ─→ (*) informasi_kelas

kelas (1) ─→ (*) siswa
kelas (1) ─→ (*) jadwal_pelajaran
kelas (1) ─→ (*) presensi
kelas (1) ─→ (*) rapor

siswa (1) ─→ (*) pembayaran
siswa (1) ─→ (*) presensi
siswa (1) ─→ (*) rapor

mata_pelajaran (1) ─→ (*) jadwal_pelajaran
mata_pelajaran (1) ─→ (*) rapor

list_pembayaran (1) ─→ (*) pembayaran

chatbot_intents (1) ─→ (*) chatbot_responses
chatbot_intents (1) ─→ (*) chatbot_logs
```

---

## CATATAN PENTING

1. **Enkripsi Password**: Tabel `users` menggunakan bcrypt untuk enkripsi password
2. **Soft Delete**: Tidak ada soft delete, menggunakan status untuk menonaktifkan data
3. **Timestamps**: Hampir semua tabel memiliki `created_at` dan `updated_at`
4. **Foreign Keys**: Menggunakan CASCADE atau SET NULL sesuai kebutuhan
5. **Enum Types**: Digunakan untuk field dengan nilai terbatas
6. **Decimal Precision**: Nilai (15,2) untuk nominal uang, (5,2) untuk nilai akademik, (5,4) untuk confidence score

---

**Dibuat:** 2024
**Database Engine:** MySQL/MariaDB
**ORM:** Sequelize
**Charset:** utf8mb4
**Collation:** utf8mb4_unicode_ci
