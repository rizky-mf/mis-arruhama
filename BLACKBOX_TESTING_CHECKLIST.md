# 📋 BLACKBOX TESTING CHECKLIST
# Sistem Informasi Manajemen MIS Ar-Ruhama

**Tanggal Pembuatan:** 2025-01-15
**Versi Aplikasi:** 1.0
**Tester:** _________________

---

## 1. PENGUJIAN LOGIN

### Tabel 1.1 Pengujian Login

#### Kasus Dan Hasil Pengujian (Data Benar)

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Input *username* dan *password* sesuai milik admin | Masuk ke halaman dashboard admin | Menampilkan halaman dashboard admin | (√) Diterima<br>(..X) Ditolak |
| Input *username* dan *password* sesuai milik guru | Masuk ke halaman dashboard guru | Menampilkan halaman dashboard guru | (√) Diterima<br>(..X) Ditolak |
| Input *username* dan *password* sesuai milik siswa | Masuk ke halaman dashboard siswa | Menampilkan halaman dashboard siswa | (√) Diterima<br>(..X) Ditolak |

#### Kasus Dan Hasil Pengujian (Data Salah)

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Input *username* dan *password* salah/tidak sesuai | Tidak dapat *Login*, muncul pesan kesalahan | Tidak dapat menampilkan *Login*, muncul pesan kesalahan | (..X) Diterima<br>(√) Ditolak |
| Input *username* kosong | Tidak dapat *Login*, muncul pesan "Username required" | Muncul pesan validasi "Username required" | (..X) Diterima<br>(√) Ditolak |
| Input *password* kosong | Tidak dapat *Login*, muncul pesan "Password required" | Muncul pesan validasi "Password required" | (..X) Diterima<br>(√) Ditolak |
| Input *username* dan *password* kosong | Tidak dapat *Login*, muncul pesan validasi | Muncul pesan validasi untuk kedua field | (..X) Diterima<br>(√) Ditolak |

---

## 2. PENGUJIAN LOGOUT

### Tabel 2.1 Pengujian Logout

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Klik tombol *Logout* pada menu | Keluar dari sistem, kembali ke halaman login | Berhasil logout dan redirect ke halaman login | (√) Diterima<br>(..X) Ditolak |
| Akses halaman dashboard setelah logout | Redirect ke halaman login | Tidak bisa akses, redirect ke login | (√) Diterima<br>(..X) Ditolak |

---

## 3. PENGUJIAN DASHBOARD ADMIN

### Tabel 3.1 Pengujian Dashboard Admin

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Login sebagai admin, akses dashboard | Menampilkan statistik: total guru, siswa, kelas, pembayaran | Dashboard menampilkan semua statistik dengan benar | (√) Diterima<br>(..X) Ditolak |
| Klik menu navigasi (Data Guru) | Redirect ke halaman Data Guru | Berhasil redirect ke halaman Data Guru | (√) Diterima<br>(..X) Ditolak |
| Klik menu navigasi (Data Siswa) | Redirect ke halaman Data Siswa | Berhasil redirect ke halaman Data Siswa | (√) Diterima<br>(..X) Ditolak |
| Klik menu navigasi (Jadwal) | Redirect ke halaman Jadwal Pelajaran | Berhasil redirect ke halaman Jadwal | (√) Diterima<br>(..X) Ditolak |

---

## 4. PENGUJIAN DATA GURU (ADMIN)

### Tabel 4.1 Pengujian Tambah Data Guru (Data Valid)

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Klik tombol "Tambah Guru", isi semua field dengan data valid:<br>- NIP<br>- Nama Lengkap<br>- Email<br>- No. Telepon<br>- Alamat<br>- Upload Foto | Data guru berhasil disimpan, muncul di tabel dengan foto yang benar | Data guru tersimpan di database dan tampil di tabel | (√) Diterima<br>(..X) Ditolak |
| Input email dengan format valid (contoh@email.com) | Email diterima sistem | Email tersimpan dengan benar | (√) Diterima<br>(..X) Ditolak |
| Upload foto format JPG/PNG ukuran < 2MB | Foto berhasil diupload dan ditampilkan | Foto tersimpan dan tampil di card guru | (√) Diterima<br>(..X) Ditolak |

