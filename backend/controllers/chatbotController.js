// controllers/chatbotController.js
const db = require('../models');
const { Op } = require('sequelize');
const axios = require('axios');
const {
  successResponse,
  errorResponse
} = require('../utils/helper');

// URL Python NLP Service
const PYTHON_NLP_URL = process.env.PYTHON_NLP_URL || 'http://localhost:5001';

/**
 * Get chatbot response (dengan Python NLP)
 * POST /api/chatbot/ask
 */
const getChatbotResponse = async (req, res) => {
  try {
    const { message, context } = req.body;
    const userId = req.user?.id;

    // Validasi input
    if (!message || message.trim() === '') {
      return errorResponse(res, 'Message tidak boleh kosong', 400);
    }

    // STEP 1: Kirim message ke Python NLP service untuk intent & entity extraction
    let nlpResult;
    try {
      const nlpResponse = await axios.post(`${PYTHON_NLP_URL}/api/nlp/analyze`, {
        message: message.trim(),
        user_id: userId,
        user_role: req.user.role,
        context: context
      }, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
      });

      nlpResult = nlpResponse.data;
    } catch (nlpError) {
      console.error('Python NLP Service error:', nlpError.message);
      
      // Fallback ke rule-based jika Python service down
      nlpResult = {
        intent_name: analyzeIntentFallback(message),
        entities: {},
        confidence_score: 0.5
      };
    }

    // STEP 2: Cari atau buat intent di database
    let [intent, created] = await db.ChatbotIntent.findOrCreate({
      where: { intent_name: nlpResult.intent_name },
      defaults: {
        intent_name: nlpResult.intent_name,
        description: `Auto-created from user query`
      }
    });

    // STEP 3: Handle intent berdasarkan hasil NLP
    let response = {};

    // Cek confidence score
    if (nlpResult.confidence_score < 0.6) {
      response = getLowConfidenceResponse(nlpResult);
    } else {
      switch (nlpResult.intent_name) {
        case 'jadwal':
        case 'schedule':
          response = await getJadwalResponse(nlpResult, req.user);
          break;
        
        case 'nilai':
        case 'grades':
          response = await getNilaiResponse(nlpResult, req.user);
          break;
        
        case 'presensi':
        case 'attendance':
          response = await getPresensiResponse(nlpResult, req.user);
          break;
        
        case 'pembayaran':
        case 'payment':
          response = await getPembayaranResponse(nlpResult, req.user);
          break;
        
        case 'informasi':
        case 'information':
          response = await getInformasiResponse(nlpResult);
          break;
        
        case 'greeting':
        case 'salam':
          response = getGreetingResponse(req.user);
          break;
        
        case 'help':
        case 'bantuan':
          response = getHelpResponse();
          break;
        
        default:
          response = await getDefaultOrCustomResponse(intent.id);
      }
    }

    // STEP 4: Log ke database (ChatbotLog)
    await db.ChatbotLog.create({
      user_id: userId,
      user_message: message.trim(),
      bot_response: response.message || 'No response',
      intent_id: intent.id,
      confidence_score: nlpResult.confidence_score
    });

    successResponse(res, {
      ...response,
      intent: nlpResult.intent_name,
      confidence: nlpResult.confidence_score,
      entities: nlpResult.entities
    }, 'Chatbot response berhasil');

  } catch (error) {
    console.error('Chatbot error:', error);
    errorResponse(res, 'Gagal mendapatkan response dari chatbot', 500);
  }
};

/**
 * Train chatbot dengan data baru
 * POST /api/chatbot/train
 */
const trainChatbot = async (req, res) => {
  try {
    const { training_data } = req.body;

    if (!training_data || !Array.isArray(training_data)) {
      return errorResponse(res, 'Training data harus berupa array', 400);
    }

    // Kirim data training ke Python service
    const trainingResponse = await axios.post(`${PYTHON_NLP_URL}/api/nlp/train`, {
      training_data
    }, {
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization
      }
    });

    successResponse(res, trainingResponse.data, 'Model berhasil dilatih');

  } catch (error) {
    console.error('Train chatbot error:', error);
    errorResponse(res, 'Gagal melatih model chatbot', 500);
  }
};

/**
 * Get chatbot statistics
 * GET /api/chatbot/stats
 */
