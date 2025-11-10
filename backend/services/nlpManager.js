// services/nlpManager.js
const { NlpManager } = require('node-nlp');
const path = require('path');
const fs = require('fs');

class ChatbotNLPManager {
  constructor() {
    // Inisialisasi NLP Manager dengan bahasa Indonesia dan Inggris
    this.manager = new NlpManager({
      languages: ['id', 'en'],
      forceNER: true, // Enable Named Entity Recognition
      nlu: { log: false }
    });

    this.modelPath = path.join(__dirname, '../models/chatbot-model.nlp');
    this.isTrained = false;
  }

  /**
   * Setup training data untuk chatbot
   */
  async setupTrainingData() {
    console.log('🤖 Setting up NLP training data...');

    // ========================================
    // INTENT: GREETING (Sapaan) - EXPANDED
    // ========================================
    this.manager.addDocument('id', 'hai', 'greeting');
    this.manager.addDocument('id', 'halo', 'greeting');
    this.manager.addDocument('id', 'hello', 'greeting');
    this.manager.addDocument('id', 'hi', 'greeting');
    this.manager.addDocument('id', 'hey', 'greeting');
    this.manager.addDocument('id', 'selamat pagi', 'greeting');
    this.manager.addDocument('id', 'selamat siang', 'greeting');
    this.manager.addDocument('id', 'selamat sore', 'greeting');
    this.manager.addDocument('id', 'selamat malam', 'greeting');
    this.manager.addDocument('id', 'assalamualaikum', 'greeting');
    this.manager.addDocument('id', 'waalaikumsalam', 'greeting');
    this.manager.addDocument('id', 'pagi', 'greeting');
    this.manager.addDocument('id', 'siang', 'greeting');
    this.manager.addDocument('id', 'sore', 'greeting');
    this.manager.addDocument('id', 'malam', 'greeting');
    this.manager.addDocument('id', 'apa kabar', 'greeting');
    this.manager.addDocument('id', 'bagaimana kabarmu', 'greeting');
    this.manager.addDocument('id', 'gimana kabarnya', 'greeting');
    this.manager.addDocument('id', 'halo bot', 'greeting');
    this.manager.addDocument('id', 'hai chatbot', 'greeting');
    this.manager.addDocument('id', 'salam kenal', 'greeting');
    this.manager.addDocument('id', 'perkenalkan diri', 'greeting');
    this.manager.addDocument('id', 'siapa kamu', 'greeting');
    this.manager.addDocument('id', 'kamu siapa', 'greeting');

    // ========================================
    // INTENT: JADWAL (Schedule) - EXPANDED
    // ========================================
    this.manager.addDocument('id', 'jadwal saya hari ini', 'jadwal');
    this.manager.addDocument('id', 'jadwal pelajaran', 'jadwal');
    this.manager.addDocument('id', 'apa jadwal hari ini', 'jadwal');
    this.manager.addDocument('id', 'jadwal besok', 'jadwal');
    this.manager.addDocument('id', 'jadwal minggu ini', 'jadwal');
    this.manager.addDocument('id', 'jadwal senin', 'jadwal');
    this.manager.addDocument('id', 'jadwal selasa', 'jadwal');
    this.manager.addDocument('id', 'jadwal rabu', 'jadwal');
    this.manager.addDocument('id', 'jadwal kamis', 'jadwal');
    this.manager.addDocument('id', 'jadwal jumat', 'jadwal');
    this.manager.addDocument('id', 'jadwal sabtu', 'jadwal');
    this.manager.addDocument('id', 'kapan pelajaran matematika', 'jadwal');
    this.manager.addDocument('id', 'kapan ujian', 'jadwal');
    this.manager.addDocument('id', 'jam berapa pelajaran', 'jadwal');
    this.manager.addDocument('id', 'jam berapa mulai sekolah', 'jadwal');
    this.manager.addDocument('id', 'mengajar hari ini', 'jadwal');
    this.manager.addDocument('id', 'kelas apa saja hari ini', 'jadwal');
    this.manager.addDocument('id', 'lihat jadwal', 'jadwal');
    this.manager.addDocument('id', 'cek jadwal', 'jadwal');
    this.manager.addDocument('id', 'tampilkan jadwal', 'jadwal');
    this.manager.addDocument('id', 'buka jadwal', 'jadwal');
    this.manager.addDocument('id', 'mau lihat jadwal', 'jadwal');
    this.manager.addDocument('id', 'tunjukkan jadwal pelajaran', 'jadwal');
    this.manager.addDocument('id', 'pelajaran apa hari ini', 'jadwal');
    this.manager.addDocument('id', 'pelajaran apa besok', 'jadwal');
    this.manager.addDocument('id', 'hari ini pelajaran apa', 'jadwal');
    this.manager.addDocument('id', 'besok pelajaran apa', 'jadwal');
    this.manager.addDocument('id', 'ada kelas apa aja', 'jadwal');
    this.manager.addDocument('id', 'jam pelajaran hari ini', 'jadwal');
    this.manager.addDocument('id', 'schedule hari ini', 'jadwal');
    this.manager.addDocument('id', 'timetable', 'jadwal');
    this.manager.addDocument('id', 'timetable hari ini', 'jadwal');
    this.manager.addDocument('id', 'jadwal kelas', 'jadwal');
    this.manager.addDocument('id', 'info jadwal', 'jadwal');
    this.manager.addDocument('id', 'jadwal mengajar saya', 'jadwal');
    this.manager.addDocument('id', 'ngajar jam berapa', 'jadwal');
    this.manager.addDocument('id', 'saya ngajar apa hari ini', 'jadwal');
    this.manager.addDocument('id', 'jadwal lengkap', 'jadwal');
    this.manager.addDocument('id', 'minta jadwal', 'jadwal');

    // ========================================
    // INTENT: NILAI (Grades) - EXPANDED
    // ========================================
    this.manager.addDocument('id', 'nilai saya berapa', 'nilai');
    this.manager.addDocument('id', 'lihat nilai rapor', 'nilai');
    this.manager.addDocument('id', 'cek nilai', 'nilai');
    this.manager.addDocument('id', 'tampilkan nilai', 'nilai');
    this.manager.addDocument('id', 'buka nilai', 'nilai');
    this.manager.addDocument('id', 'nilai matematika', 'nilai');
    this.manager.addDocument('id', 'nilai bahasa indonesia', 'nilai');
    this.manager.addDocument('id', 'nilai ipa', 'nilai');
    this.manager.addDocument('id', 'nilai ips', 'nilai');
    this.manager.addDocument('id', 'berapa rata-rata nilai saya', 'nilai');
    this.manager.addDocument('id', 'rata-rata nilai', 'nilai');
    this.manager.addDocument('id', 'nilai rata-rata saya', 'nilai');
    this.manager.addDocument('id', 'nilai ujian', 'nilai');
    this.manager.addDocument('id', 'hasil uts', 'nilai');
    this.manager.addDocument('id', 'hasil uas', 'nilai');
    this.manager.addDocument('id', 'hasil ulangan', 'nilai');
    this.manager.addDocument('id', 'nilai tugas', 'nilai');
    this.manager.addDocument('id', 'rapor semester ini', 'nilai');
    this.manager.addDocument('id', 'rapor saya', 'nilai');
    this.manager.addDocument('id', 'lihat rapor', 'nilai');
    this.manager.addDocument('id', 'cek rapor', 'nilai');
    this.manager.addDocument('id', 'mau lihat nilai', 'nilai');
    this.manager.addDocument('id', 'tunjukkan nilai saya', 'nilai');
    this.manager.addDocument('id', 'berapa nilai saya', 'nilai');
    this.manager.addDocument('id', 'nilai akhir', 'nilai');
    this.manager.addDocument('id', 'nilai semester ini', 'nilai');
    this.manager.addDocument('id', 'prestasi nilai saya', 'nilai');
    this.manager.addDocument('id', 'grades', 'nilai');
    this.manager.addDocument('id', 'report card', 'nilai');
    this.manager.addDocument('id', 'nilai tertinggi', 'nilai');
    this.manager.addDocument('id', 'nilai terendah', 'nilai');
    this.manager.addDocument('id', 'rekap nilai', 'nilai');
    this.manager.addDocument('id', 'info nilai', 'nilai');
    this.manager.addDocument('id', 'predikat saya', 'nilai');
    this.manager.addDocument('id', 'nilai akhir semester', 'nilai');

    // ========================================
    // INTENT: PRESENSI (Attendance) - EXPANDED
    // ========================================
    this.manager.addDocument('id', 'presensi saya', 'presensi');
    this.manager.addDocument('id', 'absen saya berapa', 'presensi');
    this.manager.addDocument('id', 'kehadiran saya', 'presensi');
    this.manager.addDocument('id', 'berapa kali saya tidak masuk', 'presensi');
    this.manager.addDocument('id', 'rekap presensi', 'presensi');
    this.manager.addDocument('id', 'persentase kehadiran', 'presensi');
    this.manager.addDocument('id', 'saya alpha berapa kali', 'presensi');
    this.manager.addDocument('id', 'cek absen', 'presensi');
    this.manager.addDocument('id', 'lihat kehadiran', 'presensi');
    this.manager.addDocument('id', 'lihat presensi', 'presensi');
    this.manager.addDocument('id', 'cek kehadiran', 'presensi');
    this.manager.addDocument('id', 'data presensi', 'presensi');
    this.manager.addDocument('id', 'data kehadiran', 'presensi');
    this.manager.addDocument('id', 'absensi saya', 'presensi');
    this.manager.addDocument('id', 'saya hadir berapa kali', 'presensi');
    this.manager.addDocument('id', 'saya izin berapa kali', 'presensi');
    this.manager.addDocument('id', 'saya sakit berapa kali', 'presensi');
    this.manager.addDocument('id', 'berapa persen kehadiran saya', 'presensi');
    this.manager.addDocument('id', 'statistik kehadiran', 'presensi');
    this.manager.addDocument('id', 'rekap absen', 'presensi');
    this.manager.addDocument('id', 'rekap absensi', 'presensi');
    this.manager.addDocument('id', 'riwayat kehadiran', 'presensi');
    this.manager.addDocument('id', 'riwayat presensi', 'presensi');
    this.manager.addDocument('id', 'catatan kehadiran', 'presensi');
    this.manager.addDocument('id', 'daftar hadir', 'presensi');
    this.manager.addDocument('id', 'attendance', 'presensi');
    this.manager.addDocument('id', 'absent', 'presensi');
    this.manager.addDocument('id', 'cek daftar hadir', 'presensi');
    this.manager.addDocument('id', 'presensi bulan ini', 'presensi');
    this.manager.addDocument('id', 'kehadiran bulan ini', 'presensi');
    this.manager.addDocument('id', 'absen hari ini', 'presensi');
    this.manager.addDocument('id', 'hadir hari ini', 'presensi');
    this.manager.addDocument('id', 'info presensi', 'presensi');
    this.manager.addDocument('id', 'info kehadiran', 'presensi');
    this.manager.addDocument('id', 'berapa hari saya alpha', 'presensi');
    this.manager.addDocument('id', 'berapa hari saya izin', 'presensi');
    this.manager.addDocument('id', 'berapa hari saya sakit', 'presensi');

    // ========================================
    // INTENT: PEMBAYARAN (Payment) - EXPANDED
    // ========================================
    this.manager.addDocument('id', 'status pembayaran saya', 'pembayaran');
    this.manager.addDocument('id', 'spp saya', 'pembayaran');
    this.manager.addDocument('id', 'tagihan saya berapa', 'pembayaran');
    this.manager.addDocument('id', 'sudah lunas belum', 'pembayaran');
    this.manager.addDocument('id', 'pembayaran bulan ini', 'pembayaran');
    this.manager.addDocument('id', 'tunggakan saya', 'pembayaran');
    this.manager.addDocument('id', 'cek pembayaran', 'pembayaran');
    this.manager.addDocument('id', 'bayar spp', 'pembayaran');
    this.manager.addDocument('id', 'uang sekolah', 'pembayaran');
    this.manager.addDocument('id', 'lihat pembayaran', 'pembayaran');
    this.manager.addDocument('id', 'lihat tagihan', 'pembayaran');
    this.manager.addDocument('id', 'info pembayaran', 'pembayaran');
    this.manager.addDocument('id', 'info tagihan', 'pembayaran');
    this.manager.addDocument('id', 'cek tagihan', 'pembayaran');
    this.manager.addDocument('id', 'cek spp', 'pembayaran');
    this.manager.addDocument('id', 'berapa tagihan saya', 'pembayaran');
    this.manager.addDocument('id', 'berapa spp saya', 'pembayaran');
    this.manager.addDocument('id', 'total tagihan', 'pembayaran');
    this.manager.addDocument('id', 'total pembayaran', 'pembayaran');
    this.manager.addDocument('id', 'riwayat pembayaran', 'pembayaran');
    this.manager.addDocument('id', 'history pembayaran', 'pembayaran');
    this.manager.addDocument('id', 'data pembayaran', 'pembayaran');
    this.manager.addDocument('id', 'rekap pembayaran', 'pembayaran');
    this.manager.addDocument('id', 'daftar pembayaran', 'pembayaran');
    this.manager.addDocument('id', 'daftar tagihan', 'pembayaran');
    this.manager.addDocument('id', 'belum bayar apa', 'pembayaran');
    this.manager.addDocument('id', 'yang belum dibayar', 'pembayaran');
    this.manager.addDocument('id', 'pembayaran yang tertunda', 'pembayaran');
    this.manager.addDocument('id', 'ada tunggakan', 'pembayaran');
    this.manager.addDocument('id', 'berapa tunggakan saya', 'pembayaran');
    this.manager.addDocument('id', 'spp lunas belum', 'pembayaran');
    this.manager.addDocument('id', 'pembayaran lunas belum', 'pembayaran');
    this.manager.addDocument('id', 'payment status', 'pembayaran');
    this.manager.addDocument('id', 'biaya sekolah', 'pembayaran');
    this.manager.addDocument('id', 'biaya pendidikan', 'pembayaran');
    this.manager.addDocument('id', 'iuran sekolah', 'pembayaran');
    this.manager.addDocument('id', 'pembayaran semester', 'pembayaran');
    this.manager.addDocument('id', 'tagihan semester', 'pembayaran');
    this.manager.addDocument('id', 'cara bayar spp', 'pembayaran');
    this.manager.addDocument('id', 'metode pembayaran', 'pembayaran');

    // ========================================
    // INTENT: INFORMASI (Information) - EXPANDED
    // ========================================
    this.manager.addDocument('id', 'pengumuman terbaru', 'informasi');
    this.manager.addDocument('id', 'ada pengumuman apa', 'informasi');
    this.manager.addDocument('id', 'informasi sekolah', 'informasi');
    this.manager.addDocument('id', 'kapan libur', 'informasi');
    this.manager.addDocument('id', 'ada acara apa', 'informasi');
    this.manager.addDocument('id', 'agenda sekolah', 'informasi');
    this.manager.addDocument('id', 'info terbaru', 'informasi');
    this.manager.addDocument('id', 'berita sekolah', 'informasi');
    this.manager.addDocument('id', 'lihat pengumuman', 'informasi');
    this.manager.addDocument('id', 'cek pengumuman', 'informasi');
    this.manager.addDocument('id', 'baca pengumuman', 'informasi');
    this.manager.addDocument('id', 'pengumuman hari ini', 'informasi');
    this.manager.addDocument('id', 'info hari ini', 'informasi');
    this.manager.addDocument('id', 'ada info apa', 'informasi');
    this.manager.addDocument('id', 'berita terbaru', 'informasi');
    this.manager.addDocument('id', 'kabar terbaru', 'informasi');
    this.manager.addDocument('id', 'update sekolah', 'informasi');
    this.manager.addDocument('id', 'ada update apa', 'informasi');
    this.manager.addDocument('id', 'acara sekolah', 'informasi');
    this.manager.addDocument('id', 'acara mendatang', 'informasi');
    this.manager.addDocument('id', 'event sekolah', 'informasi');
    this.manager.addDocument('id', 'kegiatan sekolah', 'informasi');
    this.manager.addDocument('id', 'kalender akademik', 'informasi');
    this.manager.addDocument('id', 'jadwal libur', 'informasi');
    this.manager.addDocument('id', 'libur semester', 'informasi');
    this.manager.addDocument('id', 'tanggal ujian', 'informasi');
    this.manager.addDocument('id', 'kapan ujian', 'informasi');
    this.manager.addDocument('id', 'kapan uts', 'informasi');
    this.manager.addDocument('id', 'kapan uas', 'informasi');
    this.manager.addDocument('id', 'info ujian', 'informasi');
    this.manager.addDocument('id', 'jadwal ujian', 'informasi');
    this.manager.addDocument('id', 'announcement', 'informasi');
    this.manager.addDocument('id', 'school news', 'informasi');

    // ========================================
    // INTENT: HELP (Bantuan) - EXPANDED
    // ========================================
    this.manager.addDocument('id', 'help', 'help');
    this.manager.addDocument('id', 'bantuan', 'help');
    this.manager.addDocument('id', 'tolong', 'help');
    this.manager.addDocument('id', 'panduan', 'help');
    this.manager.addDocument('id', 'cara menggunakan', 'help');
    this.manager.addDocument('id', 'bisa apa', 'help');
    this.manager.addDocument('id', 'apa yang bisa kamu lakukan', 'help');
    this.manager.addDocument('id', 'fitur apa saja', 'help');
    this.manager.addDocument('id', 'bisa bantu apa', 'help');
    this.manager.addDocument('id', 'kamu bisa apa', 'help');
    this.manager.addDocument('id', 'apa saja yang bisa ditanyakan', 'help');
    this.manager.addDocument('id', 'mau tanya', 'help');
    this.manager.addDocument('id', 'gimana cara pakai', 'help');
    this.manager.addDocument('id', 'gimana cara gunakan', 'help');
    this.manager.addDocument('id', 'tutorial', 'help');
    this.manager.addDocument('id', 'petunjuk', 'help');
    this.manager.addDocument('id', 'instruksi', 'help');
    this.manager.addDocument('id', 'menu apa saja', 'help');
    this.manager.addDocument('id', 'fitur chatbot', 'help');
    this.manager.addDocument('id', 'kemampuan chatbot', 'help');
    this.manager.addDocument('id', 'apa fungsimu', 'help');
    this.manager.addDocument('id', 'untuk apa kamu', 'help');
    this.manager.addDocument('id', 'aku butuh bantuan', 'help');
    this.manager.addDocument('id', 'bantu saya', 'help');
    this.manager.addDocument('id', 'bantu dong', 'help');
    this.manager.addDocument('id', 'tolong bantu', 'help');
    this.manager.addDocument('id', 'perlu bantuan', 'help');
    this.manager.addDocument('id', 'bingung', 'help');
    this.manager.addDocument('id', 'tidak tahu', 'help');
    this.manager.addDocument('id', 'tidak mengerti', 'help');
    this.manager.addDocument('id', 'perintah apa saja', 'help');
    this.manager.addDocument('id', 'command apa saja', 'help');
    this.manager.addDocument('id', 'daftar perintah', 'help');
    this.manager.addDocument('id', 'daftar fitur', 'help');

    // ========================================
    // INTENT: PROFIL (Profile/Data Diri) - NEW
    // ========================================
    this.manager.addDocument('id', 'data saya', 'profil');
    this.manager.addDocument('id', 'profil saya', 'profil');
    this.manager.addDocument('id', 'info saya', 'profil');
    this.manager.addDocument('id', 'data diri saya', 'profil');
    this.manager.addDocument('id', 'biodata saya', 'profil');
    this.manager.addDocument('id', 'nisn saya', 'profil');
    this.manager.addDocument('id', 'nip saya', 'profil');
    this.manager.addDocument('id', 'lihat profil', 'profil');
    this.manager.addDocument('id', 'cek profil', 'profil');
    this.manager.addDocument('id', 'tampilkan profil', 'profil');
    this.manager.addDocument('id', 'siapa saya', 'profil');
    this.manager.addDocument('id', 'nama saya', 'profil');
    this.manager.addDocument('id', 'nama lengkap saya', 'profil');
    this.manager.addDocument('id', 'nama saya siapa', 'profil');
    this.manager.addDocument('id', 'email saya', 'profil');
    this.manager.addDocument('id', 'alamat saya', 'profil');
    this.manager.addDocument('id', 'my profile', 'profil');
    this.manager.addDocument('id', 'my data', 'profil');
    this.manager.addDocument('id', 'who am i', 'profil');
    this.manager.addDocument('id', 'profil guru saya', 'profil');
    this.manager.addDocument('id', 'biodata guru', 'profil');

    // ========================================
    // INTENT: KELAS_GURU (Class/Students Info for Teacher) - NEW
    // ========================================
    this.manager.addDocument('id', 'ada berapa siswa saya', 'kelas_guru');
    this.manager.addDocument('id', 'berapa siswa saya', 'kelas_guru');
    this.manager.addDocument('id', 'jumlah siswa saya', 'kelas_guru');
    this.manager.addDocument('id', 'siswa saya berapa', 'kelas_guru');
    this.manager.addDocument('id', 'siswa di kelas saya', 'kelas_guru');
    this.manager.addDocument('id', 'ada berapa siswa di kelas saya', 'kelas_guru');
    this.manager.addDocument('id', 'berapa siswa di kelas', 'kelas_guru');
    this.manager.addDocument('id', 'jumlah siswa kelas saya', 'kelas_guru');
    this.manager.addDocument('id', 'daftar siswa kelas saya', 'kelas_guru');
    this.manager.addDocument('id', 'siswa yang saya ajar', 'kelas_guru');
    this.manager.addDocument('id', 'kelas yang saya ajar', 'kelas_guru');
    this.manager.addDocument('id', 'saya mengajar kelas apa', 'kelas_guru');
    this.manager.addDocument('id', 'saya ngajar kelas apa', 'kelas_guru');
    this.manager.addDocument('id', 'info kelas yang saya ajar', 'kelas_guru');
    this.manager.addDocument('id', 'data kelas yang diajar', 'kelas_guru');
    this.manager.addDocument('id', 'murid saya', 'kelas_guru');
    this.manager.addDocument('id', 'daftar murid', 'kelas_guru');
    this.manager.addDocument('id', 'berapa jumlah siswa', 'kelas_guru');
    this.manager.addDocument('id', 'total siswa yang diajar', 'kelas_guru');
    this.manager.addDocument('id', 'murid saya ada berapa', 'kelas_guru');
    this.manager.addDocument('id', 'berapa murid saya', 'kelas_guru');
    this.manager.addDocument('id', 'total murid saya', 'kelas_guru');
    this.manager.addDocument('id', 'kelas saya', 'kelas_guru');
    this.manager.addDocument('id', 'info kelas saya', 'kelas_guru');
    this.manager.addDocument('id', 'data kelas saya', 'kelas_guru');

    // ========================================
    // INTENT: DATA_GURU (Admin: Info Guru) - NEW
    // ========================================
    this.manager.addDocument('id', 'daftar guru', 'data_guru');
    this.manager.addDocument('id', 'data guru', 'data_guru');
    this.manager.addDocument('id', 'semua guru', 'data_guru');
    this.manager.addDocument('id', 'list guru', 'data_guru');
    this.manager.addDocument('id', 'berapa jumlah guru', 'data_guru');
    this.manager.addDocument('id', 'total guru', 'data_guru');
    this.manager.addDocument('id', 'ada berapa guru', 'data_guru');
    this.manager.addDocument('id', 'info guru', 'data_guru');
    this.manager.addDocument('id', 'lihat guru', 'data_guru');
    this.manager.addDocument('id', 'tampilkan guru', 'data_guru');
    this.manager.addDocument('id', 'guru yang ada', 'data_guru');
    this.manager.addDocument('id', 'guru siapa saja', 'data_guru');
    this.manager.addDocument('id', 'daftar pengajar', 'data_guru');
    this.manager.addDocument('id', 'data pengajar', 'data_guru');

    // ========================================
    // INTENT: DATA_SISWA (Admin: Info Siswa) - NEW
    // ========================================
    this.manager.addDocument('id', 'daftar siswa', 'data_siswa');
    this.manager.addDocument('id', 'data siswa', 'data_siswa');
    this.manager.addDocument('id', 'semua siswa', 'data_siswa');
    this.manager.addDocument('id', 'list siswa', 'data_siswa');
    this.manager.addDocument('id', 'berapa jumlah siswa', 'data_siswa');
    this.manager.addDocument('id', 'total siswa', 'data_siswa');
    this.manager.addDocument('id', 'ada berapa siswa', 'data_siswa');
    this.manager.addDocument('id', 'info siswa', 'data_siswa');
    this.manager.addDocument('id', 'lihat siswa', 'data_siswa');
    this.manager.addDocument('id', 'tampilkan siswa', 'data_siswa');
    this.manager.addDocument('id', 'siswa yang ada', 'data_siswa');
    this.manager.addDocument('id', 'siswa siapa saja', 'data_siswa');
    this.manager.addDocument('id', 'data murid', 'data_siswa');
    this.manager.addDocument('id', 'daftar murid', 'data_siswa');
    this.manager.addDocument('id', 'siswa kelas 1a', 'data_siswa');
    this.manager.addDocument('id', 'siswa di kelas', 'data_siswa');
    this.manager.addDocument('id', 'murid kelas', 'data_siswa');

    // ========================================
    // INTENT: DATA_KELAS (Admin: Info Kelas) - NEW
    // ========================================
    this.manager.addDocument('id', 'daftar kelas', 'data_kelas');
    this.manager.addDocument('id', 'data kelas', 'data_kelas');
    this.manager.addDocument('id', 'semua kelas', 'data_kelas');
    this.manager.addDocument('id', 'list kelas', 'data_kelas');
    this.manager.addDocument('id', 'berapa jumlah kelas', 'data_kelas');
    this.manager.addDocument('id', 'total kelas', 'data_kelas');
    this.manager.addDocument('id', 'ada berapa kelas', 'data_kelas');
    this.manager.addDocument('id', 'info kelas', 'data_kelas');
    this.manager.addDocument('id', 'lihat kelas', 'data_kelas');
    this.manager.addDocument('id', 'tampilkan kelas', 'data_kelas');
    this.manager.addDocument('id', 'kelas apa saja', 'data_kelas');
    this.manager.addDocument('id', 'kelas yang ada', 'data_kelas');

    // ========================================
    // INTENT: MATA_PELAJARAN (Daftar Mapel) - NEW
    // ========================================
    this.manager.addDocument('id', 'mata pelajaran', 'mata_pelajaran');
    this.manager.addDocument('id', 'berapa mata pelajaran', 'mata_pelajaran');
    this.manager.addDocument('id', 'daftar mata pelajaran', 'mata_pelajaran');
    this.manager.addDocument('id', 'data mata pelajaran', 'mata_pelajaran');
    this.manager.addDocument('id', 'mapel apa saja', 'mata_pelajaran');
    this.manager.addDocument('id', 'ada mapel apa', 'mata_pelajaran');
    this.manager.addDocument('id', 'pelajaran apa saja', 'mata_pelajaran');
    this.manager.addDocument('id', 'daftar mapel', 'mata_pelajaran');
    this.manager.addDocument('id', 'semua mata pelajaran', 'mata_pelajaran');
    this.manager.addDocument('id', 'list mata pelajaran', 'mata_pelajaran');
    this.manager.addDocument('id', 'info mata pelajaran', 'mata_pelajaran');
    this.manager.addDocument('id', 'berapa jumlah mapel', 'mata_pelajaran');
    this.manager.addDocument('id', 'total mata pelajaran', 'mata_pelajaran');
    this.manager.addDocument('id', 'ada berapa mapel', 'mata_pelajaran');
    this.manager.addDocument('id', 'pelajaran yang ada', 'mata_pelajaran');
    this.manager.addDocument('id', 'mapel yang diajar', 'mata_pelajaran');
    this.manager.addDocument('id', 'mapel di sekolah', 'mata_pelajaran');

    // ========================================
    // INTENT: KONFIRMASI_YA (Yes confirmation) - NEW
    // ========================================
    this.manager.addDocument('id', 'ya', 'konfirmasi_ya');
    this.manager.addDocument('id', 'iya', 'konfirmasi_ya');
    this.manager.addDocument('id', 'yes', 'konfirmasi_ya');
    this.manager.addDocument('id', 'oke', 'konfirmasi_ya');
    this.manager.addDocument('id', 'ok', 'konfirmasi_ya');
    this.manager.addDocument('id', 'baik', 'konfirmasi_ya');
    this.manager.addDocument('id', 'setuju', 'konfirmasi_ya');
    this.manager.addDocument('id', 'ya dong', 'konfirmasi_ya');
    this.manager.addDocument('id', 'iya dong', 'konfirmasi_ya');
    this.manager.addDocument('id', 'boleh', 'konfirmasi_ya');
    this.manager.addDocument('id', 'mau', 'konfirmasi_ya');
    this.manager.addDocument('id', 'tolong', 'konfirmasi_ya');

    // ========================================
    // INTENT: KONFIRMASI_TIDAK (No confirmation) - NEW
    // ========================================
    this.manager.addDocument('id', 'tidak', 'konfirmasi_tidak');
    this.manager.addDocument('id', 'nggak', 'konfirmasi_tidak');
    this.manager.addDocument('id', 'ngga', 'konfirmasi_tidak');
    this.manager.addDocument('id', 'gak', 'konfirmasi_tidak');
    this.manager.addDocument('id', 'ga', 'konfirmasi_tidak');
    this.manager.addDocument('id', 'no', 'konfirmasi_tidak');
    this.manager.addDocument('id', 'tidak usah', 'konfirmasi_tidak');
    this.manager.addDocument('id', 'gak usah', 'konfirmasi_tidak');
    this.manager.addDocument('id', 'batal', 'konfirmasi_tidak');
    this.manager.addDocument('id', 'tidak jadi', 'konfirmasi_tidak');
    this.manager.addDocument('id', 'gak jadi', 'konfirmasi_tidak');
    this.manager.addDocument('id', 'nanti dulu', 'konfirmasi_tidak');

    // ========================================
    // INTENT: DATETIME (Date & Time Info) - NEW
    // ========================================
    this.manager.addDocument('id', 'sekarang hari apa', 'datetime');
    this.manager.addDocument('id', 'hari apa sekarang', 'datetime');
    this.manager.addDocument('id', 'hari ini hari apa', 'datetime');
    this.manager.addDocument('id', 'tanggal berapa sekarang', 'datetime');
    this.manager.addDocument('id', 'sekarang tanggal berapa', 'datetime');
    this.manager.addDocument('id', 'tanggal berapa hari ini', 'datetime');
    this.manager.addDocument('id', 'hari ini tanggal berapa', 'datetime');
    this.manager.addDocument('id', 'jam berapa sekarang', 'datetime');
    this.manager.addDocument('id', 'sekarang jam berapa', 'datetime');
    this.manager.addDocument('id', 'waktu sekarang', 'datetime');
    this.manager.addDocument('id', 'sekarang waktu berapa', 'datetime');
    this.manager.addDocument('id', 'waktu berapa sekarang', 'datetime');
    this.manager.addDocument('id', 'cek tanggal', 'datetime');
    this.manager.addDocument('id', 'cek jam', 'datetime');
    this.manager.addDocument('id', 'lihat jam', 'datetime');
    this.manager.addDocument('id', 'lihat tanggal', 'datetime');
    this.manager.addDocument('id', 'tanggal hari ini', 'datetime');
    this.manager.addDocument('id', 'jam hari ini', 'datetime');
    this.manager.addDocument('id', 'hari apa', 'datetime');
    this.manager.addDocument('id', 'tanggal berapa', 'datetime');
    this.manager.addDocument('id', 'jam berapa', 'datetime');
    this.manager.addDocument('id', 'waktu berapa', 'datetime');
    this.manager.addDocument('id', 'what time is it', 'datetime');
    this.manager.addDocument('id', 'what date is it', 'datetime');
    this.manager.addDocument('id', 'what day is it', 'datetime');
    this.manager.addDocument('id', 'sekarang bulan apa', 'datetime');
    this.manager.addDocument('id', 'bulan apa sekarang', 'datetime');
    this.manager.addDocument('id', 'bulan berapa', 'datetime');
    this.manager.addDocument('id', 'tahun berapa', 'datetime');
    this.manager.addDocument('id', 'sekarang tahun berapa', 'datetime');
    this.manager.addDocument('id', 'tanggal dan waktu', 'datetime');
    this.manager.addDocument('id', 'tanggal waktu sekarang', 'datetime');
    this.manager.addDocument('id', 'date', 'datetime');
    this.manager.addDocument('id', 'time', 'datetime');
    this.manager.addDocument('id', 'datetime', 'datetime');
    this.manager.addDocument('id', 'current time', 'datetime');
    this.manager.addDocument('id', 'current date', 'datetime');

    console.log('✅ Training data setup completed');
  }