### Tabel 4.2 Pengujian Tambah Data Guru (Data Invalid)

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Field NIP kosong | Muncul pesan validasi "NIP required" | Sistem menampilkan error validasi | (..X) Diterima<br>(√) Ditolak |
| Field Nama Lengkap kosong | Muncul pesan validasi "Nama required" | Sistem menampilkan error validasi | (..X) Diterima<br>(√) Ditolak |
| Input email dengan format salah (tanpa @) | Muncul pesan validasi "Email tidak valid" | Sistem menampilkan error validasi | (..X) Diterima<br>(√) Ditolak |
| Upload foto format tidak didukung (.txt, .pdf) | Muncul pesan error "Format file tidak didukung" | Sistem reject file upload | (..X) Diterima<br>(√) Ditolak |
| Upload foto ukuran > 2MB | Muncul pesan error "Ukuran file terlalu besar" | Sistem reject file upload | (..X) Diterima<br>(√) Ditolak |
| Input NIP yang sudah ada (duplikat) | Muncul pesan error "NIP sudah terdaftar" | Sistem menolak data duplikat | (..X) Diterima<br>(√) Ditolak |

### Tabel 4.3 Pengujian Edit Data Guru

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Klik tombol "Edit" pada data guru, ubah Nama Lengkap, klik "Simpan" | Data guru berhasil diupdate | Data terupdate di tabel dan database | (√) Diterima<br>(..X) Ditolak |
| Ubah foto guru dengan foto baru | Foto lama terganti dengan foto baru | Foto baru tampil di card guru | (√) Diterima<br>(..X) Ditolak |
| Ubah email dengan format valid | Email berhasil diupdate | Email baru tersimpan | (√) Diterima<br>(..X) Ditolak |
| Ubah email dengan format invalid | Muncul pesan validasi error | Sistem menolak perubahan | (..X) Diterima<br>(√) Ditolak |

### Tabel 4.4 Pengujian Hapus Data Guru

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Klik tombol "Hapus" pada data guru, konfirmasi hapus | Data guru terhapus dari tabel | Data terhapus dari database dan tabel | (√) Diterima<br>(..X) Ditolak |
| Klik tombol "Hapus" lalu klik "Batal" | Data guru tidak terhapus | Data tetap ada di tabel | (√) Diterima<br>(..X) Ditolak |

### Tabel 4.5 Pengujian Reset Password Guru

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Klik tombol "Reset Password" pada data guru, konfirmasi | Password guru direset ke default (NIP), muncul notifikasi sukses | Password berhasil direset | (√) Diterima<br>(..X) Ditolak |
| Login dengan akun guru yang direset menggunakan password lama | Tidak dapat login | Login gagal dengan password lama | (√) Diterima<br>(..X) Ditolak |
| Login dengan akun guru yang direset menggunakan password baru (NIP) | Berhasil login | Login berhasil dengan password default | (√) Diterima<br>(..X) Ditolak |

### Tabel 4.6 Pengujian Pencarian Data Guru

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Input nama guru di search box | Tabel menampilkan data guru yang sesuai | Filter bekerja dengan benar | (√) Diterima<br>(..X) Ditolak |
| Input NIP guru di search box | Tabel menampilkan guru dengan NIP tersebut | Filter bekerja dengan benar | (√) Diterima<br>(..X) Ditolak |
| Input keyword yang tidak ada | Tabel kosong dengan pesan "Tidak ada data" | Menampilkan pesan yang sesuai | (√) Diterima<br>(..X) Ditolak |

---

## 5. PENGUJIAN DATA SISWA (ADMIN)

### Tabel 5.1 Pengujian Tambah Data Siswa (Data Valid)

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Klik tombol "Tambah Siswa", isi semua field valid:<br>- NIS<br>- Nama Lengkap<br>- Kelas<br>- Tanggal Lahir<br>- Jenis Kelamin<br>- Alamat<br>- Nama Wali<br>- No. Telepon Wali | Data siswa berhasil disimpan, muncul di tabel | Data tersimpan di database dan tampil di tabel | (√) Diterima<br>(..X) Ditolak |
| Pilih kelas dari dropdown | Kelas terpilih dan tersimpan | Relasi kelas_id tersimpan dengan benar | (√) Diterima<br>(..X) Ditolak |
| Pilih tanggal lahir dari date picker | Tanggal tersimpan dengan format yang benar | Tanggal tersimpan (YYYY-MM-DD) | (√) Diterima<br>(..X) Ditolak |

