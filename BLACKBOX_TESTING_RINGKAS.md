# 📋 BLACKBOX TESTING - VERSI RINGKAS
# Sistem Informasi Manajemen MIS Ar-Ruhama

**Tanggal Pembuatan:** 2025-01-15
**Versi Aplikasi:** 1.0
**Tester:** _________________

---

## 1. PENGUJIAN LOGIN & LOGOUT

### Tabel 1.1 Pengujian Login

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Input *username* dan *password* sesuai milik admin | Masuk ke halaman dashboard admin | Menampilkan halaman dashboard admin | (√) Diterima<br>(..X) Ditolak |
| Input *username* dan *password* sesuai milik guru | Masuk ke halaman dashboard guru | Menampilkan halaman dashboard guru | (√) Diterima<br>(..X) Ditolak |
| Input *username* dan *password* sesuai milik siswa | Masuk ke halaman dashboard siswa | Menampilkan halaman dashboard siswa | (√) Diterima<br>(..X) Ditolak |
| Input *username* dan *password* salah/tidak sesuai | Tidak dapat *Login*, muncul pesan kesalahan | Muncul pesan kesalahan | (..X) Diterima<br>(√) Ditolak |
| Klik tombol *Logout* | Keluar dari sistem, kembali ke halaman login | Berhasil logout dan redirect | (√) Diterima<br>(..X) Ditolak |

---

## 2. PENGUJIAN ROLE ADMIN

### Tabel 2.1 Pengujian Data Guru (Data Benar)

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Klik "Tambah Guru", isi semua field valid (NIP, Nama, Email, Telepon), simpan | Data guru tersimpan dan muncul di tabel | Data tersimpan di database | (√) Diterima<br>(..X) Ditolak |
| Klik "Edit" pada guru, ubah Nama dengan data valid, simpan | Data guru terupdate | Data terupdate di tabel | (√) Diterima<br>(..X) Ditolak |
| Klik "Hapus" pada guru, konfirmasi | Data guru terhapus | Data terhapus dari database | (√) Diterima<br>(..X) Ditolak |
| Klik "Reset Password" pada guru | Password direset ke default (NIP) | Password berhasil direset | (√) Diterima<br>(..X) Ditolak |

### Tabel 2.2 Pengujian Data Guru (Data Salah)

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Klik "Tambah Guru", field NIP kosong, simpan | Muncul pesan validasi "NIP required" | Sistem menampilkan error validasi | (..X) Diterima<br>(√) Ditolak |
| Klik "Tambah Guru", field Nama Lengkap kosong, simpan | Muncul pesan validasi "Nama required" | Sistem menampilkan error validasi | (..X) Diterima<br>(√) Ditolak |
| Input email dengan format salah (tanpa @), simpan | Muncul pesan validasi "Email tidak valid" | Sistem menampilkan error validasi | (..X) Diterima<br>(√) Ditolak |
| Input NIP yang sudah ada (duplikat), simpan | Muncul pesan error "NIP sudah terdaftar" | Sistem menolak data duplikat | (..X) Diterima<br>(√) Ditolak |

### Tabel 2.3 Pengujian Data Siswa (Data Benar)

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Klik "Tambah Siswa", isi field valid (NIS, Nama, Kelas, Tanggal Lahir), simpan | Data siswa tersimpan dan muncul di tabel | Data tersimpan di database | (√) Diterima<br>(..X) Ditolak |
| Klik "Edit" pada siswa, ubah Kelas dengan data valid, simpan | Data siswa terupdate | Data terupdate di tabel | (√) Diterima<br>(..X) Ditolak |
| Klik "Hapus" pada siswa, konfirmasi | Data siswa terhapus | Data terhapus dari database | (√) Diterima<br>(..X) Ditolak |
| Klik "Reset Password" pada siswa | Password direset ke default (NIS) | Password berhasil direset | (√) Diterima<br>(..X) Ditolak |

### Tabel 2.4 Pengujian Data Siswa (Data Salah)

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Klik "Tambah Siswa", field NIS kosong, simpan | Muncul pesan validasi "NIS required" | Sistem menampilkan error validasi | (..X) Diterima<br>(√) Ditolak |
| Klik "Tambah Siswa", field Nama Lengkap kosong, simpan | Muncul pesan validasi "Nama required" | Sistem menampilkan error validasi | (..X) Diterima<br>(√) Ditolak |
| Klik "Tambah Siswa", Kelas tidak dipilih, simpan | Muncul pesan validasi "Kelas required" | Sistem menampilkan error validasi | (..X) Diterima<br>(√) Ditolak |
| Input NIS yang sudah ada (duplikat), simpan | Muncul pesan error "NIS sudah terdaftar" | Sistem menolak data duplikat | (..X) Diterima<br>(√) Ditolak |