  /**
   * Train NLP model
   */
  async train() {
    try {
      console.log('🎓 Training NLP model...');

      await this.setupTrainingData();
      await this.manager.train();

      this.isTrained = true;

      // Save model ke file
      this.manager.save(this.modelPath);

      // Count intents after training
      const intentCount = this.countIntents();
      console.log(`✅ Model trained and saved to: ${this.modelPath}`);
      console.log(`📊 Total intents trained: ${intentCount}`);

      return true;
    } catch (error) {
      console.error('❌ Error training NLP model:', error);
      return false;
    }
  }

  /**
   * Count total intents yang di-train
   */
  countIntents() {
    const intents = new Set();

    // Count dari documents yang ditambahkan
    if (this.manager.nluManager && this.manager.nluManager.domainManagers) {
      const domainManager = this.manager.nluManager.domainManagers.id;
      if (domainManager && domainManager.sentences) {
        domainManager.sentences.forEach(sentence => {
          if (sentence.intent) {
            intents.add(sentence.intent);
          }
        });
      }
    }

    return intents.size;
  }

  /**
   * Load trained model dari file
   */
  async loadModel() {
    try {
      if (fs.existsSync(this.modelPath)) {
        console.log('📂 Loading existing NLP model...');
        this.manager.load(this.modelPath);
        this.isTrained = true;
        console.log('✅ Model loaded successfully');
        return true;
      } else {
        console.log('⚠️ No existing model found. Training new model...');
        return await this.train();
      }
    } catch (error) {
      console.error('❌ Error loading model:', error);
      console.log('🔄 Falling back to training new model...');
      return await this.train();
    }
  }