const getChatbotStats = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const where = {};
    if (start_date && end_date) {
      where.created_at = {
        [Op.between]: [start_date, end_date]
      };
    }

    // Total chat interactions
    const totalChats = await db.ChatbotLog.count({ where });

    // Intent distribution
    const intentStats = await db.ChatbotLog.findAll({
      where,
      attributes: [
        'intent_id',
        [db.sequelize.fn('COUNT', db.sequelize.col('chatbot_logs.id')), 'count']
      ],
      include: [
        {
          model: db.ChatbotIntent,
          as: 'intent',
          attributes: ['intent_name', 'description']
        }
      ],
      group: ['intent_id', 'intent.id'],
      raw: false
    });

    // Average confidence
    const avgConfidence = await db.ChatbotLog.findOne({
      where,
      attributes: [
        [db.sequelize.fn('AVG', db.sequelize.col('confidence_score')), 'avg_confidence']
      ],
      raw: true
    });

    // Most active users
    const activeUsers = await db.ChatbotLog.findAll({
      where,
      attributes: [
        'user_id',
        [db.sequelize.fn('COUNT', db.sequelize.col('chatbot_logs.id')), 'chat_count']
      ],
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['username', 'role']
        }
      ],
      group: ['user_id', 'user.id'],
      order: [[db.sequelize.literal('chat_count'), 'DESC']],
      limit: 10,
      raw: false
    });

    successResponse(res, {
      total_interactions: totalChats,
      intent_distribution: intentStats,
      average_confidence: parseFloat(avgConfidence?.avg_confidence || 0).toFixed(4),
      most_active_users: activeUsers
    }, 'Statistik chatbot berhasil diambil');

  } catch (error) {
    console.error('Get chatbot stats error:', error);
    errorResponse(res, 'Gagal mengambil statistik chatbot', 500);
  }
};

/**
 * Get chat history untuk user
 * GET /api/chatbot/history
 */
const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50 } = req.query;

    const history = await db.ChatbotLog.findAll({
      where: { user_id: userId },
      include: [
        {
          model: db.ChatbotIntent,
          as: 'intent',
          attributes: ['intent_name']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit)
    });

    // Format untuk chat UI
    const formattedHistory = [];
    history.reverse().forEach(log => {
      formattedHistory.push({
        id: `${log.id}_user`,
        message: log.user_message,
        is_bot: false,
        created_at: log.created_at
      });
      formattedHistory.push({
        id: `${log.id}_bot`,
        message: log.bot_response,
        is_bot: true,
        intent: log.intent?.intent_name,
        confidence: log.confidence_score,
        created_at: log.created_at
      });
    });

    successResponse(res, formattedHistory, 'Chat history berhasil diambil');

  } catch (error) {
    console.error('Get chat history error:', error);
    errorResponse(res, 'Gagal mengambil chat history', 500);
  }
};

/**
 * Clear chat history
 * DELETE /api/chatbot/history
 */
const clearChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    await db.ChatbotLog.destroy({
      where: { user_id: userId }
    });

    successResponse(res, null, 'Chat history berhasil dihapus');

  } catch (error) {
    console.error('Clear chat history error:', error);
    errorResponse(res, 'Gagal menghapus chat history', 500);
  }
};

/**
 * Get FAQ list
 * GET /api/chatbot/faq
 */
const getFAQ = async (req, res) => {
  try {
    const faqList = [
      {
        category: 'Jadwal',
        questions: [
          'Apa jadwal saya hari ini?',
          'Kapan ujian semester?',
          'Jadwal pelajaran besok apa?'
        ]
      },
      {
        category: 'Nilai',
        questions: [
          'Berapa nilai rata-rata saya?',
          'Lihat nilai rapor semester ini',
          'Nilai matematika saya berapa?'
        ]
      },
      {
        category: 'Presensi',
        questions: [
          'Berapa persentase kehadiran saya?',
          'Berapa kali saya tidak masuk?',
          'Rekap presensi bulan ini'
        ]
      },
      {
        category: 'Pembayaran',
        questions: [
          'Status pembayaran SPP saya?',
          'Tagihan saya berapa?',
          'Pembayaran bulan ini sudah lunas?'
        ]
      },
      {
        category: 'Informasi',
        questions: [
          'Kapan libur semester?',
          'Pengumuman terbaru apa?',
          'Ada acara sekolah kapan?'
        ]
      }
    ];

    successResponse(res, faqList, 'FAQ berhasil diambil');

  } catch (error) {
    console.error('Get FAQ error:', error);
    errorResponse(res, 'Gagal mengambil FAQ', 500);
  }
};