### Tabel 2.5 Pengujian Data Kelas (Data Benar)

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Klik "Tambah Kelas", isi field valid (Nama Kelas, Tingkat, Tahun Ajaran, Wali Kelas), simpan | Data kelas tersimpan | Kelas muncul di tabel | (√) Diterima<br>(..X) Ditolak |
| Klik "Edit" pada kelas, ubah Wali Kelas dengan data valid, simpan | Data kelas terupdate | Data terupdate di tabel | (√) Diterima<br>(..X) Ditolak |
| Klik "Hapus" pada kelas yang tidak memiliki siswa | Kelas terhapus | Data terhapus dari database | (√) Diterima<br>(..X) Ditolak |

### Tabel 2.6 Pengujian Data Kelas (Data Salah)

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Klik "Tambah Kelas", field Nama Kelas kosong, simpan | Muncul validasi error "Nama kelas required" | Sistem menampilkan error | (..X) Diterima<br>(√) Ditolak |
| Klik "Tambah Kelas", field Tingkat kosong, simpan | Muncul validasi error "Tingkat required" | Sistem menampilkan error | (..X) Diterima<br>(√) Ditolak |
| Klik "Hapus" pada kelas yang memiliki siswa | Muncul error "Tidak bisa hapus, kelas masih memiliki siswa" | Sistem mencegah penghapusan | (..X) Diterima<br>(√) Ditolak |

### Tabel 2.7 Pengujian Mata Pelajaran (Data Benar)

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Klik "Tambah Mata Pelajaran", isi field valid (Kode, Nama Mapel), simpan | Data mapel tersimpan | Mapel muncul di tabel | (√) Diterima<br>(..X) Ditolak |
| Klik "Edit" pada mapel, ubah Nama dengan data valid, simpan | Data mapel terupdate | Data terupdate di tabel | (√) Diterima<br>(..X) Ditolak |
| Klik "Hapus" pada mapel yang belum digunakan | Mapel terhapus | Data terhapus dari database | (√) Diterima<br>(..X) Ditolak |

### Tabel 2.8 Pengujian Mata Pelajaran (Data Salah)

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Klik "Tambah Mata Pelajaran", field Kode Mapel kosong, simpan | Muncul validasi error "Kode mapel required" | Sistem menampilkan error | (..X) Diterima<br>(√) Ditolak |
| Klik "Tambah Mata Pelajaran", field Nama Mapel kosong, simpan | Muncul validasi error "Nama mapel required" | Sistem menampilkan error | (..X) Diterima<br>(√) Ditolak |
| Input kode mapel yang sudah ada (duplikat), simpan | Muncul error "Kode mapel sudah ada" | Sistem menolak duplikat | (..X) Diterima<br>(√) Ditolak |

### Tabel 2.9 Pengujian Jadwal Pelajaran Visual Grid (Data Benar)

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Pilih Tingkat & Kelas | Grid 7×8 muncul dengan hari dan slot waktu | Grid tampil dengan benar | (√) Diterima<br>(..X) Ditolak |
| Check cell UPACARA (Senin slot 1) | Cell kuning dengan text "UPACARA", disabled | Cell UPACARA tampil benar | (√) Diterima<br>(..X) Ditolak |
| Check cell ISTIRAHAT (slot 09:20-09:55) | Cell abu-abu dengan text "ISTIRAHAT", disabled | Cell ISTIRAHAT tampil benar | (√) Diterima<br>(..X) Ditolak |
| Klik cell kosong, pilih Mapel & Guru valid, simpan | Cell berubah warna dengan nama mapel + guru | Jadwal tersimpan dan grid terupdate | (√) Diterima<br>(..X) Ditolak |
| Klik cell yang ada jadwal, ubah Mapel dengan data valid, simpan | Jadwal terupdate, warna cell berubah | Data terupdate dan grid refresh | (√) Diterima<br>(..X) Ditolak |
| Klik cell jadwal, klik "Hapus", konfirmasi | Jadwal terhapus, cell kembali putih | Data terhapus dari database | (√) Diterima<br>(..X) Ditolak |
| Tambah beberapa jadwal dengan mapel berbeda | Setiap mapel memiliki warna konsisten | Color coding bekerja | (√) Diterima<br>(..X) Ditolak |