### Tabel 5.2 Pengujian Tambah Data Siswa (Data Invalid)

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Field NIS kosong | Muncul pesan validasi "NIS required" | Sistem menampilkan error validasi | (..X) Diterima<br>(√) Ditolak |
| Field Nama Lengkap kosong | Muncul pesan validasi "Nama required" | Sistem menampilkan error validasi | (..X) Diterima<br>(√) Ditolak |
| Kelas tidak dipilih | Muncul pesan validasi "Kelas required" | Sistem menampilkan error validasi | (..X) Diterima<br>(√) Ditolak |
| Input NIS yang sudah ada (duplikat) | Muncul pesan error "NIS sudah terdaftar" | Sistem menolak data duplikat | (..X) Diterima<br>(√) Ditolak |

### Tabel 5.3 Pengujian Edit Data Siswa

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Klik tombol "Edit", ubah Nama Lengkap, klik "Simpan" | Data siswa berhasil diupdate | Data terupdate di tabel | (√) Diterima<br>(..X) Ditolak |
| Ubah kelas siswa ke kelas lain | Kelas berhasil diupdate | Relasi kelas_id terupdate | (√) Diterima<br>(..X) Ditolak |

### Tabel 5.4 Pengujian Hapus Data Siswa

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Klik tombol "Hapus", konfirmasi hapus | Data siswa terhapus dari tabel | Data terhapus dari database | (√) Diterima<br>(..X) Ditolak |

### Tabel 5.5 Pengujian Reset Password Siswa

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Klik tombol "Reset Password", konfirmasi | Password siswa direset ke default (NIS) | Password berhasil direset | (√) Diterima<br>(..X) Ditolak |
| Login dengan password baru (NIS) | Berhasil login ke dashboard siswa | Login berhasil | (√) Diterima<br>(..X) Ditolak |

---

## 6. PENGUJIAN DATA KELAS (ADMIN)

### Tabel 6.1 Pengujian Tambah Data Kelas (Data Valid)

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Klik "Tambah Kelas", isi:<br>- Nama Kelas (e.g., "1A")<br>- Tingkat (1-6)<br>- Tahun Ajaran (e.g., "2024/2025")<br>- Wali Kelas (pilih dari dropdown guru) | Data kelas berhasil disimpan | Kelas muncul di tabel dengan wali kelas | (√) Diterima<br>(..X) Ditolak |

### Tabel 6.2 Pengujian Tambah Data Kelas (Data Invalid)

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Field Nama Kelas kosong | Muncul validasi error "Nama kelas required" | Sistem menampilkan error | (..X) Diterima<br>(√) Ditolak |
| Field Tingkat kosong | Muncul validasi error "Tingkat required" | Sistem menampilkan error | (..X) Diterima<br>(√) Ditolak |
| Input tingkat di luar range (0 atau >6) | Muncul error validasi | Sistem menolak input | (..X) Diterima<br>(√) Ditolak |

### Tabel 6.3 Pengujian Edit Data Kelas

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Klik "Edit", ubah Wali Kelas, simpan | Wali kelas berhasil diupdate | Data terupdate di tabel | (√) Diterima<br>(..X) Ditolak |
| Ubah Tahun Ajaran | Tahun ajaran terupdate | Data tersimpan dengan benar | (√) Diterima<br>(..X) Ditolak |

### Tabel 6.4 Pengujian Hapus Data Kelas

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Klik "Hapus" pada kelas yang tidak memiliki siswa | Kelas berhasil dihapus | Data terhapus dari database | (√) Diterima<br>(..X) Ditolak |
| Klik "Hapus" pada kelas yang memiliki siswa | Muncul error "Tidak bisa hapus, kelas masih memiliki siswa" | Sistem mencegah penghapusan | (..X) Diterima<br>(√) Ditolak |

---

## 7. PENGUJIAN MATA PELAJARAN (ADMIN)

### Tabel 7.1 Pengujian Tambah Mata Pelajaran (Data Valid)

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Klik "Tambah Mata Pelajaran", isi:<br>- Kode Mapel (e.g., "MTK")<br>- Nama Mapel (e.g., "Matematika")<br>- Deskripsi (optional) | Data mata pelajaran tersimpan | Mapel muncul di tabel | (√) Diterima<br>(..X) Ditolak |