/**
 * Manage intents (CRUD)
 * GET /api/chatbot/intents
 */
const getAllIntents = async (req, res) => {
  try {
    const intents = await db.ChatbotIntent.findAll({
      include: [
        {
          model: db.ChatbotResponse,
          as: 'responses',
          attributes: ['id', 'response_text', 'priority']
        }
      ],
      order: [['intent_name', 'ASC']]
    });

    successResponse(res, intents, 'Intent berhasil diambil');

  } catch (error) {
    console.error('Get intents error:', error);
    errorResponse(res, 'Gagal mengambil intent', 500);
  }
};

/**
 * Create intent
 * POST /api/chatbot/intents
 */
const createIntent = async (req, res) => {
  try {
    const { intent_name, description } = req.body;

    if (!intent_name) {
      return errorResponse(res, 'intent_name wajib diisi', 400);
    }

    const intent = await db.ChatbotIntent.create({
      intent_name,
      description: description || null
    });

    successResponse(res, intent, 'Intent berhasil ditambahkan', 201);

  } catch (error) {
    console.error('Create intent error:', error);
    errorResponse(res, 'Gagal menambahkan intent', 500);
  }
};

/**
 * Update intent
 * PUT /api/chatbot/intents/:id
 */
const updateIntent = async (req, res) => {
  try {
    const { id } = req.params;
    const { intent_name, description } = req.body;

    const intent = await db.ChatbotIntent.findByPk(id);
    if (!intent) {
      return errorResponse(res, 'Intent tidak ditemukan', 404);
    }

    await intent.update({
      intent_name: intent_name || intent.intent_name,
      description: description !== undefined ? description : intent.description
    });

    successResponse(res, intent, 'Intent berhasil diupdate');

  } catch (error) {
    console.error('Update intent error:', error);
    errorResponse(res, 'Gagal mengupdate intent', 500);
  }
};

/**
 * Delete intent
 * DELETE /api/chatbot/intents/:id
 */
const deleteIntent = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { id } = req.params;

    const intent = await db.ChatbotIntent.findByPk(id);
    if (!intent) {
      return errorResponse(res, 'Intent tidak ditemukan', 404);
    }

    // Delete related responses dan logs
    await db.ChatbotResponse.destroy({ where: { intent_id: id }, transaction });
    await db.ChatbotLog.update(
      { intent_id: null }, 
      { where: { intent_id: id }, transaction }
    );
    await intent.destroy({ transaction });

    await transaction.commit();

    successResponse(res, null, 'Intent berhasil dihapus');

  } catch (error) {
    await transaction.rollback();
    console.error('Delete intent error:', error);
    errorResponse(res, 'Gagal menghapus intent', 500);
  }
};

/**
 * Manage responses for intent
 * GET /api/chatbot/intents/:intent_id/responses
 */
const getResponsesByIntent = async (req, res) => {
  try {
    const { intent_id } = req.params;

    const responses = await db.ChatbotResponse.findAll({
      where: { intent_id },
      order: [['priority', 'DESC'], ['created_at', 'ASC']]
    });

    successResponse(res, responses, 'Response berhasil diambil');

  } catch (error) {
    console.error('Get responses error:', error);
    errorResponse(res, 'Gagal mengambil response', 500);
  }
};

/**
 * Create response for intent
 * POST /api/chatbot/intents/:intent_id/responses
 */
const createResponse = async (req, res) => {
  try {
    const { intent_id } = req.params;
    const { response_text, priority } = req.body;

    if (!response_text) {
      return errorResponse(res, 'response_text wajib diisi', 400);
    }

    // Cek intent exists
    const intent = await db.ChatbotIntent.findByPk(intent_id);
    if (!intent) {
      return errorResponse(res, 'Intent tidak ditemukan', 404);
    }

    const response = await db.ChatbotResponse.create({
      intent_id,
      response_text,
      priority: priority || 1
    });

    successResponse(res, response, 'Response berhasil ditambahkan', 201);

  } catch (error) {
    console.error('Create response error:', error);
    errorResponse(res, 'Gagal menambahkan response', 500);
  }
};