### Tabel 2.10 Pengujian Jadwal Pelajaran Visual Grid (Data Salah)

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Klik cell kosong, tidak pilih Mata Pelajaran, klik "Simpan" | Muncul validasi error "Mata pelajaran required" | Sistem menampilkan error | (..X) Diterima<br>(√) Ditolak |
| Klik cell kosong, tidak pilih Guru, klik "Simpan" | Muncul validasi error "Guru required" | Sistem menampilkan error | (..X) Diterima<br>(√) Ditolak |

### Tabel 2.11 Pengujian Pembayaran (Data Benar)

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Klik "Tambah Pembayaran", pilih Siswa, Jenis, input Jumlah valid, simpan | Data pembayaran tersimpan | Pembayaran muncul di tabel | (√) Diterima<br>(..X) Ditolak |
| Klik "Edit" pada pembayaran, ubah Jumlah dengan angka valid, simpan | Data pembayaran terupdate | Data terupdate di tabel | (√) Diterima<br>(..X) Ditolak |
| Klik "Hapus" pada pembayaran, konfirmasi | Pembayaran terhapus | Data terhapus dari database | (√) Diterima<br>(..X) Ditolak |

### Tabel 2.12 Pengujian Pembayaran (Data Salah)

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Klik "Tambah Pembayaran", Siswa tidak dipilih, simpan | Muncul validasi error "Siswa required" | Sistem menampilkan error | (..X) Diterima<br>(√) Ditolak |
| Input jumlah dengan karakter non-numerik (huruf), simpan | Muncul validasi error "Jumlah harus angka" | Sistem menampilkan error | (..X) Diterima<br>(√) Ditolak |
| Input jumlah negatif atau 0, simpan | Muncul validasi error "Jumlah harus > 0" | Sistem menampilkan error | (..X) Diterima<br>(√) Ditolak |

### Tabel 2.13 Pengujian Presensi (Data Benar)

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Pilih Kelas & Tanggal, pilih status "Hadir", simpan | Status presensi tersimpan | Data tersimpan di database | (√) Diterima<br>(..X) Ditolak |
| Pilih status "Sakit", input keterangan valid, simpan | Status dan keterangan tersimpan | Data tersimpan dengan keterangan | (√) Diterima<br>(..X) Ditolak |

### Tabel 2.14 Pengujian Ranking Kelas (Data Benar)

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Pilih Kelas, klik "Tampilkan Ranking" | Menampilkan tabel ranking siswa berdasarkan rata-rata nilai (urut tertinggi ke terendah) | Ranking tampil dengan benar | (√) Diterima<br>(..X) Ditolak |
| Check kolom ranking | Ranking 1 (gold medal 🥇), Ranking 2 (silver medal 🥈), Ranking 3 (bronze medal 🥉), sisanya nomor biasa | Icon medali tampil benar | (√) Diterima<br>(..X) Ditolak |
| Check data ranking | Menampilkan: Ranking, NISN, Nama Siswa, Jumlah Mapel, Rata-rata Nilai, Status (Sangat Baik/Baik/Cukup) | Data lengkap dan akurat | (√) Diterima<br>(..X) Ditolak |
| Check periode aktif | Menampilkan periode aktif yang diatur di menu Pengaturan (e.g., "2025/2026 - Semester Ganjil") | Periode tampil sesuai | (√) Diterima<br>(..X) Ditolak |
| Check total siswa | Menampilkan "Total Siswa" dan "Siswa dengan Nilai" di bagian atas tabel | Counter tampil dengan benar | (√) Diterima<br>(..X) Ditolak |

---

## 3. PENGUJIAN ROLE GURU

### Tabel 3.1 Pengujian Dashboard Guru

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Login sebagai guru, akses dashboard | Menampilkan: Jadwal hari ini, Kelas yang diampu, Tugas pending | Dashboard tampil dengan data yang benar | (√) Diterima<br>(..X) Ditolak |
| Check "Jadwal Mengajar Hari Ini" | Menampilkan jadwal sesuai hari login | Jadwal tampil sesuai | (√) Diterima<br>(..X) Ditolak |

### Tabel 3.2 Pengujian Input Nilai (Data Benar)

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Pilih kelas & mapel, input nilai siswa (0-100), simpan | Nilai tersimpan, counter "Tugas Pending" berkurang | Nilai tersimpan dan dashboard terupdate | (√) Diterima<br>(..X) Ditolak |

