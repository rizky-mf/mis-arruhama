// controllers/chatbotController.js
const db = require('../models');
const { Op } = require('sequelize');
const nlpManager = require('../services/nlpManager');
const {
  successResponse,
  errorResponse
} = require('../utils/helper');

/**
 * Get chatbot response (dengan node-nlp)
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

    // STEP 1: Process message dengan NLP Manager
    const nlpResult = await nlpManager.process(message.trim(), context || {});

    // Extract intent dan confidence
    const intentName = nlpResult.intent_name || 'unknown';
    const confidenceScore = nlpResult.confidence_score || 0;

    // STEP 2: Cari atau buat intent di database
    let [intent] = await db.ChatbotIntent.findOrCreate({
      where: { intent_name: intentName },
      defaults: {
        intent_name: intentName,
        description: `Auto-created from user query`
      }
    });

    // STEP 3: Check recent low confidence count (untuk fallback offer)
    const recentLogs = await db.ChatbotLog.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: 4
    });

    const lowConfidenceCount = recentLogs.filter(log => log.confidence_score < 0.6).length;

    // STEP 4: Handle intent berdasarkan hasil NLP
    let response = {};

    // Cek confidence score
    if (confidenceScore < 0.6) {
      // Jika sudah 4 kali low confidence, tawarkan kontak langsung
      if (lowConfidenceCount >= 3) {
        response = await getContactOfferResponse(req.user);
      } else {
        response = getLowConfidenceResponse(nlpResult);
      }
    } else {
      switch (intentName) {
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
          response = await getGreetingResponse(req.user);
          break;

        case 'profil':
        case 'profile':
          response = await getProfilResponse(req.user);
          break;

        case 'kelas_guru':
        case 'class_teacher':
          response = await getKelasGuruResponse(req.user);
          break;

        case 'data_guru':
          response = await getDataGuruResponse(req.user);
          break;

        case 'data_siswa':
          response = await getDataSiswaResponse(req.user);
          break;

        case 'data_kelas':
          response = await getDataKelasResponse(req.user);
          break;

        case 'mata_pelajaran':
        case 'mapel':
          response = await getMataPelajaranResponse(req.user);
          break;

        case 'konfirmasi_ya':
          response = await getKonfirmasiYaResponse(req.user);
          break;

        case 'konfirmasi_tidak':
          response = await getKonfirmasiTidakResponse(req.user);
          break;

        case 'datetime':
          response = getDateTimeResponse();
          break;

        case 'hapus_chat':
        case 'clear_chat':
          response = getHapusChatResponse();
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
      confidence_score: confidenceScore
    });

    successResponse(res, {
      ...response,
      intent: intentName,
      confidence: confidenceScore,
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

    // Retrain NLP Manager dengan data baru
    const success = await nlpManager.retrain(training_data);

    if (success) {
      const modelInfo = nlpManager.getModelInfo();
      successResponse(res, modelInfo, 'Model berhasil dilatih');
    } else {
      errorResponse(res, 'Gagal melatih model chatbot', 500);
    }

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
  const responses = [
    `Hmm, aku kurang yakin nih maksudnya apa... 🤔\n\nBisa dijelaskan dengan kata-kata lain? Atau ketik "bantuan" untuk lihat apa aja yang bisa aku jawab ya!`,
    `Waduh, maaf aku belum paham maksudnya 😅\n\nCoba tanya dengan cara lain atau ketik "bantuan" untuk panduan lengkap!`,
    `Agak bingung nih aku... 😓\n\nBisa diulang dengan lebih jelas? Atau ketik "bantuan" untuk lihat menu yang tersedia!`
  ];

  return {
    message: responses[Math.floor(Math.random() * responses.length)],
    data: null
  };
};

const getDateTimeResponse = () => {
  const now = new Date();

  // Format tanggal dan waktu dalam bahasa Indonesia
  const hariMapping = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const bulanMapping = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const hari = hariMapping[now.getDay()];
  const tanggal = now.getDate();
  const bulan = bulanMapping[now.getMonth()];
  const tahun = now.getFullYear();

  // Format waktu (jam:menit:detik)
  const jam = String(now.getHours()).padStart(2, '0');
  const menit = String(now.getMinutes()).padStart(2, '0');
  const detik = String(now.getSeconds()).padStart(2, '0');

  const intros = [
    `Sekarang nih... ⏰\n\n`,
    `Oke, ini waktu sekarang ya! 🕐\n\n`,
    `Baik, aku kasih tau sekarang jam berapa... ⏱️\n\n`
  ];

  const closings = [
    `\nSemoga harimu menyenangkan! 😊`,
    `\nSelamat beraktivitas ya! ✨`,
    `\nTetap semangat! 💪`
  ];

  let message = intros[Math.floor(Math.random() * intros.length)];
  message += `📅 Hari **${hari}**\n`;
  message += `📆 Tanggal **${tanggal} ${bulan} ${tahun}**\n`;
  message += `⏰ Jam **${jam}:${menit}:${detik}** WIB`;
  message += closings[Math.floor(Math.random() * closings.length)];

  return {
    message,
    data: {
      hari,
      tanggal,
      bulan,
      tahun,
      jam,
      menit,
      detik,
      fullDate: `${hari}, ${tanggal} ${bulan} ${tahun}`,
      fullTime: `${jam}:${menit}:${detik}`,
      timestamp: now.toISOString()
    }
  };
};

const getHapusChatResponse = () => {
  const responses = [
    `Tenang aja, kamu bisa hapus chat ini kok! 🗑️\n\nLihat icon **🗑️ (tempat sampah)** di pojok kanan atas? Klik aja icon itu untuk menghapus semua riwayat chat kita. Chat akan bersih kembali! ✨`,
    `Bisa banget! Ada icon tempat sampah (🗑️) di bagian atas sebelah kanan. Klik itu kalau mau hapus semua chat ya! 😊`,
    `Oke! Untuk hapus chat, klik aja icon **🗑️** yang ada di pojok kanan atas header chat ini. Semua riwayat percakapan bakal terhapus deh! 👍`
  ];

  return {
    message: responses[Math.floor(Math.random() * responses.length)],
    data: null
  };
};

const getHelpResponse = () => {
  let message = `📚 **Hai! Aku MIRA** 🤖\n\n`;
  message += `Aku adalah asisten virtual **MIS Ar-Ruhama** yang siap bantu kamu cari info sekolah dengan cepat dan mudah lho! Gak perlu pakai perintah khusus, tinggal tanya aja pakai bahasa sehari-hari! 😊\n\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  message += `📅 **Jadwal Pelajaran**\n`;
  message += `Coba tanya:\n`;
  message += `• "Jadwal hari ini dong"\n`;
  message += `• "Besok ada pelajaran apa?"\n`;
  message += `• "Kapan pelajaran matematika?"\n\n`;

  message += `📊 **Nilai & Rapor**\n`;
  message += `Coba tanya:\n`;
  message += `• "Cek nilai rapor"\n`;
  message += `• "Berapa nilai matematika aku?"\n`;
  message += `• "Lihat nilai semester ini"\n\n`;

  message += `✅ **Presensi/Kehadiran**\n`;
  message += `Coba tanya:\n`;
  message += `• "Berapa persen kehadiran aku?"\n`;
  message += `• "Aku udah berapa kali alpha?"\n`;
  message += `• "Rekap presensi bulan ini"\n\n`;

  message += `💰 **Pembayaran**\n`;
  message += `Coba tanya:\n`;
  message += `• "Tagihan pembayaran"\n`;
  message += `• "Udah lunas belum?"\n`;
  message += `• "Berapa spp bulan ini?"\n\n`;

  message += `📢 **Informasi Sekolah**\n`;
  message += `Coba tanya:\n`;
  message += `• "Ada pengumuman apa?"\n`;
  message += `• "Info terbaru dong"\n`;
  message += `• "Kapan libur?"\n\n`;

  message += `👤 **Profil & Data Diri**\n`;
  message += `Coba tanya:\n`;
  message += `• "Profil aku"\n`;
  message += `• "Data kelas aku"\n`;
  message += `• "Siswa di kelas aku berapa?" (guru)\n\n`;

  message += `🕐 **Tanggal & Waktu**\n`;
  message += `Coba tanya:\n`;
  message += `• "Sekarang hari apa?"\n`;
  message += `• "Jam berapa sekarang?"\n`;
  message += `• "Tanggal berapa hari ini?"\n\n`;

  message += `💡 **Tips:** Kamu bisa tanya dengan gaya bahasamu sendiri. Aku bakal coba pahamin kok! Kalau aku bingung, aku bakal kasih tau dan minta kamu jelasin lagi ya 😄\n\n`;
  message += `Jangan ragu untuk bertanya apa aja! Aku siap bantu! 🚀`;

  return { message, data: null };
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

  const defaultResponses = [
    'Hmm, aku kurang yakin nih maksudnya apa... 🤔\n\nBisa tanya dengan kata-kata lain? Atau ketik "bantuan" untuk lihat menu lengkap!',
    'Waduh maaf, aku belum ngerti maksudnya 😅\n\nCoba tanya lagi dengan cara berbeda ya! Atau ketik "bantuan" untuk lihat contoh pertanyaan.',
    'Ehh aku agak bingung nih... 😓\n\nBisa dijelasin lagi gak? Atau mau lihat daftar yang bisa aku bantu? Ketik "bantuan" aja!'
  ];

  return {
    message: defaultResponses[Math.floor(Math.random() * defaultResponses.length)],
    data: null
  };
};

// ==================== INTENT RESPONSE HANDLERS ====================

/**
 * Handler untuk intent jadwal pelajaran
 */