### Tabel 7.2 Pengujian Tambah Mata Pelajaran (Data Invalid)

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Field Kode Mapel kosong | Muncul validasi error | Sistem menampilkan error | (..X) Diterima<br>(√) Ditolak |
| Field Nama Mapel kosong | Muncul validasi error | Sistem menampilkan error | (..X) Diterima<br>(√) Ditolak |
| Input kode mapel yang sudah ada (duplikat) | Muncul error "Kode mapel sudah ada" | Sistem menolak duplikat | (..X) Diterima<br>(√) Ditolak |

### Tabel 7.3 Pengujian Edit Mata Pelajaran

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Klik "Edit", ubah Nama Mapel, simpan | Data mapel berhasil diupdate | Perubahan tersimpan | (√) Diterima<br>(..X) Ditolak |

### Tabel 7.4 Pengujian Hapus Mata Pelajaran

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Klik "Hapus" pada mapel yang belum digunakan | Mapel berhasil dihapus | Data terhapus | (√) Diterima<br>(..X) Ditolak |
| Klik "Hapus" pada mapel yang sudah ada di jadwal | Muncul error atau warning | Sistem mencegah penghapusan | (..X) Diterima<br>(√) Ditolak |

---

## 8. PENGUJIAN JADWAL PELAJARAN VISUAL GRID (ADMIN)

### Tabel 8.1 Pengujian Load Jadwal Grid (Data Valid)

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Login admin, akses menu Jadwal, pilih Tingkat & Kelas | Grid 7×8 muncul dengan hari (Senin-Minggu) dan slot waktu (07:00-11:40) | Grid tampil dengan benar | (√) Diterima<br>(..X) Ditolak |
| Pilih kelas yang sudah ada jadwalnya | Cell berwarna sesuai mata pelajaran, menampilkan nama mapel + nama guru | Jadwal tampil di grid dengan color coding | (√) Diterima<br>(..X) Ditolak |
| Check cell UPACARA (Senin slot 1) | Cell background kuning, text "UPACARA", disabled (tidak bisa diklik) | Cell UPACARA tampil dengan styling khusus | (√) Diterima<br>(..X) Ditolak |
| Check cell ISTIRAHAT (semua hari, slot 09:20-09:55) | Cell background abu-abu, text "ISTIRAHAT", disabled | Cell ISTIRAHAT tampil dengan styling khusus | (√) Diterima<br>(..X) Ditolak |

### Tabel 8.2 Pengujian Tambah Jadwal Baru (Data Valid)

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Klik cell kosong (putih), pilih Mata Pelajaran & Guru, input Ruangan (optional), klik "Simpan" | Modal tutup, cell berubah warna dengan nama mapel + guru | Jadwal tersimpan dan grid terupdate otomatis | (√) Diterima<br>(..X) Ditolak |
| Tambah jadwal tanpa input Ruangan | Jadwal tersimpan tanpa ruangan | Data tersimpan, ruangan kosong | (√) Diterima<br>(..X) Ditolak |

### Tabel 8.3 Pengujian Tambah Jadwal (Data Invalid)

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Klik cell, tidak pilih Mata Pelajaran, klik "Simpan" | Muncul validasi error "Mata pelajaran required" | Sistem menampilkan error | (..X) Diterima<br>(√) Ditolak |
| Klik cell, tidak pilih Guru, klik "Simpan" | Muncul validasi error "Guru required" | Sistem menampilkan error | (..X) Diterima<br>(√) Ditolak |

### Tabel 8.4 Pengujian Edit Jadwal

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Klik cell yang sudah ada jadwal, ubah Mata Pelajaran, klik "Simpan" | Jadwal terupdate, warna cell berubah sesuai mapel baru | Data terupdate dan grid refresh | (√) Diterima<br>(..X) Ditolak |
| Ubah Guru pada jadwal existing | Guru terupdate, nama guru baru tampil di cell | Data terupdate | (√) Diterima<br>(..X) Ditolak |
| Ubah Ruangan pada jadwal existing | Ruangan terupdate di cell | Data tersimpan | (√) Diterima<br>(..X) Ditolak |

### Tabel 8.5 Pengujian Hapus Jadwal

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Klik cell jadwal, klik tombol "Hapus" (merah), konfirmasi | Jadwal terhapus, cell kembali putih kosong | Data terhapus dari database, grid refresh | (√) Diterima<br>(..X) Ditolak |
| Klik tombol "Hapus" lalu "Batal" | Jadwal tidak terhapus | Data tetap ada | (√) Diterima<br>(..X) Ditolak |

