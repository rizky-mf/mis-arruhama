// middlewares/auth.js
const jwt = require('jsonwebtoken');
const db = require('../models');

/**
 * Middleware untuk verifikasi JWT Token
 */
const verifyToken = async (req, res, next) => {
  try {
    // Ambil token dari header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Cek apakah user masih aktif
    const user = await db.User.findOne({
      where: { 
        id: decoded.id,
        is_active: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Attach user data ke request
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Middleware untuk cek role user
 * @param {Array} roles - Array role yang diizinkan ['admin', 'guru', 'siswa']
 */
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }

    next();
  };
};

/**
 * Middleware khusus untuk admin only
 */
const adminOnly = (req, res, next) => {
  return checkRole('admin')(req, res, next);
};

/**
 * Middleware untuk guru only
 */
const guruOnly = (req, res, next) => {
  return checkRole('guru')(req, res, next);
};

/**
 * Middleware untuk siswa only
 */
const siswaOnly = (req, res, next) => {
  return checkRole('siswa')(req, res, next);
};

module.exports = {
  verifyToken,
  checkRole,
  adminOnly,
  guruOnly,
  siswaOnly
};