  /**
   * Process message dan return intent + entities
   */
  async process(message, context = {}) {
    try {
      if (!this.isTrained) {
        await this.loadModel();
      }

      // Process dengan NLP
      const result = await this.manager.process('id', message, context);

      return {
        intent_name: result.intent || 'unknown',
        confidence_score: result.score || 0,
        entities: result.entities || [],
        answer: result.answer || null,
        sentiment: result.sentiment || null,
        raw: result
      };
    } catch (error) {
      console.error('Error processing message:', error);
      return {
        intent_name: 'unknown',
        confidence_score: 0,
        entities: [],
        error: error.message
      };
    }
  }

  /**
   * Retrain model dengan data baru
   */
  async retrain(trainingData = []) {
    try {
      console.log('🔄 Retraining model with new data...');

      // Clear existing documents
      this.manager.clear();

      // Add base training data
      await this.setupTrainingData();

      // Add custom training data
      trainingData.forEach(data => {
        if (data.text && data.intent) {
          this.manager.addDocument('id', data.text, data.intent);
        }
      });

      // Train
      await this.manager.train();
      this.manager.save(this.modelPath);

      console.log('✅ Model retrained successfully');
      return true;
    } catch (error) {
      console.error('❌ Error retraining model:', error);
      return false;
    }
  }

  /**
   * Get model info
   */
  getModelInfo() {
    const intentCount = this.countIntents();
    const intents = [];

    // Get list of intent names
    if (this.manager.nluManager && this.manager.nluManager.domainManagers) {
      const domainManager = this.manager.nluManager.domainManagers.id;
      if (domainManager && domainManager.sentences) {
        const intentSet = new Set();
        domainManager.sentences.forEach(sentence => {
          if (sentence.intent) {
            intentSet.add(sentence.intent);
          }
        });
        intents.push(...Array.from(intentSet));
      }
    }

    return {
      isTrained: this.isTrained,
      languages: this.manager.languages,
      intents: intents,
      totalIntents: intentCount,
      modelPath: this.modelPath
    };
  }
}

// Export singleton instance
const nlpManager = new ChatbotNLPManager();

module.exports = nlpManager;