### Tabel 8.6 Pengujian Color Coding & Legend

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Tambah beberapa jadwal dengan mata pelajaran berbeda | Setiap mata pelajaran memiliki warna konsisten (same mapel = same color) | Color coding bekerja dengan benar | (√) Diterima<br>(..X) Ditolak |
| Check legend di bawah grid | Legend menampilkan kotak warna + nama mapel (max 12 item) | Legend tampil dengan benar | (√) Diterima<br>(..X) Ditolak |

### Tabel 8.7 Pengujian Responsif Grid

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Zoom out browser | Grid tetap rapi dengan scrollbar horizontal jika perlu | Grid responsive | (√) Diterima<br>(..X) Ditolak |
| Resize window browser | Grid tetap dapat diakses | Tampilan tetap usable | (√) Diterima<br>(..X) Ditolak |

---

## 9. PENGUJIAN PEMBAYARAN (ADMIN)

### Tabel 9.1 Pengujian Tambah Pembayaran (Data Valid)

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Klik "Tambah Pembayaran", pilih:<br>- Siswa (dari dropdown)<br>- Jenis Pembayaran<br>- Jumlah<br>- Tanggal Bayar<br>- Metode Pembayaran | Data pembayaran tersimpan, muncul di tabel | Pembayaran tersimpan dengan benar | (√) Diterima<br>(..X) Ditolak |
| Input jumlah dengan format angka valid (e.g., 100000) | Jumlah tersimpan dengan benar | Data tersimpan | (√) Diterima<br>(..X) Ditolak |

### Tabel 9.2 Pengujian Tambah Pembayaran (Data Invalid)

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Siswa tidak dipilih | Muncul validasi error "Siswa required" | Sistem menampilkan error | (..X) Diterima<br>(√) Ditolak |
| Input jumlah dengan karakter non-numerik | Muncul validasi error "Jumlah harus angka" | Sistem menampilkan error | (..X) Diterima<br>(√) Ditolak |
| Input jumlah negatif atau 0 | Muncul validasi error "Jumlah harus > 0" | Sistem menampilkan error | (..X) Diterima<br>(√) Ditolak |

### Tabel 9.3 Pengujian Edit Pembayaran

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Klik "Edit", ubah Jumlah, simpan | Data pembayaran terupdate | Perubahan tersimpan | (√) Diterima<br>(..X) Ditolak |
| Ubah Metode Pembayaran | Metode terupdate | Data tersimpan | (√) Diterima<br>(..X) Ditolak |

### Tabel 9.4 Pengujian Hapus Pembayaran

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Klik "Hapus", konfirmasi | Pembayaran terhapus dari tabel | Data terhapus | (√) Diterima<br>(..X) Ditolak |

### Tabel 9.5 Pengujian Filter Pembayaran

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Pilih filter "Jenis Pembayaran" (e.g., SPP) | Tabel hanya menampilkan pembayaran SPP | Filter bekerja | (√) Diterima<br>(..X) Ditolak |
| Pilih filter "Status" (Lunas/Pending) | Tabel menampilkan sesuai status | Filter bekerja | (√) Diterima<br>(..X) Ditolak |

---

## 10. PENGUJIAN PRESENSI (ADMIN)

### Tabel 10.1 Pengujian Lihat Presensi

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Akses menu Presensi, pilih Kelas & Tanggal | Tabel menampilkan daftar siswa dengan status kehadiran | Data presensi tampil | (√) Diterima<br>(..X) Ditolak |
| Filter berdasarkan tanggal | Tabel menampilkan presensi sesuai tanggal | Filter bekerja | (√) Diterima<br>(..X) Ditolak |

### Tabel 10.2 Pengujian Input Presensi

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Pilih status "Hadir" untuk siswa, simpan | Status tersimpan, tampil di tabel | Data tersimpan | (√) Diterima<br>(..X) Ditolak |
| Pilih status "Sakit", input keterangan, simpan | Status dan keterangan tersimpan | Data tersimpan dengan keterangan | (√) Diterima<br>(..X) Ditolak |
| Pilih status "Izin", input keterangan, simpan | Status dan keterangan tersimpan | Data tersimpan dengan keterangan | (√) Diterima<br>(..X) Ditolak |
| Pilih status "Alpha", simpan | Status tersimpan | Data tersimpan | (√) Diterima<br>(..X) Ditolak |