### Tabel 3.3 Pengujian Input Nilai (Data Salah)

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Input nilai di luar range (>100), simpan | Muncul validasi error "Nilai harus 0-100" | Sistem menampilkan error | (..X) Diterima<br>(√) Ditolak |
| Input nilai negatif (<0), simpan | Muncul validasi error "Nilai harus 0-100" | Sistem menampilkan error | (..X) Diterima<br>(√) Ditolak |
| Input nilai dengan karakter non-numerik (huruf), simpan | Muncul validasi error "Nilai harus angka" | Sistem menampilkan error | (..X) Diterima<br>(√) Ditolak |

### Tabel 3.4 Pengujian Presensi (Guru)

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Pilih kelas, input presensi siswa (Hadir/Sakit/Izin/Alpha), simpan | Presensi tersimpan | Data tersimpan di database | (√) Diterima<br>(..X) Ditolak |

### Tabel 3.5 Pengujian Lihat Jadwal (Guru)

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Akses menu "Jadwal Mengajar" | Menampilkan jadwal mengajar guru (semua kelas & hari) | Jadwal tampil dengan benar | (√) Diterima<br>(..X) Ditolak |

---

## 4. PENGUJIAN ROLE SISWA

### Tabel 4.1 Pengujian Dashboard Siswa

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Login sebagai siswa, akses dashboard | Menampilkan: Profil, Jadwal kelas, Nilai, Riwayat pembayaran | Dashboard tampil dengan data yang benar | (√) Diterima<br>(..X) Ditolak |

### Tabel 4.2 Pengujian Lihat Jadwal (Siswa)

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Akses menu "Jadwal Saya" | Menampilkan jadwal kelas dalam format grid/list | Jadwal tampil sesuai kelas siswa | (√) Diterima<br>(..X) Ditolak |

### Tabel 4.3 Pengujian Lihat Nilai (Siswa)

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Akses menu "Nilai Saya" | Menampilkan nilai per mata pelajaran | Nilai tampil dengan benar | (√) Diterima<br>(..X) Ditolak |
| Akses "Download Rapor PDF" | PDF rapor terdownload | PDF ter-generate dengan benar | (√) Diterima<br>(..X) Ditolak |

### Tabel 4.4 Pengujian Lihat Pembayaran (Siswa)

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Akses menu "Riwayat Pembayaran" | Menampilkan tabel pembayaran (tanggal, jenis, jumlah, status) | Data pembayaran tampil dengan benar | (√) Diterima<br>(..X) Ditolak |

---

## 5. PENGUJIAN CHATBOT

### Tabel 5.1 Pengujian Chatbot

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Klik icon chatbot, ketik "Halo" | Chatbot merespon dengan greeting | Chatbot merespon | (√) Diterima<br>(..X) Ditolak |
| Ketik "Siapa kamu?" | Chatbot menjawab tentang identitasnya (MIS Ar-Ruhama assistant) | Chatbot merespon sesuai | (√) Diterima<br>(..X) Ditolak |
| Ketik "Jadwal saya hari ini" (sebagai siswa) | Chatbot menampilkan jadwal kelas untuk hari ini | Chatbot merespon dengan jadwal | (√) Diterima<br>(..X) Ditolak |
| Ketik "Berapa nilai matematika saya?" | Chatbot menampilkan nilai matematika siswa | Chatbot merespon dengan nilai | (√) Diterima<br>(..X) Ditolak |
| Ketik "Berapa tagihan SPP saya?" | Chatbot menampilkan info pembayaran SPP | Chatbot merespon dengan data pembayaran | (√) Diterima<br>(..X) Ditolak |
| Ketik pertanyaan random (e.g., "Cuaca hari ini") | Chatbot merespon dengan fallback message | Chatbot merespon dengan fallback | (√) Diterima<br>(..X) Ditolak |

---

## 6. PENGUJIAN NON-FUNGSIONAL (PENTING)

### Tabel 6.1 Pengujian Security

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Akses halaman admin tanpa login | Redirect ke halaman login | Sistem mencegah akses | (√) Diterima<br>(..X) Ditolak |
| Login sebagai siswa, akses URL admin langsung | Redirect atau error 403 Forbidden | Sistem mencegah akses role lain | (√) Diterima<br>(..X) Ditolak |

### Tabel 6.2 Pengujian Performance

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Load halaman dashboard | Halaman load dalam < 3 detik | Halaman load cepat | (√) Diterima<br>(..X) Ditolak |
| Load jadwal grid dengan banyak data | Grid render dalam < 2 detik | Grid render cepat | (√) Diterima<br>(..X) Ditolak |
| Generate PDF rapor | PDF ter-generate dalam < 5 detik | PDF ter-generate cepat | (√) Diterima<br>(..X) Ditolak |

