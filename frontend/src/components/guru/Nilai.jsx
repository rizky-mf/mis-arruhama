import { useState, useEffect, useRef } from 'react';
import { raporAPI, guruAPI, settingsAPI } from '../../services/api';
import { BookOpen, Award, Save, Download, Upload, FileSpreadsheet, FileText } from 'lucide-react';
import Layout from '../shared/Layout';
import Header from '../shared/Header';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

function Nilai() {
  const [activeTab, setActiveTab] = useState('input'); // 'input' or 'ranking'
  const fileInputRef = useRef(null);

  // Common state
  const [kelasList, setKelasList] = useState([]);
  const [mataPelajaranList, setMataPelajaranList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Akademik Aktif from Settings
  const [tahunAjaranAktif, setTahunAjaranAktif] = useState('2024/2025');
  const [semesterAktif, setSemesterAktif] = useState('Ganjil');

  // Input Nilai state
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedMapel, setSelectedMapel] = useState('');
  const [siswaList, setSiswaList] = useState([]);
  const [nilaiData, setNilaiData] = useState({});

  // Ranking state
  const [rankingKelas, setRankingKelas] = useState('');
  const [rankingData, setRankingData] = useState(null);

  // PDF Download Modal state
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfKelas, setPdfKelas] = useState('');
  const [pdfSiswaList, setPdfSiswaList] = useState([]);
  const [selectedSiswaForPdf, setSelectedSiswaForPdf] = useState('');
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    loadAkademikAktif();
    loadKelasList();
    loadMataPelajaranList();
  }, []);

  const loadAkademikAktif = async () => {
    try {
      const result = await settingsAPI.getAkademikAktif();
      if (result.success && result.data) {
        setTahunAjaranAktif(result.data.tahun_ajaran_aktif || '2024/2025');
        setSemesterAktif(result.data.semester_aktif || 'Ganjil');
      }
    } catch (error) {
      console.error('Error loading akademik aktif:', error);
    }
  };

  useEffect(() => {
    if (selectedKelas && selectedMapel && tahunAjaranAktif && semesterAktif) {
      loadNilaiData();
    }
  }, [selectedKelas, selectedMapel, tahunAjaranAktif, semesterAktif]);

  const loadKelasList = async () => {
    try {
      const result = await guruAPI.getKelasDiampu();
      setKelasList(result.data || []);
    } catch (error) {
      console.error('Error loading kelas:', error);
    }
  };

  const loadMataPelajaranList = async () => {
    try {
      const result = await guruAPI.getMataPelajaranDiampu();
      setMataPelajaranList(result.data || []);
    } catch (error) {
      console.error('Error loading mata pelajaran:', error);
    }
  };

  const loadNilaiData = async () => {
    if (!selectedKelas || !selectedMapel || !tahunAjaranAktif || !semesterAktif) return;

    setLoading(true);
    try {
      const result = await raporAPI.getRaporByKelas(selectedKelas, {
        mata_pelajaran_id: selectedMapel,
        semester: semesterAktif,
        tahun_ajaran: tahunAjaranAktif
      });

      console.log('Load nilai result:', result);

      // Backend returns data_rapor array with siswa data
      const dataRapor = result.data.data_rapor || [];
      console.log('Data rapor:', dataRapor);

      setSiswaList(dataRapor);

      // Initialize nilai data from existing records
      const initialData = {};
      dataRapor.forEach(item => {
        initialData[item.siswa.id] = {
          nilai_harian: item.nilai_harian || '',
          nilai_uts: item.nilai_uts || '',
          nilai_uas: item.nilai_uas || '',
          catatan: item.catatan || ''
        };
      });
      setNilaiData(initialData);

      console.log('Siswa list set:', dataRapor.length, 'items');
    } catch (error) {
      console.error('Error loading nilai data:', error);
      alert('Gagal memuat data nilai');
    } finally {
      setLoading(false);
    }
  };

  const loadRankingData = async () => {
    if (!rankingKelas) {
      alert('Pilih kelas terlebih dahulu');
      return;
    }

    setLoading(true);
    try {
      const result = await raporAPI.getRankingKelas(rankingKelas, {
        semester: semesterAktif,
        tahun_ajaran: tahunAjaranAktif
      });
      setRankingData(result.data);
    } catch (error) {
      console.error('Error loading ranking:', error);
      alert('Gagal memuat data ranking');
    } finally {
      setLoading(false);
    }
  };

  const handleNilaiChange = (siswaId, field, value) => {
    setNilaiData(prev => ({
      ...prev,
      [siswaId]: {
        ...prev[siswaId],
        [field]: value
      }
    }));
  };

  const handleSaveNilai = async () => {
    if (!selectedKelas || !selectedMapel) {
      alert('Pilih kelas dan mata pelajaran terlebih dahulu');
      return;
    }

    // Build rapor list - only include students with ALL three nilai filled (non-zero)
    const raporList = [];
    const invalidStudents = [];

    siswaList.forEach(item => {
      const nilai = nilaiData[item.siswa.id];

      // Check if at least one nilai is filled
      const hasNilai = nilai?.nilai_harian || nilai?.nilai_uts || nilai?.nilai_uas;

      if (hasNilai) {
        // Validate: semua nilai harus diisi dan tidak boleh 0
        const harian = nilai?.nilai_harian ? parseFloat(nilai.nilai_harian) : 0;
        const uts = nilai?.nilai_uts ? parseFloat(nilai.nilai_uts) : 0;
        const uas = nilai?.nilai_uas ? parseFloat(nilai.nilai_uas) : 0;

        // Check if all three are filled and > 0
        if (harian > 0 && uts > 0 && uas > 0) {
          // Valid: all three filled with values > 0
          raporList.push({
            siswa_id: item.siswa.id,
            nilai_harian: harian,
            nilai_uts: uts,
            nilai_uas: uas,
            catatan: nilai?.catatan || null
          });
        } else {
          // Invalid: some values are 0 or not filled
          invalidStudents.push(item.siswa.nama_lengkap);
        }
      }
    });

    // Show error if there are students with incomplete nilai
    if (invalidStudents.length > 0) {
      alert(
        `Nilai tidak lengkap untuk siswa berikut:\n\n${invalidStudents.join('\n')}\n\nSemua nilai (Harian, UTS, UAS) harus diisi dengan nilai > 0`
      );
      return;
    }

    if (raporList.length === 0) {
      alert('Tidak ada nilai yang diisi');
      return;
    }

    console.log('Sending rapor data:', {
      kelas_id: selectedKelas,
      mata_pelajaran_id: selectedMapel,
      semester: semesterAktif,
      tahun_ajaran: tahunAjaranAktif,
      rapor_list: raporList
    });

    setLoading(true);
    try {
      const result = await raporAPI.bulkCreateRapor({
        kelas_id: selectedKelas,
        mata_pelajaran_id: selectedMapel,
        semester: semesterAktif,
        tahun_ajaran: tahunAjaranAktif,
        rapor_list: raporList
      });

      console.log('Save result:', result);
      console.log('Save result data:', result.data);

      // Show detailed result
      let message = `Nilai berhasil diproses!\n\nBaru: ${result.data?.created || 0}\nUpdate: ${result.data?.updated || 0}`;

      if (result.data?.errors && result.data.errors.length > 0) {
        message += `\nError: ${result.data.errors.length}`;
        message += '\n\nDetail Error:';
        result.data.errors.forEach(err => {
          message += `\n- Siswa ID ${err.siswa_id}: ${err.error}`;
        });
        console.error('Save errors:', result.data.errors);
      }

      alert(message);

      // Reload data to get calculated nilai_akhir and predikat
      console.log('Reloading nilai data...');
      await loadNilaiData();
      console.log('Reload complete');
    } catch (error) {
      console.error('Error saving nilai:', error);
      console.error('Error response:', error.response?.data);
      alert(error.response?.data?.message || 'Gagal menyimpan nilai');
    } finally {
      setLoading(false);
    }
  };

  const getPredikatBadge = (predikat) => {
    if (!predikat) return null;

    const styles = {
      A: 'bg-green-100 text-green-800',
      B: 'bg-blue-100 text-blue-800',
      C: 'bg-yellow-100 text-yellow-800',
      D: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-bold ${styles[predikat] || 'bg-gray-100 text-gray-800'}`}>
        {predikat}
      </span>
    );
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (siswaList.length === 0) {
      alert('Tidak ada data untuk di-export');
      return;
    }

    // Get kelas and mapel names
    const kelasName = kelasList.find(k => k.id === parseInt(selectedKelas))?.nama_kelas || 'Unknown';
    const mapelName = mataPelajaranList.find(m => m.id === parseInt(selectedMapel))?.nama_mapel || 'Unknown';

    // Prepare data for Excel
    const excelData = siswaList.map((item, index) => ({
      'No': index + 1,
      'NISN': item.siswa.nisn,
      'Nama Siswa': item.siswa.nama_lengkap,
      'Nilai Harian': item.nilai_harian || '',
      'Nilai UTS': item.nilai_uts || '',
      'Nilai UAS': item.nilai_uas || '',
      'Nilai Akhir': item.nilai_akhir ? parseFloat(item.nilai_akhir).toFixed(2) : '',
      'Predikat': item.predikat || '',
      'Catatan': item.catatan || ''
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    ws['!cols'] = [
      { wch: 5 },   // No
      { wch: 15 },  // NISN
      { wch: 30 },  // Nama
      { wch: 15 },  // Harian
      { wch: 12 },  // UTS
      { wch: 12 },  // UAS
      { wch: 15 },  // Akhir
      { wch: 10 },  // Predikat
      { wch: 30 }   // Catatan
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Nilai');

    // Generate filename
    const filename = `Nilai_${kelasName}_${mapelName}_${semesterAktif}_${tahunAjaranAktif.replace('/', '-')}.xlsx`;

    // Download
    XLSX.writeFile(wb, filename);
  };

  // Download Template Excel
  const handleDownloadTemplate = () => {
    if (!selectedKelas || !selectedMapel) {
      alert('Pilih kelas dan mata pelajaran terlebih dahulu');
      return;
    }

    if (siswaList.length === 0) {
      alert('Tidak ada data siswa. Tampilkan data terlebih dahulu.');
      return;
    }

    // Get kelas and mapel names
    const kelasName = kelasList.find(k => k.id === parseInt(selectedKelas))?.nama_kelas || 'Unknown';
    const mapelName = mataPelajaranList.find(m => m.id === parseInt(selectedMapel))?.nama_mapel || 'Unknown';

    // Prepare template data (empty nilai)
    const templateData = siswaList.map((item, index) => ({
      'No': index + 1,
      'NISN': item.siswa.nisn,
      'Nama Siswa': item.siswa.nama_lengkap,
      'Nilai Harian': '',
      'Nilai UTS': '',
      'Nilai UAS': '',
      'Catatan': ''
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(templateData);

    // Set column widths
    ws['!cols'] = [
      { wch: 5 },   // No
      { wch: 15 },  // NISN
      { wch: 30 },  // Nama
      { wch: 15 },  // Harian
      { wch: 12 },  // UTS
      { wch: 12 },  // UAS
      { wch: 30 }   // Catatan
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Nilai');

    // Generate filename
    const filename = `Template_Nilai_${kelasName}_${mapelName}.xlsx`;

    // Download
    XLSX.writeFile(wb, filename);
  };

  // Import from Excel
  const handleImportExcel = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!selectedKelas || !selectedMapel) {
      alert('Pilih kelas dan mata pelajaran terlebih dahulu');
      event.target.value = ''; // Reset input
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          alert('File Excel kosong');
          return;
        }

        // Map imported data to nilai data
        const importedData = {};
        let importCount = 0;
        let errorCount = 0;
        const errors = [];

        jsonData.forEach((row, index) => {
          const nisn = row['NISN']?.toString().trim();
          const nilaiHarian = row['Nilai Harian'];
          const nilaiUTS = row['Nilai UTS'];
          const nilaiUAS = row['Nilai UAS'];
          const catatan = row['Catatan'] || '';

          // Find siswa by NISN
          const siswa = siswaList.find(s => s.siswa.nisn === nisn);

          if (!siswa) {
            errors.push(`Baris ${index + 2}: NISN ${nisn} tidak ditemukan`);
            errorCount++;
            return;
          }

          // Validate nilai (must be between 1-100)
          const validateNilai = (nilai, label) => {
            if (nilai === '' || nilai === null || nilai === undefined) return true; // Allow empty
            const num = parseFloat(nilai);
            if (isNaN(num) || num < 0 || num > 100) {
              errors.push(`Baris ${index + 2}: ${label} tidak valid (${nilai}). Harus 0-100`);
              errorCount++;
              return false;
            }
            return true;
          };

          if (!validateNilai(nilaiHarian, 'Nilai Harian')) return;
          if (!validateNilai(nilaiUTS, 'Nilai UTS')) return;
          if (!validateNilai(nilaiUAS, 'Nilai UAS')) return;

          // Set nilai data
          importedData[siswa.siswa.id] = {
            nilai_harian: nilaiHarian?.toString() || '',
            nilai_uts: nilaiUTS?.toString() || '',
            nilai_uas: nilaiUAS?.toString() || '',
            catatan: catatan?.toString() || ''
          };

          importCount++;
        });

        // Show results
        if (errorCount > 0) {
          alert(`Import selesai dengan error:\n\nBerhasil: ${importCount}\nError: ${errorCount}\n\nDetail Error:\n${errors.slice(0, 10).join('\n')}${errors.length > 10 ? '\n... dan lainnya' : ''}`);
        } else {
          alert(`Import berhasil!\n\n${importCount} data nilai diimport`);
        }

        // Update nilai data
        setNilaiData(prev => ({
          ...prev,
          ...importedData
        }));

      } catch (error) {
        console.error('Error reading Excel:', error);
        alert('Gagal membaca file Excel. Pastikan format file sesuai dengan template.');
      } finally {
        // Reset file input
        event.target.value = '';
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Load siswa list for PDF modal
  const loadSiswaForPdf = async (kelasId) => {
    if (!kelasId) return;

    try {
      // Use guruAPI to get siswa list directly by kelas
      const result = await guruAPI.getSiswaByKelas(kelasId);
      const siswaArray = result.data || [];
      setPdfSiswaList(siswaArray);
    } catch (error) {
      console.error('Error loading siswa for PDF:', error);
      alert('Gagal memuat daftar siswa');
    }
  };

  // Handle open PDF modal
  const handleOpenPdfModal = () => {
    setShowPdfModal(true);
    setPdfKelas('');
    setPdfSiswaList([]);
    setSelectedSiswaForPdf('');
  };

  // Handle kelas change in PDF modal
  const handlePdfKelasChange = (kelasId) => {
    setPdfKelas(kelasId);
    setSelectedSiswaForPdf('');
    if (kelasId) {
      loadSiswaForPdf(kelasId);
    } else {
      setPdfSiswaList([]);
    }
  };

  // Download PDF Rapor for selected siswa
  const handleDownloadPDF = async () => {
    if (!selectedSiswaForPdf) {
      alert('Pilih siswa terlebih dahulu');
      return;
    }

    setDownloadingPdf(true);

    try {
      // Get siswa info from pdfSiswaList (already loaded)
      const siswaInfo = pdfSiswaList.find(s => s.id === parseInt(selectedSiswaForPdf));

      if (!siswaInfo) {
        alert('Data siswa tidak ditemukan');
        setDownloadingPdf(false);
        return;
      }

      // Get all rapor data for this siswa
      const result = await raporAPI.getRaporBySiswa(selectedSiswaForPdf, {
        semester: semesterAktif,
        tahun_ajaran: tahunAjaranAktif
      });

      const raporData = result.data.rapor || [];
      const kelasName = kelasList.find(k => k.id === parseInt(pdfKelas))?.nama_kelas || '-';

      // Create PDF
      const doc = new jsPDF();

      // Header
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('RAPOR SISWA', 105, 20, { align: 'center' });
      doc.text('MIS AR RUHAMA', 105, 28, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.line(20, 32, 190, 32);

      // Student Info
      const yStart = 40;
      doc.setFontSize(10);

      const leftCol = [
        `NAMA           : ${siswaInfo.nama_lengkap}`,
        `NISN           : ${siswaInfo.nisn}`,
        `Jenis Kelamin  : ${siswaInfo.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}`
      ];

      const rightCol = [
        `Madrasah       : MIS AR RUHAMA`,
        `Kelas/Semester : ${kelasName} / ${semesterAktif}`,
        `Tahun Pelajaran: ${tahunAjaranAktif}`
      ];

      leftCol.forEach((text, i) => {
        doc.text(text, 20, yStart + (i * 6));
      });

      rightCol.forEach((text, i) => {
        doc.text(text, 105, yStart + (i * 6));
      });

      // Title section
      doc.setFont(undefined, 'bold');
      doc.setFontSize(11);
      doc.text('CAPAIAN KOMPETENSI', 20, yStart + 22);

      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      doc.text('Kriteria Ketuntasan Minimal (KKM) = 70', 20, yStart + 28);

      // Table data - ALL subjects (only showing Nilai Akhir and Predikat)
      const tableData = raporData.length > 0
        ? raporData.map((item, index) => [
            (index + 1).toString(),
            item.mataPelajaran?.nama_mapel || '-',
            item.nilai_akhir ? parseFloat(item.nilai_akhir).toFixed(0) : '-',
            item.predikat || '-'
          ])
        : [['1', 'Belum ada data nilai', '-', '-']];

      // Generate table
      autoTable(doc, {
        startY: yStart + 32,
        head: [[
          'No',
          'Mata Pelajaran',
          'Nilai',
          'Predikat'
        ]],
        body: tableData,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 4,
          halign: 'center'
        },
        headStyles: {
          fillColor: [44, 95, 45],
          textColor: [255, 255, 255],
          lineWidth: 0.5,
          lineColor: [0, 0, 0],
          fontStyle: 'bold'
        },
        bodyStyles: {
          lineWidth: 0.5,
          lineColor: [0, 0, 0]
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 15 },
          1: { halign: 'left', cellWidth: 100 },
          2: { halign: 'center', cellWidth: 30 },
          3: { halign: 'center', cellWidth: 30 }
        }
      });

      // Predikat legend
      const finalY = doc.lastAutoTable.finalY + 10;

      autoTable(doc, {
        startY: finalY,
        head: [[
          { content: 'KKM', rowSpan: 2 },
          { content: 'Predikat', colSpan: 4 }
        ], [
          'D', 'C', 'B', 'A'
        ]],
        body: [['70', '0 - 69', '70 - 79', '80 - 89', '90 - 100']],
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 3,
          halign: 'center'
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          lineWidth: 0.5,
          lineColor: [0, 0, 0],
          fontStyle: 'bold'
        },
        bodyStyles: {
          lineWidth: 0.5,
          lineColor: [0, 0, 0]
        },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 35 },
          2: { cellWidth: 35 },
          3: { cellWidth: 35 },
          4: { cellWidth: 35 }
        }
      });

      // Save PDF
      const filename = `Rapor_${siswaInfo.nama_lengkap.replace(/\s+/g, '_')}_${semesterAktif}_${tahunAjaranAktif.replace('/', '-')}.pdf`;
      doc.save(filename);

      const message = raporData.length > 0
        ? `PDF rapor berhasil di-download!\n\nSiswa: ${siswaInfo.nama_lengkap}\nTotal Mata Pelajaran: ${raporData.length}`
        : `PDF rapor berhasil di-download!\n\nSiswa: ${siswaInfo.nama_lengkap}\nCatatan: Siswa ini belum memiliki nilai`;

      alert(message);
      setShowPdfModal(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Terjadi kesalahan yang tidak diketahui';
      alert(`Gagal membuat PDF rapor\n\nError: ${errorMessage}`);
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <Header title="Input Nilai & Ranking" subtitle="Kelola nilai siswa dan lihat ranking kelas" />

        {/* Tabs & Actions */}
        <div className="flex items-center justify-between border-b border-gray-200">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('input')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'input'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Input Nilai
            </button>
            <button
              onClick={() => setActiveTab('ranking')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'ranking'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Ranking Kelas
            </button>
          </div>
          <button
            onClick={handleOpenPdfModal}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors mb-1"
          >
            <FileText size={18} />
            Download PDF Rapor
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'input' ? (
          <div className="space-y-6">
            {/* Info & Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="mb-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <p className="text-sm text-emerald-800">
                  <span className="font-semibold">Periode Aktif:</span> {tahunAjaranAktif} - Semester {semesterAktif}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kelas <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedKelas}
                    onChange={(e) => setSelectedKelas(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Pilih Kelas</option>
                    {kelasList.map((kelas) => (
                      <option key={kelas.id} value={kelas.id}>
                        {kelas.nama_kelas}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mata Pelajaran <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedMapel}
                    onChange={(e) => setSelectedMapel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Pilih Mapel</option>
                    {mataPelajaranList.map((mapel) => (
                      <option key={mapel.id} value={mapel.id}>
                        {mapel.nama_mapel}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={loadNilaiData}
                    disabled={!selectedKelas || !selectedMapel}
                    className="w-full px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <BookOpen size={20} className="inline mr-2" />
                    Tampilkan Data
                  </button>
                </div>
              </div>
            </div>

            {/* Excel Actions */}
            {siswaList.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleDownloadTemplate}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <FileSpreadsheet size={18} />
                    Download Template
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                  >
                    <Upload size={18} />
                    Import Excel
                  </button>
                  <button
                    onClick={handleExportExcel}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors"
                  >
                    <Download size={18} />
                    Export Excel
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleImportExcel}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  <strong>Petunjuk:</strong> Download template → Isi nilai → Import kembali → Simpan
                </p>
              </div>
            )}

            {/* Nilai Table */}
            {siswaList.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NISN</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Siswa</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Nilai Harian</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Nilai UTS</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Nilai UAS</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Nilai Akhir</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Predikat</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {siswaList.map((item, index) => (
                        <tr key={item.siswa.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{item.siswa.nisn}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.siswa.nama_lengkap}</td>
                          <td className="px-6 py-4 text-sm text-center">
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={nilaiData[item.siswa.id]?.nilai_harian || ''}
                              onChange={(e) => handleNilaiChange(item.siswa.id, 'nilai_harian', e.target.value)}
                              placeholder="1-100"
                              className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="px-6 py-4 text-sm text-center">
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={nilaiData[item.siswa.id]?.nilai_uts || ''}
                              onChange={(e) => handleNilaiChange(item.siswa.id, 'nilai_uts', e.target.value)}
                              placeholder="1-100"
                              className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="px-6 py-4 text-sm text-center">
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={nilaiData[item.siswa.id]?.nilai_uas || ''}
                              onChange={(e) => handleNilaiChange(item.siswa.id, 'nilai_uas', e.target.value)}
                              placeholder="1-100"
                              className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="px-6 py-4 text-sm text-center">
                            <span className="font-bold text-gray-900">
                              {item.nilai_akhir ? parseFloat(item.nilai_akhir).toFixed(2) : '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-center">
                            {getPredikatBadge(item.predikat)}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <input
                              type="text"
                              value={nilaiData[item.siswa.id]?.catatan || ''}
                              onChange={(e) => handleNilaiChange(item.siswa.id, 'catatan', e.target.value)}
                              placeholder="Catatan (opsional)"
                              className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Total Siswa: <span className="font-semibold">{siswaList.length}</span>
                  </p>
                  <button
                    onClick={handleSaveNilai}
                    disabled={loading}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Save size={18} />
                    {loading ? 'Menyimpan...' : 'Simpan Nilai'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100">
                <BookOpen size={48} className="mx-auto mb-4 text-gray-400" />
                <p>Pilih kelas, mata pelajaran, semester, dan tahun ajaran untuk menampilkan data siswa</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Ranking Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="mb-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <p className="text-sm text-emerald-800">
                  <span className="font-semibold">Periode Aktif:</span> {tahunAjaranAktif} - Semester {semesterAktif}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kelas <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={rankingKelas}
                    onChange={(e) => setRankingKelas(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Pilih Kelas</option>
                    {kelasList.map((kelas) => (
                      <option key={kelas.id} value={kelas.id}>
                        {kelas.nama_kelas}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={loadRankingData}
                    disabled={!rankingKelas}
                    className="w-full px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <Award size={20} className="inline mr-2" />
                    Tampilkan Ranking
                  </button>
                </div>
              </div>
            </div>

            {/* Ranking Display */}
            {rankingData && (
              <>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Ranking Kelas - {rankingData.kelas.nama_kelas} ({rankingData.periode.semester}, {rankingData.periode.tahun_ajaran})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Total Siswa</p>
                      <p className="text-2xl font-bold text-gray-800">{rankingData.total_siswa}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Siswa dengan Nilai</p>
                      <p className="text-2xl font-bold text-emerald-600">{rankingData.ranking.length}</p>
                    </div>
                  </div>
                </div>

                {/* Ranking Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ranking</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NISN</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Siswa</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Jumlah Mapel</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Rata-rata Nilai</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {rankingData.ranking.map((siswa) => (
                          <tr key={siswa.siswa.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-center">
                              {siswa.ranking <= 3 ? (
                                <div className="flex justify-center">
                                  <Award
                                    size={32}
                                    className={
                                      siswa.ranking === 1 ? 'text-yellow-500' :
                                      siswa.ranking === 2 ? 'text-gray-400' :
                                      'text-orange-600'
                                    }
                                    fill="currentColor"
                                  />
                                </div>
                              ) : (
                                <span className="text-lg font-bold text-gray-600">{siswa.ranking}</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">{siswa.siswa.nisn}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{siswa.siswa.nama_lengkap}</td>
                            <td className="px-6 py-4 text-sm text-center text-gray-900">{siswa.jumlah_mapel}</td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-lg font-bold text-emerald-600">{siswa.rata_rata}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                siswa.rata_rata >= 85 ? 'bg-green-100 text-green-800' :
                                siswa.rata_rata >= 70 ? 'bg-blue-100 text-blue-800' :
                                siswa.rata_rata >= 55 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {siswa.rata_rata >= 85 ? 'Sangat Baik' :
                                 siswa.rata_rata >= 70 ? 'Baik' :
                                 siswa.rata_rata >= 55 ? 'Cukup' : 'Kurang'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {!rankingData && !loading && (
              <div className="text-center py-12 text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100">
                <Award size={48} className="mx-auto mb-4 text-gray-400" />
                <p>Pilih kelas, semester, dan tahun ajaran untuk menampilkan ranking</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* PDF Download Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white rounded-t-2xl">
              <h2 className="text-xl font-bold">Download PDF Rapor</h2>
              <p className="text-red-100 text-sm mt-1">Pilih siswa untuk download rapor lengkap</p>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Pilih Kelas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Kelas <span className="text-red-500">*</span>
                </label>
                <select
                  value={pdfKelas}
                  onChange={(e) => handlePdfKelasChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">-- Pilih Kelas --</option>
                  {kelasList.map(kelas => (
                    <option key={kelas.id} value={kelas.id}>
                      {kelas.nama_kelas} - {kelas.tahun_ajaran}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pilih Siswa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Siswa <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedSiswaForPdf}
                  onChange={(e) => setSelectedSiswaForPdf(e.target.value)}
                  disabled={!pdfKelas || pdfSiswaList.length === 0}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {pdfSiswaList.map(siswa => (
                    <option key={siswa.id} value={siswa.id}>
                      {siswa.nama_lengkap} - {siswa.nisn}
                    </option>
                  ))}
                </select>
                {pdfKelas && pdfSiswaList.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">Tidak ada siswa di kelas ini</p>
                )}
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-xs text-blue-800">
                  <strong>Info:</strong> PDF rapor akan berisi semua nilai mata pelajaran siswa untuk semester {semesterAktif} tahun ajaran {tahunAjaranAktif}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-2xl flex gap-3">
              <button
                onClick={() => setShowPdfModal(false)}
                disabled={downloadingPdf}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={!selectedSiswaForPdf || downloadingPdf}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloadingPdf ? 'Downloading...' : 'Download PDF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Nilai;