---

## 11. PENGUJIAN RAPOR & NILAI (ADMIN)

### Tabel 11.1 Pengujian Input Nilai

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Pilih Kelas & Mata Pelajaran, input nilai siswa (0-100), simpan | Nilai tersimpan di database | Nilai tersimpan dengan benar | (√) Diterima<br>(..X) Ditolak |
| Input nilai di luar range (>100 atau <0) | Muncul validasi error "Nilai harus 0-100" | Sistem menampilkan error | (..X) Diterima<br>(√) Ditolak |

### Tabel 11.2 Pengujian Generate PDF Rapor

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Pilih siswa, klik "Generate Rapor PDF" | PDF rapor terdownload dengan lengkap (header, nilai per mapel, total) | PDF ter-generate dengan benar | (√) Diterima<br>(..X) Ditolak |
| Generate rapor untuk siswa tanpa nilai | PDF tetap tergenerate dengan nilai kosong atau 0 | PDF ter-generate | (√) Diterima<br>(..X) Ditolak |

---

## 12. PENGUJIAN DASHBOARD GURU

### Tabel 12.1 Pengujian Dashboard Guru

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Login sebagai guru, akses dashboard | Menampilkan:<br>- Jadwal mengajar hari ini<br>- Kelas yang diampu<br>- Jumlah tugas pending (nilai belum diinput) | Dashboard tampil dengan data yang benar | (√) Diterima<br>(..X) Ditolak |
| Check "Jadwal Mengajar Hari Ini" | Menampilkan jadwal sesuai hari login (dari grid visual) | Jadwal tampil sesuai | (√) Diterima<br>(..X) Ditolak |
| Check "Kelas yang Diampu" | Menampilkan semua kelas yang guru ajar | Kelas tampil dengan benar | (√) Diterima<br>(..X) Ditolak |

### Tabel 12.2 Pengujian Input Nilai (Guru)

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Pilih kelas & mapel, input nilai siswa, simpan | Nilai tersimpan, counter "Tugas Pending" berkurang | Nilai tersimpan dan dashboard terupdate | (√) Diterima<br>(..X) Ditolak |

### Tabel 12.3 Pengujian Presensi (Guru)

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Pilih kelas, input presensi siswa, simpan | Presensi tersimpan | Data tersimpan di database | (√) Diterima<br>(..X) Ditolak |

---

## 13. PENGUJIAN DASHBOARD SISWA

### Tabel 13.1 Pengujian Dashboard Siswa

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Login sebagai siswa, akses dashboard | Menampilkan:<br>- Profil siswa<br>- Jadwal pelajaran kelas<br>- Nilai (jika sudah diinput)<br>- Riwayat pembayaran | Dashboard tampil dengan data yang benar | (√) Diterima<br>(..X) Ditolak |

### Tabel 13.2 Pengujian Lihat Jadwal (Siswa)

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Akses menu "Jadwal Saya" | Menampilkan jadwal kelas dalam format grid atau list | Jadwal tampil sesuai kelas siswa | (√) Diterima<br>(..X) Ditolak |

### Tabel 13.3 Pengujian Lihat Nilai (Siswa)

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Akses menu "Nilai Saya" | Menampilkan nilai per mata pelajaran | Nilai tampil dengan benar | (√) Diterima<br>(..X) Ditolak |
| Akses "Download Rapor PDF" | PDF rapor terdownload | PDF ter-generate | (√) Diterima<br>(..X) Ditolak |

### Tabel 13.4 Pengujian Lihat Pembayaran (Siswa)

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Akses menu "Riwayat Pembayaran" | Menampilkan tabel pembayaran (tanggal, jenis, jumlah, status) | Data pembayaran tampil | (√) Diterima<br>(..X) Ditolak |

---

## 14. PENGUJIAN CHATBOT

### Tabel 14.1 Pengujian Chatbot Interaksi Dasar

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Klik icon chatbot, ketik "Halo" | Chatbot merespon dengan greeting | Chatbot merespon | (√) Diterima<br>(..X) Ditolak |
| Ketik "Siapa kamu?" | Chatbot menjawab tentang identitasnya (MIS Ar-Ruhama assistant) | Chatbot merespon sesuai | (√) Diterima<br>(..X) Ditolak |