/**
 * Update response
 * PUT /api/chatbot/responses/:id
 */
const updateResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { response_text, priority } = req.body;

    const response = await db.ChatbotResponse.findByPk(id);
    if (!response) {
      return errorResponse(res, 'Response tidak ditemukan', 404);
    }

    await response.update({
      response_text: response_text || response.response_text,
      priority: priority !== undefined ? priority : response.priority
    });

    successResponse(res, response, 'Response berhasil diupdate');

  } catch (error) {
    console.error('Update response error:', error);
    errorResponse(res, 'Gagal mengupdate response', 500);
  }
};

/**
 * Delete response
 * DELETE /api/chatbot/responses/:id
 */
const deleteResponse = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await db.ChatbotResponse.findByPk(id);
    if (!response) {
      return errorResponse(res, 'Response tidak ditemukan', 404);
    }

    await response.destroy();

    successResponse(res, null, 'Response berhasil dihapus');

  } catch (error) {
    console.error('Delete response error:', error);
    errorResponse(res, 'Gagal menghapus response', 500);
  }
};

// ==================== HELPER FUNCTIONS ====================

const analyzeIntentFallback = (message) => {
  const lowerMessage = message.toLowerCase();

  if (/(jadwal|pelajaran|mengajar|kelas|hari ini|besok)/.test(lowerMessage)) return 'jadwal';
  if (/(nilai|rapor|ujian|uts|uas|rata-rata)/.test(lowerMessage)) return 'nilai';
  if (/(presensi|absen|kehadiran|masuk|sakit)/.test(lowerMessage)) return 'presensi';
  if (/(bayar|pembayaran|spp|tagihan|lunas)/.test(lowerMessage)) return 'pembayaran';
  if (/(informasi|pengumuman|acara|event|libur)/.test(lowerMessage)) return 'informasi';
  if (/^(hai|halo|hello|hi|selamat)/.test(lowerMessage)) return 'greeting';

  return 'unknown';
};

const getLowConfidenceResponse = (nlpResult) => {
  return {
    message: `Maaf, saya kurang yakin memahami maksud Anda (confidence: ${(nlpResult.confidence_score * 100).toFixed(0)}%).\n\n` +
             `Coba tanyakan dengan lebih jelas atau ketik "bantuan" untuk panduan.`,
    data: null
  };
};

const getHelpResponse = () => {
  return {
    message: `📚 Panduan Chatbot MIS Ar-Ruhama\n\n` +
             `Saya dapat membantu Anda dengan:\n\n` +
             `1️⃣ Jadwal Pelajaran\n2️⃣ Nilai & Rapor\n3️⃣ Presensi\n4️⃣ Pembayaran\n5️⃣ Informasi Sekolah\n\n` +
             `Ketik pertanyaan Anda dengan bahasa natural!`,
    data: null
  };
};

const getDefaultOrCustomResponse = async (intentId) => {
  // Cari custom response dari database
  const customResponse = await db.ChatbotResponse.findOne({
    where: { intent_id: intentId },
    order: [['priority', 'DESC']]
  });

  if (customResponse) {
    return {
      message: customResponse.response_text,
      data: null
    };
  }

  return {
    message: 'Maaf, saya belum memahami pertanyaan Anda. 😅\n\nKetik "bantuan" untuk panduan.',
    data: null
  };
};

// Import helper functions (copy dari response sebelumnya)
const getJadwalResponse = async (nlpResult, user) => {
  // ... (sama seperti sebelumnya)
};

const getNilaiResponse = async (nlpResult, user) => {
  // ... (sama seperti sebelumnya)
};

const getPresensiResponse = async (nlpResult, user) => {
  // ... (sama seperti sebelumnya)
};

const getPembayaranResponse = async (nlpResult, user) => {
  // ... (sama seperti sebelumnya)
};

const getInformasiResponse = async (nlpResult) => {
  // ... (sama seperti sebelumnya)
};

const getGreetingResponse = (user) => {
  // ... (sama seperti sebelumnya)
};

module.exports = {
  getChatbotResponse,
  trainChatbot,
  getChatbotStats,
  getChatHistory,
  clearChatHistory,
  getFAQ,
  // Intent management
  getAllIntents,
  createIntent,
  updateIntent,
  deleteIntent,
  // Response management
  getResponsesByIntent,
  createResponse,
  updateResponse,
  deleteResponse
};