### Tabel 6.3 Pengujian Responsive Design

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Akses di mobile browser (375px width) | Layout menyesuaikan, sidebar collapse | Responsive di mobile | (√) Diterima<br>(..X) Ditolak |
| Akses di desktop (1920px width) | Layout penuh, grid lebar tanpa scroll | Responsive di desktop | (√) Diterima<br>(..X) Ditolak |

---

## 📊 SUMMARY HASIL TESTING

### Total Test Cases: **93**

| Kategori | Jumlah Test Cases | Pass | Fail | Not Tested |
|----------|-------------------|------|------|------------|
| Login & Logout | 5 | ___ | ___ | ___ |
| Role Admin | 58 | ___ | ___ | ___ |
| - Data Guru (Benar + Salah) | 8 | ___ | ___ | ___ |
| - Data Siswa (Benar + Salah) | 8 | ___ | ___ | ___ |
| - Data Kelas (Benar + Salah) | 6 | ___ | ___ | ___ |
| - Mata Pelajaran (Benar + Salah) | 6 | ___ | ___ | ___ |
| - Jadwal Visual Grid (Benar + Salah) | 9 | ___ | ___ | ___ |
| - Pembayaran (Benar + Salah) | 6 | ___ | ___ | ___ |
| - Presensi (Benar) | 2 | ___ | ___ | ___ |
| - Ranking Kelas (Benar) | 5 | ___ | ___ | ___ |
| Role Guru | 9 | ___ | ___ | ___ |
| - Dashboard Guru | 2 | ___ | ___ | ___ |
| - Input Nilai (Benar + Salah) | 4 | ___ | ___ | ___ |
| - Presensi | 1 | ___ | ___ | ___ |
| - Lihat Jadwal | 1 | ___ | ___ | ___ |
| Role Siswa | 6 | ___ | ___ | ___ |
| Chatbot | 6 | ___ | ___ | ___ |
| Non-Fungsional | 9 | ___ | ___ | ___ |
| **TOTAL** | **93** | **___** | **___** | **___** |

---

## 🐛 BUG TRACKING

### Format Pelaporan Bug:

| Bug ID | Modul | Deskripsi | Severity | Status |
|--------|-------|-----------|----------|--------|
| BUG-001 | ___ | ___ | High/Medium/Low | Open/Fixed |
| BUG-002 | ___ | ___ | High/Medium/Low | Open/Fixed |
| BUG-003 | ___ | ___ | High/Medium/Low | Open/Fixed |

---

## ✅ KRITERIA ACCEPTANCE

Aplikasi dinyatakan **PASS** jika:

- [ ] Minimal **90%** test cases PASS
- [ ] Tidak ada **critical bug** (severity: High)
- [ ] Semua fitur core bekerja 100%:
  - [ ] Login/Logout untuk 3 role (Admin, Guru, Siswa)
  - [ ] Admin: CRUD Guru, Siswa, Kelas, Mata Pelajaran
  - [ ] Admin: Jadwal Visual Grid (Tambah, Edit, Hapus)
  - [ ] Admin: Pembayaran, Presensi
  - [ ] Admin: Generate PDF Rapor
  - [ ] Admin: Ranking Kelas
  - [ ] Guru: Dashboard, Input Nilai (Data Benar & Salah), Input Presensi
  - [ ] Siswa: Dashboard, Lihat Jadwal, Nilai, Pembayaran
  - [ ] Chatbot: Query jadwal, nilai, pembayaran
- [ ] Responsive di mobile & desktop
- [ ] Security: Role-based access control berfungsi

---

## 📝 CATATAN TESTING

**Tester Name:** ___________________
**Testing Date:** ___________________
**Environment:**
- OS: ___________________
- Browser: ___________________

**Additional Notes:**
```
(Tulis catatan tambahan di sini)
```

---

**Last Updated:** 2025-01-15
**Document Version:** 1.1 (Ringkas - dengan Data Benar & Salah)
**Project:** MIS Ar-Ruhama School Management System

**Catatan:**
- Dokumen ini adalah versi ringkas yang fokus pada fitur-fitur penting
- Setiap modul CRUD diuji dengan **Data Benar** dan **Data Salah** untuk memastikan validasi bekerja
- Untuk testing lebih detail, lihat [BLACKBOX_TESTING_CHECKLIST.md](BLACKBOX_TESTING_CHECKLIST.md)