### Tabel 14.2 Pengujian Chatbot Query Jadwal

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Ketik "Jadwal saya hari ini" (sebagai siswa) | Chatbot menampilkan jadwal kelas untuk hari ini | Chatbot merespon dengan jadwal | (√) Diterima<br>(..X) Ditolak |
| Ketik "Jadwal matematika minggu ini" | Chatbot menampilkan jadwal mapel matematika | Chatbot merespon dengan jadwal mapel | (√) Diterima<br>(..X) Ditolak |

### Tabel 14.3 Pengujian Chatbot Query Nilai

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Ketik "Berapa nilai matematika saya?" | Chatbot menampilkan nilai matematika siswa | Chatbot merespon dengan nilai | (√) Diterima<br>(..X) Ditolak |

### Tabel 14.4 Pengujian Chatbot Query Pembayaran

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Ketik "Berapa tagihan SPP saya?" | Chatbot menampilkan info pembayaran SPP | Chatbot merespon dengan data pembayaran | (√) Diterima<br>(..X) Ditolak |

### Tabel 14.5 Pengujian Chatbot Fallback

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Ketik pertanyaan random/tidak relevan (e.g., "Cuaca hari ini") | Chatbot merespon dengan fallback message (e.g., "Maaf, saya tidak mengerti") | Chatbot merespon dengan fallback | (√) Diterima<br>(..X) Ditolak |

---

## 15. PENGUJIAN NON-FUNGSIONAL

### Tabel 15.1 Pengujian Performance

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Load halaman dashboard dengan 100+ data siswa | Halaman load dalam < 3 detik | Halaman load cepat | (√) Diterima<br>(..X) Ditolak |
| Load jadwal grid dengan 50+ jadwal | Grid render dalam < 2 detik | Grid render cepat | (√) Diterima<br>(..X) Ditolak |
| Generate PDF rapor | PDF ter-generate dalam < 5 detik | PDF ter-generate cepat | (√) Diterima<br>(..X) Ditolak |

### Tabel 15.2 Pengujian Usability

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Navigasi antar menu (klik menu sidebar) | Transisi smooth, tidak ada lag | Navigasi lancar | (√) Diterima<br>(..X) Ditolak |
| Form input (tambah guru, siswa, dll) | Semua field jelas, label readable, validasi real-time | Form user-friendly | (√) Diterima<br>(..X) Ditolak |
| Error message | Pesan error jelas dan membantu user | Error message informatif | (√) Diterima<br>(..X) Ditolak |

### Tabel 15.3 Pengujian Responsive Design

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Akses di mobile browser (375px width) | Layout menyesuaikan, sidebar collapse, grid scrollable | Responsive di mobile | (√) Diterima<br>(..X) Ditolak |
| Akses di tablet (768px width) | Layout menyesuaikan dengan baik | Responsive di tablet | (√) Diterima<br>(..X) Ditolak |
| Akses di desktop (1920px width) | Layout penuh, grid lebar tanpa scroll horizontal | Responsive di desktop | (√) Diterima<br>(..X) Ditolak |

### Tabel 15.4 Pengujian Security

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Akses halaman admin tanpa login | Redirect ke halaman login | Sistem mencegah akses | (√) Diterima<br>(..X) Ditolak |
| Akses endpoint API tanpa token | Response 401 Unauthorized | API protected | (√) Diterima<br>(..X) Ditolak |
| Login sebagai siswa, coba akses URL admin langsung (e.g., /admin/guru) | Redirect ke dashboard siswa atau error 403 Forbidden | Sistem mencegah akses role lain | (√) Diterima<br>(..X) Ditolak |
| Input SQL injection di form (e.g., `' OR '1'='1`) | Input di-sanitize, tidak terjadi SQL injection | Sistem aman dari SQL injection | (√) Diterima<br>(..X) Ditolak |
| Input XSS di form (e.g., `<script>alert('XSS')</script>`) | Input di-escape, script tidak dieksekusi | Sistem aman dari XSS | (√) Diterima<br>(..X) Ditolak |

### Tabel 15.5 Pengujian Browser Compatibility

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Akses di Google Chrome (latest) | Semua fitur bekerja normal | Compatible | (√) Diterima<br>(..X) Ditolak |
| Akses di Mozilla Firefox (latest) | Semua fitur bekerja normal | Compatible | (√) Diterima<br>(..X) Ditolak |
| Akses di Microsoft Edge (latest) | Semua fitur bekerja normal | Compatible | (√) Diterima<br>(..X) Ditolak |
| Akses di Safari (latest) | Semua fitur bekerja normal | Compatible | (√) Diterima<br>(..X) Ditolak |

