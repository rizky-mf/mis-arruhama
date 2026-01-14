/**
 * Response Utility untuk standardisasi response API
 * Menghindari duplikasi kode response di semua controller
 */

/**
 * Mengirim response sukses
 * @param {Object} res - Express response object
 * @param {*} data - Data yang akan dikirim
 * @param {string} message - Pesan sukses (default: 'Success')
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = {
    success: true,
    message
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Mengirim response error
 * @param {Object} res - Express response object
 * @param {string} message - Pesan error
 * @param {number} statusCode - HTTP status code (default: 400)
 * @param {*} errors - Detail error (optional, untuk validation errors)
 */
const sendError = (res, message = 'Error', statusCode = 400, errors = null) => {
  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Mengirim response sukses untuk operasi create
 * @param {Object} res - Express response object
 * @param {*} data - Data yang dibuat
 * @param {string} message - Pesan sukses (default: 'Data berhasil dibuat')
 */
const sendCreated = (res, data, message = 'Data berhasil dibuat') => {
  return sendSuccess(res, data, message, 201);
};

/**
 * Mengirim response sukses untuk operasi update
 * @param {Object} res - Express response object
 * @param {*} data - Data yang diupdate
 * @param {string} message - Pesan sukses (default: 'Data berhasil diupdate')
 */
const sendUpdated = (res, data, message = 'Data berhasil diupdate') => {
  return sendSuccess(res, data, message, 200);
};

/**
 * Mengirim response sukses untuk operasi delete
 * @param {Object} res - Express response object
 * @param {string} message - Pesan sukses (default: 'Data berhasil dihapus')
 */
const sendDeleted = (res, message = 'Data berhasil dihapus') => {
  return sendSuccess(res, null, message, 200);
};

/**
 * Mengirim response not found
 * @param {Object} res - Express response object
 * @param {string} message - Pesan error (default: 'Data tidak ditemukan')
 */
const sendNotFound = (res, message = 'Data tidak ditemukan') => {
  return sendError(res, message, 404);
};

/**
 * Mengirim response unauthorized
 * @param {Object} res - Express response object
 * @param {string} message - Pesan error (default: 'Unauthorized')
 */
const sendUnauthorized = (res, message = 'Unauthorized') => {
  return sendError(res, message, 401);
};

/**
 * Mengirim response forbidden
 * @param {Object} res - Express response object
 * @param {string} message - Pesan error (default: 'Forbidden')
 */
const sendForbidden = (res, message = 'Akses ditolak') => {
  return sendError(res, message, 403);
};

/**
 * Mengirim response validation error
 * @param {Object} res - Express response object
 * @param {*} errors - Validation errors
 * @param {string} message - Pesan error (default: 'Validation error')
 */
const sendValidationError = (res, errors, message = 'Validation error') => {
  return sendError(res, message, 422, errors);
};

/**
 * Mengirim response server error
 * @param {Object} res - Express response object
 * @param {string} message - Pesan error (default: 'Internal server error')
 * @param {Error} error - Error object (untuk development mode)
 */
const sendServerError = (res, message = 'Internal server error', error = null) => {
  const response = {
    success: false,
    message
  };

  // Hanya tampilkan stack trace di development mode
  if (process.env.NODE_ENV === 'development' && error) {
    response.stack = error.stack;
    response.error = error.message;
  }

  return res.status(500).json(response);
};

module.exports = {
  sendSuccess,
  sendError,
  sendCreated,
  sendUpdated,
  sendDeleted,
  sendNotFound,
  sendUnauthorized,
  sendForbidden,
  sendValidationError,
  sendServerError
};