const getJadwalResponse = async (nlpResult, user) => {
  try {
    const today = new Date().getDay(); // 0=Minggu, 1=Senin, dst
    const hariMapping = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    // Deteksi hari yang diminta dari message user
    const message = nlpResult.raw?.utterance || nlpResult.raw?.message || '';
    const lowerMessage = message.toLowerCase();

    let targetHari = hariMapping[today]; // Default: hari ini

    // Cek apakah user menyebutkan hari tertentu
    if (lowerMessage.includes('senin')) targetHari = 'Senin';
    else if (lowerMessage.includes('selasa')) targetHari = 'Selasa';
    else if (lowerMessage.includes('rabu')) targetHari = 'Rabu';
    else if (lowerMessage.includes('kamis')) targetHari = 'Kamis';
    else if (lowerMessage.includes('jumat')) targetHari = 'Jumat';
    else if (lowerMessage.includes('sabtu')) targetHari = 'Sabtu';
    else if (lowerMessage.includes('minggu')) targetHari = 'Minggu';
    else if (lowerMessage.includes('besok')) {
      const tomorrow = (today + 1) % 7;
      targetHari = hariMapping[tomorrow];
    }

    const hariIni = targetHari;

    let jadwal = [];

    if (user.role === 'siswa') {
      // Ambil jadwal untuk siswa
      const siswa = await db.Siswa.findOne({
        where: { user_id: user.id },
        include: [{ model: db.Kelas, as: 'kelas' }]
      });

      if (!siswa || !siswa.kelas_id) {
        return {
          message: 'Hmm, sepertinya Anda belum terdaftar di kelas manapun. 🤔\n\nCoba hubungi admin untuk memastikan Anda sudah masuk ke kelas yang benar ya!',
          data: null
        };
      }

      jadwal = await db.JadwalPelajaran.findAll({
        where: {
          kelas_id: siswa.kelas_id,
          hari: hariIni
        },
        include: [
          { model: db.MataPelajaran, as: 'mataPelajaran' },
          { model: db.Guru, as: 'guru' }
        ],
        order: [['jam_mulai', 'ASC']]
      });

      if (jadwal.length === 0) {
        return {
          message: `Wah, sepertinya tidak ada jadwal pelajaran untuk hari ${hariIni}. Selamat libur! 🎉\n\nNikmati waktu istirahat Anda ya!`,
          data: null
        };
      }

      let message = `📅 Jadwal Pelajaran Anda Hari ${hariIni}:\n\n`;
      jadwal.forEach((j, idx) => {
        message += `${idx + 1}. ${j.mataPelajaran.nama_mapel}\n`;
        message += `   ⏰ ${j.jam_mulai} - ${j.jam_selesai}\n`;
        message += `   👨‍🏫 ${j.guru.nama_lengkap}\n`;
        if (j.ruangan) message += `   🚪 Ruangan: ${j.ruangan}\n`;
        message += `\n`;
      });

      return { message, data: jadwal };

    } else if (user.role === 'guru') {
      // Ambil jadwal mengajar untuk guru
      const guru = await db.Guru.findOne({
        where: { user_id: user.id }
      });

      if (!guru) {
        return {
          message: 'Hmm, sepertinya data guru Anda belum terdaftar di sistem. 🤔\n\nCoba hubungi admin untuk memastikan data Anda sudah lengkap ya!',
          data: null
        };
      }

      jadwal = await db.JadwalPelajaran.findAll({
        where: {
          guru_id: guru.id,
          hari: hariIni
        },
        include: [
          { model: db.MataPelajaran, as: 'mataPelajaran' },
          { model: db.Kelas, as: 'kelas' }
        ],
        order: [['jam_mulai', 'ASC']]
      });

      if (jadwal.length === 0) {
        return {
          message: `Sepertinya tidak ada jadwal mengajar untuk hari ${hariIni}. 😊\n\nWaktu istirahat yang baik untuk Anda!`,
          data: null
        };
      }

      let message = `📅 Jadwal Mengajar Anda Hari ${hariIni}:\n\n`;
      jadwal.forEach((j, idx) => {
        message += `${idx + 1}. ${j.mataPelajaran.nama_mapel} - Kelas ${j.kelas.nama_kelas}\n`;
        message += `   ⏰ ${j.jam_mulai} - ${j.jam_selesai}\n`;
        if (j.ruangan) message += `   🚪 Ruangan: ${j.ruangan}\n`;
        message += `\n`;
      });

      return { message, data: jadwal };
    }

    return {
      message: 'Maaf, fitur jadwal hanya tersedia untuk siswa dan guru.',
      data: null
    };

  } catch (error) {
    console.error('Error getJadwalResponse:', error);
    return {
      message: 'Wah, sepertinya ada kendala saat mengambil data jadwal Anda. 😔\n\nCoba tanyakan lagi dalam beberapa saat ya!',
      data: null
    };
  }
};

/**
 * Handler untuk intent nilai/rapor
 */