---

## 16. PENGUJIAN EDGE CASES

### Tabel 16.1 Pengujian Edge Cases

| Data yang dimasukan | Data yang diharapkan | Pengamatan | Kesimpulan |
|---------------------|----------------------|------------|------------|
| Upload foto guru ukuran tepat 2MB | Foto berhasil diupload | Sistem menerima | (√) Diterima<br>(..X) Ditolak |
| Input nama siswa dengan karakter spesial (e.g., "O'Brien") | Nama tersimpan dengan benar | Sistem handle karakter spesial | (√) Diterima<br>(..X) Ditolak |
| Tambah jadwal di cell yang sudah terisi (dobel klik) | Modal edit terbuka (tidak dobel insert) | Sistem mencegah duplikasi | (√) Diterima<br>(..X) Ditolak |
| Hapus guru yang masih mengajar (ada di jadwal) | Muncul error atau warning "Guru masih mengajar" | Sistem mencegah delete | (..X) Diterima<br>(√) Ditolak |
| Akses sistem saat backend down | Muncul error message "Server tidak dapat dihubungi" | Error handling baik | (√) Diterima<br>(..X) Ditolak |
| Klik tombol submit form berkali-kali (double submit) | Hanya 1 data tersimpan (tidak duplikasi) | Sistem mencegah double submit | (√) Diterima<br>(..X) Ditolak |

---

## 📊 SUMMARY HASIL TESTING

### Total Test Cases: **150+**

| Kategori | Jumlah Test Cases | Pass | Fail | Not Tested |
|----------|-------------------|------|------|------------|
| Login & Logout | 6 | ___ | ___ | ___ |
| Dashboard Admin | 4 | ___ | ___ | ___ |
| Data Guru | 20 | ___ | ___ | ___ |
| Data Siswa | 12 | ___ | ___ | ___ |
| Data Kelas | 8 | ___ | ___ | ___ |
| Mata Pelajaran | 8 | ___ | ___ | ___ |
| Jadwal Pelajaran Grid | 14 | ___ | ___ | ___ |
| Pembayaran | 10 | ___ | ___ | ___ |
| Presensi | 6 | ___ | ___ | ___ |
| Rapor & Nilai | 4 | ___ | ___ | ___ |
| Dashboard Guru | 5 | ___ | ___ | ___ |
| Dashboard Siswa | 6 | ___ | ___ | ___ |
| Chatbot | 8 | ___ | ___ | ___ |
| Non-Fungsional | 15 | ___ | ___ | ___ |
| Edge Cases | 6 | ___ | ___ | ___ |
| **TOTAL** | **132** | **___** | **___** | **___** |

---

## 🐛 BUG TRACKING

### Format Pelaporan Bug:

| Bug ID | Modul | Deskripsi | Severity | Status | Assigned To |
|--------|-------|-----------|----------|--------|-------------|
| BUG-001 | ___ | ___ | High/Medium/Low | Open/In Progress/Fixed | ___ |
| BUG-002 | ___ | ___ | High/Medium/Low | Open/In Progress/Fixed | ___ |
| BUG-003 | ___ | ___ | High/Medium/Low | Open/In Progress/Fixed | ___ |

---

## ✅ KRITERIA ACCEPTANCE

Aplikasi dinyatakan **PASS** jika:

- [ ] Minimal **95%** test cases PASS
- [ ] Tidak ada **critical bug** (severity: High)
- [ ] Semua fitur core (Login, CRUD, Jadwal Grid, Rapor) bekerja 100%
- [ ] Responsive di 3 device (Mobile, Tablet, Desktop)
- [ ] Compatible di 4 browser utama (Chrome, Firefox, Edge, Safari)
- [ ] Performance load time < 3 detik

---

## 📝 CATATAN TESTING

**Tester Name:** ___________________
**Testing Date:** ___________________
**Environment:**
- OS: ___________________
- Browser: ___________________
- Screen Resolution: ___________________

**Additional Notes:**
```
(Tulis catatan tambahan di sini)
```

---

**Last Updated:** 2025-01-15
**Document Version:** 1.0
**Project:** MIS Ar-Ruhama School Management System
