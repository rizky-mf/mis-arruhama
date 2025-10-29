// utils/helper.js
const bcrypt = require('bcryptjs');

/**
 * Generate random password
 * @param {number} length - Panjang password (default: 8)
 * @returns {string} Random password
 */
const generatePassword = (length = 8) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

/**
 * Hash password menggunakan bcrypt
 * @param {string} password - Plain password
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

/**
 * Generate username untuk siswa dari NISN
 * @param {string} nisn - NISN siswa
 * @returns {string} Username format: id_NISN
 */
const generateUsernameFromNISN = (nisn) => {
  return `id_${nisn}`;
};

/**
 * Pagination helper
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {object} Offset and limit
 */
const getPagination = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return { offset, limit: parseInt(limit) };
};

/**
 * Pagination response helper
 * @param {number} count - Total items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {object} Pagination metadata
 */
const getPaginationMeta = (count, page, limit) => {
  const totalPages = Math.ceil(count / limit);
  return {
    total: count,
    per_page: parseInt(limit),
    current_page: parseInt(page),
    total_pages: totalPages,
    has_next: page < totalPages,
    has_prev: page > 1
  };
};

/**
 * Format date to YYYY-MM-DD
 * @param {Date|string} date - Date object or string
 * @returns {string} Formatted date
 */
const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Validate NISN format (harus numeric dan panjang tertentu)
 * @param {string} nisn - NISN to validate
 * @returns {boolean} Is valid
 */
const validateNISN = (nisn) => {
  return /^[0-9]{10,20}$/.test(nisn);
};

/**
 * Clean string (trim and remove extra spaces)
 * @param {string} str - String to clean
 * @returns {string} Cleaned string
 */
const cleanString = (str) => {
  if (!str) return '';
  return str.toString().trim().replace(/\s+/g, ' ');
};

/**
 * Success response format
 */
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Error response format
 */
const errorResponse = (res, message, statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message
  };
  if (errors) {
    response.errors = errors;
  }
  return res.status(statusCode).json(response);
};

module.exports = {
  generatePassword,
  hashPassword,
  generateUsernameFromNISN,
  getPagination,
  getPaginationMeta,
  formatDate,
  validateNISN,
  cleanString,
  successResponse,
  errorResponse
};