const getNilaiResponse = async (nlpResult, user) => {
  try {
    if (user.role !== 'siswa') {
      return {
        message: 'Maaf, fitur nilai hanya tersedia untuk siswa.',
        data: null
      };
    }

    const siswa = await db.Siswa.findOne({
      where: { user_id: user.id }
    });

    if (!siswa) {
      return {
        message: 'Maaf, data siswa Anda belum tersedia.',
        data: null
      };
    }

    // Ambil nilai rapor semester aktif
    const nilai = await db.Rapor.findAll({
      where: {
        siswa_id: siswa.id,
        semester: 'Ganjil', // TODO: Dynamic semester
        tahun_ajaran: '2024/2025' // TODO: Dynamic tahun ajaran
      },
      include: [
        { model: db.MataPelajaran, as: 'mataPelajaran' }
      ],
      order: [[{ model: db.MataPelajaran, as: 'mataPelajaran' }, 'nama_mapel', 'ASC']]
    });

    if (nilai.length === 0) {
      return {
        message: 'Hmm, sepertinya nilai rapor Anda belum tersedia untuk semester ini. 📚\n\nMungkin masih dalam proses input oleh guru. Coba tanyakan lagi nanti ya!',
        data: null
      };
    }

    // Hitung rata-rata
    let totalNilai = 0;
    nilai.forEach(n => {
      totalNilai += parseFloat(n.nilai_akhir || 0);
    });
    const rataRata = (totalNilai / nilai.length).toFixed(2);

    let message = `📊 Nilai Rapor Anda (Semester Ganjil 2024/2025):\n\n`;
    nilai.forEach((n, idx) => {
      message += `${idx + 1}. ${n.mataPelajaran.nama_mapel}\n`;
      message += `   Nilai: ${n.nilai_akhir || '-'}\n`;
      if (n.predikat) message += `   Predikat: ${n.predikat}\n`;
      message += `\n`;
    });
    message += `📈 Rata-rata: ${rataRata}\n`;

    return { message, data: { nilai, rata_rata: rataRata } };

  } catch (error) {
    console.error('Error getNilaiResponse:', error);
    return {
      message: 'Wah, sepertinya ada kendala saat mengambil data nilai Anda. 😔\n\nCoba tanyakan lagi dalam beberapa saat ya!',
      data: null
    };
  }
};

/**
 * Handler untuk intent presensi/kehadiran
 */
