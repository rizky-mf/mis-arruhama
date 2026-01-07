// components/admin/SiswaExcelActions.jsx
import { useState, useRef } from 'react';
import { Download, Upload, FileSpreadsheet, AlertCircle, CheckCircle, X } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SiswaExcelActions = ({ onImportSuccess }) => {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const fileInputRef = useRef(null);

  // Get token from localStorage
  const getToken = () => {
    const token = localStorage.getItem('token');
    return token;
  };

  // Export siswa to Excel
  const handleExport = async () => {
    try {
      setExporting(true);
      const token = getToken();

      const response = await axios.get(`${API_URL}/excel/siswa/export`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Data_Siswa_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert('✓ Export data siswa berhasil!');
    } catch (error) {
      console.error('Error exporting:', error);
      alert('❌ Gagal export data siswa');
    } finally {
      setExporting(false);
    }
  };

  // Download template
  const handleDownloadTemplate = async () => {
    try {
      setDownloadingTemplate(true);
      const token = getToken();

      const response = await axios.get(`${API_URL}/excel/siswa/template`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Template_Import_Siswa.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert('✓ Download template berhasil!');
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('❌ Gagal download template');
    } finally {
      setDownloadingTemplate(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleImport(file);
    }
    // Reset input
    event.target.value = '';
  };

  // Import from Excel
  const handleImport = async (file) => {
    try {
      setImporting(true);
      const token = getToken();

      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_URL}/excel/siswa/import`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setImportResult(response.data.data);
        setShowResultModal(true);

        // Refresh data if successful
        if (response.data.data.successCount > 0 && onImportSuccess) {
          onImportSuccess();
        }
      }
    } catch (error) {
      console.error('Error importing:', error);
      alert(error.response?.data?.message || '❌ Gagal import data siswa');
    } finally {
      setImporting(false);
    }
  };

  // Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <div className="flex gap-2 flex-wrap">
        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="w-4 h-4" />
          {exporting ? 'Exporting...' : 'Export Excel'}
        </button>

        {/* Import Button */}
        <button
          onClick={triggerFileInput}
          disabled={importing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <Upload className="w-4 h-4" />
          {importing ? 'Importing...' : 'Import Excel'}
        </button>

        {/* Download Template Button */}
        <button
          onClick={handleDownloadTemplate}
          disabled={downloadingTemplate}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4" />
          {downloadingTemplate ? 'Downloading...' : 'Download Template'}
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Import Result Modal */}
      {showResultModal && importResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Hasil Import Data Siswa</h3>
              <button
                onClick={() => setShowResultModal(false)}
                className="text-white hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{importResult.totalRows}</div>
                  <div className="text-sm text-gray-600">Total Baris</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{importResult.successCount}</div>
                  <div className="text-sm text-gray-600">Berhasil</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{importResult.failedCount}</div>
                  <div className="text-sm text-gray-600">Gagal</div>
                </div>
              </div>

              {/* Success Details */}
              {importResult.successDetails && importResult.successDetails.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-green-700 flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5" />
                    Data Berhasil Diimport ({importResult.successCount})
                  </h4>
                  <div className="bg-green-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-green-200">
                          <th className="text-left py-2">Baris</th>
                          <th className="text-left py-2">NIS</th>
                          <th className="text-left py-2">Nama</th>
                          <th className="text-left py-2">Username</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importResult.successDetails.map((item, idx) => (
                          <tr key={idx} className="border-b border-green-100">
                            <td className="py-2">{item.row}</td>
                            <td className="py-2">{item.nis}</td>
                            <td className="py-2">{item.nama}</td>
                            <td className="py-2">{item.username}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Failed Details */}
              {importResult.failedDetails && importResult.failedDetails.length > 0 && (
                <div>
                  <h4 className="font-semibold text-red-700 flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5" />
                    Data Gagal Diimport ({importResult.failedCount})
                  </h4>
                  <div className="bg-red-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-red-200">
                          <th className="text-left py-2">Baris</th>
                          <th className="text-left py-2">NIS</th>
                          <th className="text-left py-2">Nama</th>
                          <th className="text-left py-2">Alasan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importResult.failedDetails.map((item, idx) => (
                          <tr key={idx} className="border-b border-red-100">
                            <td className="py-2">{item.row}</td>
                            <td className="py-2">{item.nis}</td>
                            <td className="py-2">{item.nama}</td>
                            <td className="py-2 text-red-600">{item.error}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowResultModal(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SiswaExcelActions;
