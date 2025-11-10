const { Settings } = require('../models');

/**
 * Get tahun ajaran dan semester yang sedang aktif
 * @returns {Promise<{tahunAjaran: string, semester: string}>}
 */
const getAktifAkademik = async () => {
  try {
    const settingsTahun = await Settings.findOne({
      where: { key: 'tahun_ajaran_aktif' }
    });

    const settingsSemester = await Settings.findOne({
      where: { key: 'semester_aktif' }
    });

    return {
      tahunAjaran: settingsTahun?.value || '2024/2025',
      semester: settingsSemester?.value || 'Ganjil'
    };
  } catch (error) {
    console.error('Error getting akademik aktif:', error);
    // Return default values if error
    return {
      tahunAjaran: '2024/2025',
      semester: 'Ganjil'
    };
  }
};

/**
 * Convert semester string to number for backward compatibility
 * @param {string} semester - "Ganjil" or "Genap"
 * @returns {string} - "1" or "2"
 */
const semesterToNumber = (semester) => {
  return semester === 'Ganjil' ? '1' : '2';
};

/**
 * Convert semester number to string
 * @param {string|number} semesterNumber - "1", "2", 1, or 2
 * @returns {string} - "Ganjil" or "Genap"
 */
const numberToSemester = (semesterNumber) => {
  const num = semesterNumber.toString();
  return num === '1' ? 'Ganjil' : 'Genap';
};

module.exports = {
  getAktifAkademik,
  semesterToNumber,
  numberToSemester
};