const getPresensiResponse = async (nlpResult, user) => {
  try {
    // SISWA: Lihat presensi diri sendiri
    if (user.role === 'siswa') {
      const siswa = await db.Siswa.findOne({
        where: { user_id: user.id }
      });

      if (!siswa) {
        return {
          message: 'Maaf, data siswa Anda belum tersedia.',
          data: null
        };
      }

      // Ambil presensi bulan ini
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const presensi = await db.Presensi.findAll({
        where: {
          siswa_id: siswa.id,
          tanggal: {
            [db.sequelize.Sequelize.Op.between]: [startOfMonth, endOfMonth]
          }
        },
        order: [['tanggal', 'DESC']]
      });

      // Hitung statistik
      let hadir = 0, sakit = 0, izin = 0, alpha = 0;
      presensi.forEach(p => {
        switch(p.status.toLowerCase()) {
          case 'hadir': hadir++; break;
          case 'sakit': sakit++; break;
          case 'izin': izin++; break;
          case 'alpha': alpha++; break;
        }
      });

      const total = presensi.length;
      const persentaseHadir = total > 0 ? ((hadir / total) * 100).toFixed(1) : 0;

      let message = `📊 Rekap Presensi Bulan Ini:\n\n`;
      message += `✅ Hadir: ${hadir} hari\n`;
      message += `🤒 Sakit: ${sakit} hari\n`;
      message += `📝 Izin: ${izin} hari\n`;
      message += `❌ Alpha: ${alpha} hari\n`;
      message += `\n📈 Persentase Kehadiran: ${persentaseHadir}%\n`;

      if (persentaseHadir < 75) {
        message += `\n⚠️ Perhatian: Kehadiran Anda di bawah 75%. Tingkatkan kehadiran ya!`;
      }

      return {
        message,
        data: {
          hadir, sakit, izin, alpha,
          total,
          persentase: persentaseHadir,
          detail: presensi
        }
      };
    }

    // GURU: Lihat presensi siswa di kelas yang diajar
    else if (user.role === 'guru') {
      const guru = await db.Guru.findOne({
        where: { user_id: user.id }
      });

      if (!guru) {
        return {
          message: 'Maaf, data guru Anda belum tersedia.',
          data: null
        };
      }

      // Ambil kelas yang diajar guru hari ini
      const now = new Date();
      const today = new Date().getDay();
      const hariMapping = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const hariIni = hariMapping[today];

      // Deteksi apakah user menanyakan hari tertentu
      const message = nlpResult.raw?.utterance || nlpResult.raw?.message || '';
      const lowerMessage = message.toLowerCase();

      let targetDate = new Date();
      let targetHari = hariIni;

      // Cek jika menanyakan "hari ini"
      if (lowerMessage.includes('hari ini') || lowerMessage.includes('sekarang')) {
        targetDate = new Date();
        targetHari = hariIni;
      }

      // Ambil jadwal mengajar guru untuk hari yang ditargetkan
      const jadwalHariIni = await db.JadwalPelajaran.findAll({
        where: {
          guru_id: guru.id,
          hari: targetHari
        },
        include: [
          { model: db.Kelas, as: 'kelas' },
          { model: db.MataPelajaran, as: 'mataPelajaran' }
        ]
      });

      if (jadwalHariIni.length === 0) {
        return {
          message: `Sepertinya Anda tidak ada jadwal mengajar untuk hari ${targetHari}. 📅\n\nTidak ada data presensi yang bisa ditampilkan.`,
          data: null
        };
      }

      // Ambil semua siswa dari kelas yang diajar
      const kelasIds = [...new Set(jadwalHariIni.map(j => j.kelas_id))];

      const siswaList = await db.Siswa.findAll({
        where: { kelas_id: kelasIds },
        include: [{ model: db.Kelas, as: 'kelas' }],
        order: [['kelas_id', 'ASC'], ['nama_lengkap', 'ASC']]
      });

      // Format tanggal target (hari ini)
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

      // Ambil presensi untuk semua siswa di kelas yang diajar hari ini
      const presensiHariIni = await db.Presensi.findAll({
        where: {
          siswa_id: siswaList.map(s => s.id),
          tanggal: {
            [db.sequelize.Sequelize.Op.between]: [startOfDay, endOfDay]
          }
        },
        include: [
          {
            model: db.Siswa,
            as: 'siswa',
            include: [{ model: db.Kelas, as: 'kelas' }]
          }
        ]
      });

      // Hitung statistik per status
      let hadir = 0, sakit = 0, izin = 0, alpha = 0, belumPresensi = 0;

      const presensiMap = new Map();
      presensiHariIni.forEach(p => {
        presensiMap.set(p.siswa_id, p.status);
        switch(p.status.toLowerCase()) {
          case 'hadir': hadir++; break;
          case 'sakit': sakit++; break;
          case 'izin': izin++; break;
          case 'alpha': alpha++; break;
        }
      });

      // Siswa yang belum ada presensi
      belumPresensi = siswaList.length - presensiHariIni.length;

      let responseMessage = `📊 Rekap Presensi Siswa Hari ${targetHari}:\n\n`;
      responseMessage += `📚 Kelas yang Anda ajar hari ini:\n`;
      jadwalHariIni.forEach(j => {
        responseMessage += `   • ${j.kelas.nama_kelas} (${j.mataPelajaran.nama_mapel})\n`;
      });
      responseMessage += `\n`;

      responseMessage += `👥 Total Siswa: ${siswaList.length} siswa\n\n`;
      responseMessage += `✅ Hadir: ${hadir} siswa\n`;
      responseMessage += `🤒 Sakit: ${sakit} siswa\n`;
      responseMessage += `📝 Izin: ${izin} siswa\n`;
      responseMessage += `❌ Alpha: ${alpha} siswa\n`;

      if (belumPresensi > 0) {
        responseMessage += `⏳ Belum Presensi: ${belumPresensi} siswa\n`;
      }

      const persentaseHadir = siswaList.length > 0 ? ((hadir / siswaList.length) * 100).toFixed(1) : 0;
      responseMessage += `\n📈 Persentase Kehadiran: ${persentaseHadir}%\n`;

      // Detail per kelas
      const kelasGrouped = {};
      siswaList.forEach(s => {
        const kelasName = s.kelas.nama_kelas;
        if (!kelasGrouped[kelasName]) {
          kelasGrouped[kelasName] = [];
        }
        kelasGrouped[kelasName].push({
          nama: s.nama_lengkap,
          nisn: s.nisn,
          status: presensiMap.get(s.id) || 'Belum Presensi'
        });
      });

      responseMessage += `\n━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      responseMessage += `📋 Detail Presensi per Kelas:\n\n`;

      Object.keys(kelasGrouped).forEach((kelasName, idx) => {
        const siswa = kelasGrouped[kelasName];
        responseMessage += `${idx + 1}. Kelas ${kelasName}:\n\n`;

        siswa.forEach((s, sIdx) => {
          let statusIcon = '⏳';
          if (s.status.toLowerCase() === 'hadir') statusIcon = '✅';
          else if (s.status.toLowerCase() === 'sakit') statusIcon = '🤒';
          else if (s.status.toLowerCase() === 'izin') statusIcon = '📝';
          else if (s.status.toLowerCase() === 'alpha') statusIcon = '❌';

          responseMessage += `   ${sIdx + 1}. ${s.nama} ${statusIcon}\n`;
          responseMessage += `      Status: ${s.status}\n`;
        });
        responseMessage += `\n`;
      });

      return {
        message: responseMessage,
        data: {
          hari: targetHari,
          total_siswa: siswaList.length,
          hadir, sakit, izin, alpha, belum_presensi: belumPresensi,
          persentase: persentaseHadir,
          detail_per_kelas: kelasGrouped
        }
      };
    }

    // Role lain
    else {
      return {
        message: 'Maaf, fitur presensi hanya tersedia untuk siswa dan guru.',
        data: null
      };
    }

  } catch (error) {
    console.error('Error getPresensiResponse:', error);
    return {
      message: 'Wah, sepertinya ada kendala saat mengambil data presensi. 😔\n\nCoba tanyakan lagi dalam beberapa saat ya!',
      data: null
    };
  }
};

/**
 * Handler untuk intent pembayaran
 */
const getPembayaranResponse = async (nlpResult, user) => {
  try {
    if (user.role !== 'siswa') {
      return {
        message: 'Maaf, fitur pembayaran hanya tersedia untuk siswa.',
        data: null
      };
    }

    const siswa = await db.Siswa.findOne({
      where: { user_id: user.id }
    });

    if (!siswa) {
      return {
        message: 'Maaf, data siswa Anda belum tersedia.',
        data: null
      };
    }

    // Ambil SEMUA list pembayaran (tagihan yang harus dibayar)
    const listPembayaran = await db.ListPembayaran.findAll({
      order: [['created_at', 'ASC']]
    });

    // Ambil pembayaran yang sudah dilakukan siswa
    const pembayaranSiswa = await db.Pembayaran.findAll({
      where: { siswa_id: siswa.id },
      include: [
        { model: db.ListPembayaran, as: 'jenis_pembayaran' }
      ],
      order: [['created_at', 'DESC']]
    });

    // Hitung total tagihan dari ListPembayaran
    let totalTagihan = 0;
    listPembayaran.forEach(lp => {
      totalTagihan += parseFloat(lp.nominal || 0);
    });

    // Hitung total yang sudah dibayar (approved)
    let totalDibayar = 0;
    pembayaranSiswa.forEach(p => {
      if (p.status === 'approved') {
        totalDibayar += parseFloat(p.jumlah_bayar || 0);
      }
    });

    const sisaTagihan = totalTagihan - totalDibayar;

    // Build message
    let message = `💰 Status Pembayaran Anda:\n\n`;
    message += `💵 Total Tagihan: Rp ${totalTagihan.toLocaleString('id-ID')}\n`;
    message += `✅ Sudah Dibayar: Rp ${totalDibayar.toLocaleString('id-ID')}\n`;
    message += `⏳ Sisa Tagihan: Rp ${sisaTagihan.toLocaleString('id-ID')}\n\n`;

    // Tampilkan riwayat pembayaran terakhir
    if (pembayaranSiswa.length > 0) {
      message += `📋 Riwayat Pembayaran Terakhir:\n\n`;
      pembayaranSiswa.slice(0, 5).forEach((p, idx) => {
        const tanggal = new Date(p.tanggal_bayar).toLocaleDateString('id-ID');
        const statusIcon = p.status === 'approved' ? '✅' : p.status === 'pending' ? '⏳' : '❌';
        const statusLabel = p.status === 'approved' ? 'Lunas' : p.status === 'pending' ? 'Menunggu Persetujuan' : 'Ditolak';

        message += `${idx + 1}. ${p.jenis_pembayaran?.nama_pembayaran || 'Pembayaran'}\n`;
        message += `   💰 Rp ${parseFloat(p.jumlah_bayar || 0).toLocaleString('id-ID')}\n`;
        message += `   📅 ${tanggal}\n`;
        message += `   Status: ${statusIcon} ${statusLabel}\n`;
        if (p.catatan) {
          message += `   📝 ${p.catatan}\n`;
        }
        message += `\n`;
      });
    } else {
      message += `📋 Riwayat Pembayaran Terakhir:\n\n`;
      message += `Belum ada pembayaran yang tercatat. 💰\n\n`;
      message += `Anda dapat mengajukan pembayaran melalui menu Pembayaran di dashboard.\n\n`;
    }

    if (sisaTagihan > 0) {
      message += `\n⚠️ Segera lunasi tagihan Anda!`;
    } else if (totalTagihan > 0) {
      message += `\n🎉 Semua tagihan sudah lunas!`;
    } else {
      message += `\nℹ️ Belum ada tagihan yang perlu dibayar.`;
    }

    return {
      message,
      data: {
        total_tagihan: totalTagihan,
        total_dibayar: totalDibayar,
        sisa_tagihan: sisaTagihan,
        list_pembayaran: listPembayaran,
        pembayaran: pembayaranSiswa
      }
    };

  } catch (error) {
    console.error('Error getPembayaranResponse:', error);
    return {
      message: 'Wah, sepertinya ada kendala saat mengambil data pembayaran Anda. 😔\n\nCoba tanyakan lagi dalam beberapa saat ya!',
      data: null
    };
  }
};

/**
 * Handler untuk intent informasi umum
 */
const getInformasiResponse = async (nlpResult) => {
  try {
    // Ambil informasi terbaru (5 terbaru berdasarkan tanggal dibuat)
    const informasi = await db.InformasiUmum.findAll({
      include: [
        { model: db.User, as: 'creator', attributes: ['username'] }
      ],
      order: [['created_at', 'DESC']],
      limit: 5
    });

    if (informasi.length === 0) {
      return {
        message: 'Sepertinya belum ada informasi atau pengumuman terbaru dari sekolah. 📢\n\nTenang, saya akan update Anda jika ada info baru!',
        data: null
      };
    }

    let message = `📢 Informasi & Pengumuman Terbaru:\n\n`;
    informasi.forEach((info, idx) => {
      const tanggal = new Date(info.created_at).toLocaleDateString('id-ID');
      message += `${idx + 1}. ${info.judul}\n`;
      message += `   📅 ${tanggal}\n`;
      message += `   📝 ${info.konten.substring(0, 100)}${info.konten.length > 100 ? '...' : ''}\n`;
      if (info.jenis) message += `   🏷️ ${info.jenis}\n`;
      message += `\n`;
    });

    return { message, data: informasi };

  } catch (error) {
    console.error('Error getInformasiResponse:', error);
    return {
      message: 'Wah, sepertinya ada kendala saat mengambil informasi sekolah. 😔\n\nCoba tanyakan lagi dalam beberapa saat ya!',
      data: null
    };
  }
};

/**
 * Handler untuk greeting/salam
 */
const getGreetingResponse = async (user) => {
  try {
    const hour = new Date().getHours();
    const greetings = {
      pagi: ['Selamat pagi', 'Pagi yang cerah', 'Hai! Pagi'],
      siang: ['Selamat siang', 'Halo! Siang ini', 'Hai'],
      sore: ['Selamat sore', 'Sore yang indah', 'Hai! Sore'],
      malam: ['Selamat malam', 'Malam yang tenang', 'Hai']
    };

    let greetingArray = greetings.malam;
    if (hour < 10) greetingArray = greetings.pagi;
    else if (hour < 15) greetingArray = greetings.siang;
    else if (hour < 18) greetingArray = greetings.sore;

    const greeting = greetingArray[Math.floor(Math.random() * greetingArray.length)];

    let namaLengkap = user.username;

    // Ambil nama lengkap dari database berdasarkan role
    if (user.role === 'siswa') {
      const siswa = await db.Siswa.findOne({
        where: { user_id: user.id },
        attributes: ['nama_lengkap']
      });
      if (siswa && siswa.nama_lengkap) {
        namaLengkap = siswa.nama_lengkap;
      }
    } else if (user.role === 'guru') {
      const guru = await db.Guru.findOne({
        where: { user_id: user.id },
        attributes: ['nama_lengkap']
      });
      if (guru && guru.nama_lengkap) {
        namaLengkap = guru.nama_lengkap;
      }
    }

    const intros = [
      `Halo ${namaLengkap}! 👋 ${greeting}!\n\nAku MIRA, asisten virtual MIS Ar-Ruhama. `,
      `Hai ${namaLengkap}! ${greeting}, semoga harimu menyenangkan! 😊\n\nPerkenalkan, aku MIRA! `,
      `${greeting}, ${namaLengkap}! Senang bisa membantu kamu hari ini! ✨\n\nAku MIRA, chatbot asisten kamu. `
    ];
    let message = intros[Math.floor(Math.random() * intros.length)];

    if (user.role === 'guru') {
      message += `Aku siap membantu kamu mengakses info tentang kelas dan siswa yang kamu ajar.\n\n`;
      message += `Kamu bisa tanya hal-hal seperti:\n`;
      message += `💬 "Berapa siswa di kelas saya?"\n`;
      message += `💬 "Jadwal mengajar hari ini"\n`;
      message += `💬 "Profil saya"\n\n`;
    } else if (user.role === 'siswa') {
      message += `Aku di sini untuk bantu kamu cari informasi sekolah dengan cepat dan mudah lho!\n\n`;
      message += `Coba tanya misalnya:\n`;
      message += `💬 "Jadwal hari ini dong"\n`;
      message += `💬 "Cek nilai rapor"\n`;
      message += `💬 "Berapa persen kehadiran aku?"\n`;
      message += `💬 "Tagihan pembayaran"\n\n`;
    } else if (user.role === 'admin') {
      message += `Aku siap membantu kamu kelola sistem informasi madrasah.\n\n`;
      message += `Kamu bisa tanyakan:\n`;
      message += `💬 "Berapa total siswa?"\n`;
      message += `💬 "Daftar guru"\n`;
      message += `💬 "Data kelas"\n\n`;
    }

    const closings = [
      `Jangan sungkan bertanya ya! Ketik "bantuan" kalau butuh panduan lengkap 😊`,
      `Kalau bingung mau nanya apa, coba ketik "bantuan" aja ya!`,
      `Ada yang mau ditanyakan? Aku siap bantu! Ketik "bantuan" untuk lihat menu lengkap 🚀`
    ];
    message += closings[Math.floor(Math.random() * closings.length)];

    return { message, data: null };
  } catch (error) {
    console.error('Error getGreetingResponse:', error);
    return {
      message: `Hai! 👋 Aku MIRA, asisten virtual MIS Ar-Ruhama. Ada yang bisa aku bantu hari ini?`,
      data: null
    };
  }
};

/**
 * Handler untuk intent profil/data diri
 */
const getProfilResponse = async (user) => {
  try {
    if (user.role === 'siswa') {
      const siswa = await db.Siswa.findOne({
        where: { user_id: user.id },
        include: [
          { model: db.Kelas, as: 'kelas', attributes: ['nama_kelas', 'tingkat'] },
          { model: db.User, as: 'user', attributes: ['username'] }
        ]
      });

      if (!siswa) {
        return {
          message: 'Hmm, sepertinya data siswa Anda belum terdaftar di sistem. 🤔\n\nCoba hubungi admin untuk memastikan data Anda sudah lengkap ya!',
          data: null
        };
      }

      let message = `👤 Profil Siswa Anda:\n\n`;
      message += `📝 Nama Lengkap: ${siswa.nama_lengkap}\n`;
      message += `🆔 NISN: ${siswa.nisn}\n`;
      message += `🎓 Kelas: ${siswa.kelas?.nama_kelas || '-'}\n`;
      message += `📚 Tingkat: ${siswa.kelas?.tingkat || '-'}\n`;
      message += `👤 Username: ${siswa.user?.username || '-'}\n`;
      if (siswa.jenis_kelamin) message += `⚧ Jenis Kelamin: ${siswa.jenis_kelamin}\n`;
      if (siswa.tempat_lahir || siswa.tanggal_lahir) {
        const tglLahir = siswa.tanggal_lahir ? new Date(siswa.tanggal_lahir).toLocaleDateString('id-ID') : '-';
        message += `🎂 TTL: ${siswa.tempat_lahir || '-'}, ${tglLahir}\n`;
      }
      if (siswa.alamat) message += `🏠 Alamat: ${siswa.alamat}\n`;
      if (siswa.telepon) message += `📞 Telepon: ${siswa.telepon}\n`;
      if (siswa.nama_ayah) message += `👨 Ayah: ${siswa.nama_ayah}\n`;
      if (siswa.nama_ibu) message += `👩 Ibu: ${siswa.nama_ibu}\n`;

      return {
        message,
        data: {
          nama_lengkap: siswa.nama_lengkap,
          nisn: siswa.nisn,
          kelas: siswa.kelas?.nama_kelas,
          tingkat: siswa.kelas?.tingkat
        }
      };

    } else if (user.role === 'guru') {
      const guru = await db.Guru.findOne({
        where: { user_id: user.id },
        include: [
          { model: db.User, as: 'user', attributes: ['username'] }
        ]
      });

      if (!guru) {
        return {
          message: 'Hmm, sepertinya data guru Anda belum terdaftar di sistem. 🤔\n\nCoba hubungi admin untuk memastikan data Anda sudah lengkap ya!',
          data: null
        };
      }

      let message = `👤 Profil Guru Anda:\n\n`;
      message += `📝 Nama Lengkap: ${guru.nama_lengkap}\n`;
      message += `🆔 NIP: ${guru.nip}\n`;
      message += `👤 Username: ${guru.user?.username || '-'}\n`;
      if (guru.jenis_kelamin) message += `⚧ Jenis Kelamin: ${guru.jenis_kelamin}\n`;
      if (guru.tempat_lahir || guru.tanggal_lahir) {
        const tglLahir = guru.tanggal_lahir ? new Date(guru.tanggal_lahir).toLocaleDateString('id-ID') : '-';
        message += `🎂 TTL: ${guru.tempat_lahir || '-'}, ${tglLahir}\n`;
      }
      if (guru.alamat) message += `🏠 Alamat: ${guru.alamat}\n`;
      if (guru.telepon) message += `📞 Telepon: ${guru.telepon}\n`;
      if (guru.email) message += `📧 Email: ${guru.email}\n`;

      return {
        message,
        data: {
          nama_lengkap: guru.nama_lengkap,
          nip: guru.nip
        }
      };

    } else {
      return {
        message: `👤 Profil Anda:\n\nUsername: ${user.username}\nRole: ${user.role}`,
        data: { username: user.username, role: user.role }
      };
    }

  } catch (error) {
    console.error('Error getProfilResponse:', error);
    return {
      message: 'Wah, sepertinya ada kendala saat mengambil data profil Anda. 😔\n\nCoba tanyakan lagi dalam beberapa saat ya!',
      data: null
    };
  }
};

/**
 * Handler untuk intent kelas guru (info kelas & siswa yang diajar)
 */
const getKelasGuruResponse = async (user) => {
  try {
    if (user.role !== 'guru') {
      return {
        message: 'Wah, informasi kelas dan siswa hanya bisa diakses oleh akun guru. 😊\n\nSeperti nya Anda login sebagai siswa atau admin. Coba tanyakan hal lain yang bisa saya bantu!',
        data: null
      };
    }

    const guru = await db.Guru.findOne({
      where: { user_id: user.id }
    });

    if (!guru) {
      return {
        message: 'Maaf, data guru Anda belum tersedia.',
        data: null
      };
    }

    // Ambil semua jadwal mengajar guru (untuk mendapatkan kelas yang diajar)
    const jadwalGuru = await db.JadwalPelajaran.findAll({
      where: { guru_id: guru.id },
      include: [
        {
          model: db.Kelas,
          as: 'kelas',
          attributes: ['id', 'nama_kelas', 'tingkat']
        },
        {
          model: db.MataPelajaran,
          as: 'mataPelajaran',
          attributes: ['nama_mapel']
        }
      ]
    });

    if (jadwalGuru.length === 0) {
      return {
        message: 'Sepertinya Anda belum terdaftar sebagai pengajar di kelas manapun. 🤔\n\nJika ini tidak sesuai, coba hubungi admin untuk memperbarui jadwal mengajar Anda ya!',
        data: null
      };
    }

    // Grup per kelas (unique kelas)
    const kelasMap = new Map();
    jadwalGuru.forEach(j => {
      if (j.kelas) {
        if (!kelasMap.has(j.kelas.id)) {
          kelasMap.set(j.kelas.id, {
            id: j.kelas.id,
            nama_kelas: j.kelas.nama_kelas,
            tingkat: j.kelas.tingkat,
            mata_pelajaran: []
          });
        }
        if (j.mataPelajaran) {
          kelasMap.get(j.kelas.id).mata_pelajaran.push(j.mataPelajaran.nama_mapel);
        }
      }
    });

    const kelasList = Array.from(kelasMap.values());

    // Hitung total siswa per kelas dan ambil detail siswa
    let totalSiswa = 0;
    for (const kelas of kelasList) {
      // Ambil daftar siswa di kelas ini
      const siswaList = await db.Siswa.findAll({
        where: { kelas_id: kelas.id },
        attributes: ['id', 'nama_lengkap', 'nisn', 'jenis_kelamin'],
        order: [['nama_lengkap', 'ASC']]
      });

      kelas.jumlah_siswa = siswaList.length;
      kelas.siswa_list = siswaList;
      totalSiswa += siswaList.length;

      // Hitung jumlah siswa laki-laki dan perempuan
      kelas.laki_laki = siswaList.filter(s => s.jenis_kelamin === 'L').length;
      kelas.perempuan = siswaList.filter(s => s.jenis_kelamin === 'P').length;

      // Ambil jadwal mengajar untuk kelas ini
      const jadwalKelas = jadwalGuru.filter(j => j.kelas && j.kelas.id === kelas.id);

      // Urutan hari untuk sorting
      const dayOrder = { 'Senin': 1, 'Selasa': 2, 'Rabu': 3, 'Kamis': 4, 'Jumat': 5, 'Sabtu': 6, 'Minggu': 7 };

      kelas.jadwal_detail = jadwalKelas
        .map(j => ({
          hari: j.hari,
          jam_mulai: j.jam_mulai,
          jam_selesai: j.jam_selesai,
          mata_pelajaran: j.mataPelajaran ? j.mataPelajaran.nama_mapel : '-'
        }))
        .sort((a, b) => {
          // Sort berdasarkan hari dulu
          const hariDiff = (dayOrder[a.hari] || 99) - (dayOrder[b.hari] || 99);
          if (hariDiff !== 0) return hariDiff;
          // Kemudian sort berdasarkan jam
          return a.jam_mulai.localeCompare(b.jam_mulai);
        });
    }

    let message = `👨‍🏫 Informasi Kelas yang Anda Ajar:\n\n`;
    message += `📊 Ringkasan:\n`;
    message += `📚 Total Kelas: ${kelasList.length} kelas\n`;
    message += `👥 Total Siswa: ${totalSiswa} siswa\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    kelasList.forEach((kelas, idx) => {
      message += `${idx + 1}. 📖 Kelas ${kelas.nama_kelas} (Tingkat ${kelas.tingkat})\n\n`;

      // Info siswa
      message += `   👥 Jumlah Siswa: ${kelas.jumlah_siswa} siswa\n`;
      message += `      • Laki-laki: ${kelas.laki_laki} siswa\n`;
      message += `      • Perempuan: ${kelas.perempuan} siswa\n\n`;

      // Mata pelajaran yang diajar
      const mapelUnique = [...new Set(kelas.mata_pelajaran)];
      message += `   📚 Mata Pelajaran yang Anda Ajar:\n`;
      mapelUnique.forEach(mapel => {
        message += `      • ${mapel}\n`;
      });
      message += `\n`;

      // Jadwal mengajar
      if (kelas.jadwal_detail.length > 0) {
        message += `   📅 Jadwal Mengajar:\n`;
        kelas.jadwal_detail.forEach(jadwal => {
          message += `      • ${jadwal.hari}, ${jadwal.jam_mulai}-${jadwal.jam_selesai} (${jadwal.mata_pelajaran})\n`;
        });
        message += `\n`;
      }

      // Daftar nama siswa
      if (kelas.siswa_list.length > 0) {
        message += `   📝 Daftar Siswa:\n`;
        kelas.siswa_list.forEach((siswa, sIdx) => {
          const jenkel = siswa.jenis_kelamin === 'L' ? '👦' : '👧';
          message += `      ${sIdx + 1}. ${jenkel} ${siswa.nama_lengkap} (NISN: ${siswa.nisn})\n`;
        });
        message += `\n`;
      }

      message += `\n━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    });

    return {
      message,
      data: {
        total_kelas: kelasList.length,
        total_siswa: totalSiswa,
        kelas: kelasList
      }
    };

  } catch (error) {
    console.error('Error getKelasGuruResponse:', error);
    return {
      message: 'Wah, sepertinya ada kendala saat mengambil data kelas Anda. 😔\n\nCoba tanyakan lagi dalam beberapa saat ya!',
      data: null
    };
  }
};

/**
 * Handler untuk admin - Data Guru
 */
const getDataGuruResponse = async (user) => {
  try {
    // Ambil semua guru
    const guruList = await db.Guru.findAll({
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['username', 'is_active']
        }
      ],
      order: [['nama_lengkap', 'ASC']]
    });

    if (guruList.length === 0) {
      return {
        message: 'Belum ada data guru yang terdaftar di sistem. 👨‍🏫',
        data: null
      };
    }

    // Hitung statistik
    const totalGuru = guruList.length;
    const guruAktif = guruList.filter(g => g.user && g.user.is_active).length;
    const guruLakiLaki = guruList.filter(g => g.jenis_kelamin === 'L').length;
    const guruPerempuan = guruList.filter(g => g.jenis_kelamin === 'P').length;

    let message = `👨‍🏫 Data Guru MIS Ar-Ruhama\n\n`;
    message += `📊 Statistik:\n`;
    message += `👥 Total Guru: ${totalGuru} orang\n`;
    message += `✅ Akun Aktif: ${guruAktif} orang\n`;
    message += `👨 Laki-laki: ${guruLakiLaki} orang\n`;
    message += `👩 Perempuan: ${guruPerempuan} orang\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `📋 Daftar Guru:\n\n`;

    guruList.forEach((guru, idx) => {
      const jenkel = guru.jenis_kelamin === 'L' ? '👨' : '👩';
      const status = guru.user && guru.user.is_active ? '✅' : '❌';
      message += `${idx + 1}. ${jenkel} ${guru.nama_lengkap}\n`;
      message += `   🆔 NIP: ${guru.nip}\n`;
      if (guru.telepon) message += `   📞 ${guru.telepon}\n`;
      if (guru.email) message += `   📧 ${guru.email}\n`;
      message += `   Status: ${status} ${guru.user && guru.user.is_active ? 'Aktif' : 'Nonaktif'}\n\n`;
    });

    return {
      message,
      data: {
        total: totalGuru,
        aktif: guruAktif,
        list: guruList
      }
    };

  } catch (error) {
    console.error('Error getDataGuruResponse:', error);
    return {
      message: 'Wah, sepertinya ada kendala saat mengambil data guru. 😔\n\nCoba tanyakan lagi dalam beberapa saat ya!',
      data: null
    };
  }
};

/**
 * Handler untuk admin - Data Siswa
 */
const getDataSiswaResponse = async (user) => {
  try {
    // Ambil semua siswa
    const siswaList = await db.Siswa.findAll({
      include: [
        {
          model: db.Kelas,
          as: 'kelas',
          attributes: ['nama_kelas', 'tingkat']
        },
        {
          model: db.User,
          as: 'user',
          attributes: ['username', 'is_active']
        }
      ],
      order: [['nama_lengkap', 'ASC']]
    });

    if (siswaList.length === 0) {
      return {
        message: 'Belum ada data siswa yang terdaftar di sistem. 👨‍🎓',
        data: null
      };
    }

    // Hitung statistik
    const totalSiswa = siswaList.length;
    const siswaAktif = siswaList.filter(s => s.user && s.user.is_active).length;
    const siswaLakiLaki = siswaList.filter(s => s.jenis_kelamin === 'L').length;
    const siswaPerempuan = siswaList.filter(s => s.jenis_kelamin === 'P').length;

    // Group by kelas
    const siswaPerKelas = {};
    siswaList.forEach(s => {
      if (s.kelas) {
        const kelasName = s.kelas.nama_kelas;
        if (!siswaPerKelas[kelasName]) {
          siswaPerKelas[kelasName] = [];
        }
        siswaPerKelas[kelasName].push(s);
      }
    });

    let message = `👨‍🎓 Data Siswa MIS Ar-Ruhama\n\n`;
    message += `📊 Statistik:\n`;
    message += `👥 Total Siswa: ${totalSiswa} orang\n`;
    message += `✅ Akun Aktif: ${siswaAktif} orang\n`;
    message += `👦 Laki-laki: ${siswaLakiLaki} orang\n`;
    message += `👧 Perempuan: ${siswaPerempuan} orang\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `📋 Daftar Siswa per Kelas:\n\n`;

    Object.keys(siswaPerKelas).sort().forEach((kelasName, idx) => {
      const siswa = siswaPerKelas[kelasName];
      message += `${idx + 1}. Kelas ${kelasName} (${siswa.length} siswa)\n\n`;

      siswa.forEach((s, sIdx) => {
        const jenkel = s.jenis_kelamin === 'L' ? '👦' : '👧';
        const status = s.user && s.user.is_active ? '✅' : '❌';
        message += `   ${sIdx + 1}. ${jenkel} ${s.nama_lengkap}\n`;
        message += `      NISN: ${s.nisn} ${status}\n`;
      });
      message += `\n`;
    });

    return {
      message,
      data: {
        total: totalSiswa,
        aktif: siswaAktif,
        per_kelas: siswaPerKelas,
        list: siswaList
      }
    };

  } catch (error) {
    console.error('Error getDataSiswaResponse:', error);
    return {
      message: 'Wah, sepertinya ada kendala saat mengambil data siswa. 😔\n\nCoba tanyakan lagi dalam beberapa saat ya!',
      data: null
    };
  }
};

/**
 * Handler untuk admin - Data Kelas
 */
const getDataKelasResponse = async (user) => {
  try {
    // Ambil semua kelas dengan wali kelas
    const kelasList = await db.Kelas.findAll({
      include: [
        {
          model: db.Guru,
          as: 'wali_kelas',
          attributes: ['nama_lengkap', 'nip']
        }
      ],
      order: [['tingkat', 'ASC'], ['nama_kelas', 'ASC']]
    });

    if (kelasList.length === 0) {
      return {
        message: 'Belum ada data kelas yang terdaftar di sistem. 🏫',
        data: null
      };
    }

    // Hitung jumlah siswa per kelas
    for (const kelas of kelasList) {
      const jumlahSiswa = await db.Siswa.count({
        where: { kelas_id: kelas.id }
      });
      kelas.jumlah_siswa = jumlahSiswa;
    }

    const totalKelas = kelasList.length;
    const totalSiswa = kelasList.reduce((sum, k) => sum + k.jumlah_siswa, 0);

    let message = `🏫 Data Kelas MIS Ar-Ruhama\n\n`;
    message += `📊 Statistik:\n`;
    message += `📚 Total Kelas: ${totalKelas} kelas\n`;
    message += `👥 Total Siswa: ${totalSiswa} orang\n`;
    message += `📈 Rata-rata per Kelas: ${totalKelas > 0 ? Math.round(totalSiswa / totalKelas) : 0} siswa\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `📋 Daftar Kelas:\n\n`;

    kelasList.forEach((kelas, idx) => {
      message += `${idx + 1}. 📖 Kelas ${kelas.nama_kelas} (Tingkat ${kelas.tingkat})\n`;
      message += `   👥 Jumlah Siswa: ${kelas.jumlah_siswa} siswa\n`;
      message += `   📅 Tahun Ajaran: ${kelas.tahun_ajaran}\n`;
      if (kelas.wali_kelas) {
        message += `   👨‍🏫 Wali Kelas: ${kelas.wali_kelas.nama_lengkap}\n`;
      } else {
        message += `   👨‍🏫 Wali Kelas: Belum ditentukan\n`;
      }
      message += `\n`;
    });

    return {
      message,
      data: {
        total: totalKelas,
        total_siswa: totalSiswa,
        list: kelasList
      }
    };

  } catch (error) {
    console.error('Error getDataKelasResponse:', error);
    return {
      message: 'Wah, sepertinya ada kendala saat mengambil data kelas. 😔\n\nCoba tanyakan lagi dalam beberapa saat ya!',
      data: null
    };
  }
};

/**
 * Handler untuk Mata Pelajaran (untuk semua role)
 */
const getMataPelajaranResponse = async (user) => {
  try {
    // Jika guru, tampilkan mata pelajaran yang diajar
    if (user.role === 'guru') {
      const guru = await db.Guru.findOne({
        where: { user_id: user.id }
      });

      if (!guru) {
        return {
          message: 'Data guru tidak ditemukan. 😔',
          data: null
        };
      }

      // Ambil jadwal mengajar guru untuk mendapatkan mata pelajaran yang diajar
      const jadwalMengajar = await db.JadwalPelajaran.findAll({
        where: { guru_id: guru.id },
        include: [
          {
            model: db.MataPelajaran,
            as: 'mataPelajaran',
            attributes: ['id', 'nama_mapel', 'kode_mapel', 'deskripsi']
          },
          {
            model: db.Kelas,
            as: 'kelas',
            attributes: ['id', 'nama_kelas', 'tingkat']
          }
        ],
        order: [
          [{ model: db.MataPelajaran, as: 'mataPelajaran' }, 'nama_mapel', 'ASC'],
          [{ model: db.Kelas, as: 'kelas' }, 'tingkat', 'ASC']
        ]
      });

      if (jadwalMengajar.length === 0) {
        return {
          message: '📚 Anda belum memiliki jadwal mengajar yang terdaftar.\n\nSilakan hubungi admin untuk informasi lebih lanjut.',
          data: null
        };
      }

      // Kelompokkan berdasarkan mata pelajaran
      const mapelMap = {};
      jadwalMengajar.forEach(j => {
        if (j.mataPelajaran) {
          const mapelId = j.mataPelajaran.id;
          if (!mapelMap[mapelId]) {
            mapelMap[mapelId] = {
              id: j.mataPelajaran.id,
              nama_mapel: j.mataPelajaran.nama_mapel,
              kode_mapel: j.mataPelajaran.kode_mapel,
              deskripsi: j.mataPelajaran.deskripsi,
              kelas_list: []
            };
          }
          if (j.kelas) {
            const kelasExists = mapelMap[mapelId].kelas_list.find(k => k.id === j.kelas.id);
            if (!kelasExists) {
              mapelMap[mapelId].kelas_list.push({
                id: j.kelas.id,
                nama_kelas: j.kelas.nama_kelas,
                tingkat: j.kelas.tingkat
              });
            }
          }
        }
      });

      const mapelList = Object.values(mapelMap);
      const totalMapel = mapelList.length;

      let message = `📚 Mata Pelajaran yang Anda Ajar\n\n`;
      message += `👨‍🏫 Guru: ${guru.nama_lengkap}\n`;
      message += `📊 Total: ${totalMapel} mata pelajaran\n\n`;
      message += `━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

      mapelList.forEach((mapel, idx) => {
        message += `${idx + 1}. ${mapel.nama_mapel}`;
        if (mapel.kode_mapel) {
          message += ` (${mapel.kode_mapel})`;
        }
        message += `\n`;

        if (mapel.kelas_list.length > 0) {
          message += `   🏫 Kelas: `;
          const kelasNames = mapel.kelas_list.map(k => k.nama_kelas).join(', ');
          message += kelasNames + `\n`;
        }

        if (mapel.deskripsi) {
          message += `   ℹ️ ${mapel.deskripsi}\n`;
        }
        message += `\n`;
      });

      message += `━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      message += `💡 Ini adalah daftar mata pelajaran yang Anda ajar saat ini.`;

      return {
        message,
        data: {
          total: totalMapel,
          list: mapelList
        }
      };
    }

    // Untuk siswa atau admin, tampilkan semua mata pelajaran
    else {
      const mapelList = await db.MataPelajaran.findAll({
        order: [['nama_mapel', 'ASC']]
      });

      if (mapelList.length === 0) {
        return {
          message: 'Belum ada data mata pelajaran yang terdaftar di sistem. 📚',
          data: null
        };
      }

      const totalMapel = mapelList.length;

      let message = `📚 Daftar Mata Pelajaran MIS Ar-Ruhama\n\n`;
      message += `📊 Total: ${totalMapel} mata pelajaran\n\n`;
      message += `━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

      mapelList.forEach((mapel, idx) => {
        message += `${idx + 1}. ${mapel.nama_mapel}\n`;
        if (mapel.kode_mapel) {
          message += `   📝 Kode: ${mapel.kode_mapel}\n`;
        }
        if (mapel.deskripsi) {
          message += `   ℹ️ ${mapel.deskripsi}\n`;
        }
        message += `\n`;
      });

      message += `━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      message += `💡 Semua mata pelajaran di atas diajarkan di madrasah kami!`;

      return {
        message,
        data: {
          total: totalMapel,
          list: mapelList
        }
      };
    }

  } catch (error) {
    console.error('Error getMataPelajaranResponse:', error);
    return {
      message: 'Wah, sepertinya ada kendala saat mengambil data mata pelajaran. 😔\n\nCoba tanyakan lagi dalam beberapa saat ya!',
      data: null
    };
  }
};

/**
 * Handler untuk contact offer (setelah 4x low confidence)
 */
const getContactOfferResponse = async (user) => {
  try {
    let message = '';

    if (user.role === 'guru') {
      message = `Hmm, sepertinya saya kesulitan memahami pertanyaan Anda. 🤔\n\n`;
      message += `Saya sudah mencoba beberapa kali tapi belum bisa memberikan jawaban yang tepat.\n\n`;
      message += `Apakah Anda ingin menghubungi admin secara langsung? 📞\n\n`;
      message += `Ketik "ya" atau "tidak"`;
    } else if (user.role === 'siswa') {
      message = `Hmm, sepertinya saya kesulitan memahami pertanyaan Anda. 🤔\n\n`;
      message += `Saya sudah mencoba beberapa kali tapi belum bisa memberikan jawaban yang tepat.\n\n`;
      message += `Apakah Anda ingin menghubungi guru secara langsung? 📞\n\n`;
      message += `Ketik "ya" atau "tidak"`;
    } else {
      message = `Maaf, saya kesulitan memahami pertanyaan Anda.\n\nCoba formulasikan pertanyaan dengan cara yang berbeda ya!`;
    }

    return { message, data: null };

  } catch (error) {
    console.error('Error getContactOfferResponse:', error);
    return {
      message: 'Maaf, saya mengalami kendala. Coba tanyakan lagi ya!',
      data: null
    };
  }
};

/**
 * Handler untuk konfirmasi YA (user mau kontak langsung)
 */
const getKonfirmasiYaResponse = async (user) => {
  try {
    // Cek apakah sebelumnya ada contact offer
    const recentLog = await db.ChatbotLog.findOne({
      where: { user_id: user.id },
      order: [['created_at', 'DESC']]
    });

    // Jika tidak ada context contact offer, berikan response umum
    if (!recentLog || !recentLog.bot_response.includes('menghubungi')) {
      return {
        message: 'Baik! Ada yang bisa saya bantu lagi? 😊',
        data: null
      };
    }

    let message = '';

    if (user.role === 'guru') {
      // Ambil nomor kepala madrasah dari settings atau hardcoded
      const kepalaMadrasah = await db.Guru.findOne({
        where: { jabatan: 'Kepala Madrasah' },
        attributes: ['nama_lengkap', 'telepon']
      });

      if (kepalaMadrasah && kepalaMadrasah.telepon) {
        message = `Baik! Berikut kontak Kepala Madrasah yang bisa Anda hubungi:\n\n`;
        message += `👤 ${kepalaMadrasah.nama_lengkap}\n`;
        message += `📞 ${kepalaMadrasah.telepon}\n\n`;
        message += `Silakan hubungi beliau untuk bantuan lebih lanjut. 😊`;
      } else {
        message = `Baik! Untuk menghubungi admin, silakan datang ke kantor tata usaha atau hubungi nomor sekolah.\n\n`;
        message += `Terima kasih! 😊`;
      }
    } else if (user.role === 'siswa') {
      // Ambil wali kelas siswa
      const siswa = await db.Siswa.findOne({
        where: { user_id: user.id },
        include: [
          {
            model: db.Kelas,
            as: 'kelas',
            include: [
              {
                model: db.Guru,
                as: 'wali_kelas',
                attributes: ['nama_lengkap', 'telepon']
              }
            ]
          }
        ]
      });

      if (siswa && siswa.kelas && siswa.kelas.wali_kelas && siswa.kelas.wali_kelas.telepon) {
        message = `Baik! Berikut kontak Wali Kelas Anda yang bisa dihubungi:\n\n`;
        message += `👨‍🏫 ${siswa.kelas.wali_kelas.nama_lengkap}\n`;
        message += `📞 ${siswa.kelas.wali_kelas.telepon}\n\n`;
        message += `Silakan hubungi beliau untuk bantuan lebih lanjut. 😊`;
      } else {
        message = `Baik! Untuk menghubungi guru, silakan datang ke kantor guru atau hubungi nomor sekolah.\n\n`;
        message += `Terima kasih! 😊`;
      }
    }

    return { message, data: null };

  } catch (error) {
    console.error('Error getKonfirmasiYaResponse:', error);
    return {
      message: 'Baik, terima kasih! Ada yang bisa saya bantu lagi?',
      data: null
    };
  }
};

/**
 * Handler untuk konfirmasi TIDAK
 */
const getKonfirmasiTidakResponse = async (user) => {
  return {
    message: 'Baik, tidak apa-apa! 😊\n\nSilakan tanyakan hal lain atau ketik "bantuan" untuk melihat panduan.',
    data: null
  };
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