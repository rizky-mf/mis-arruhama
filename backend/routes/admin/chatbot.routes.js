// routes/chatbot.routes.js
const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { verifyToken, adminOnly } = require('../middlewares/auth');

router.use(verifyToken);

// User routes
router.post('/ask', chatbotController.getChatbotResponse);
router.get('/history', chatbotController.getChatHistory);
router.delete('/history', chatbotController.clearChatHistory);
router.get('/faq', chatbotController.getFAQ);

// Admin routes - Intent management
router.get('/intents', adminOnly, chatbotController.getAllIntents);
router.post('/intents', adminOnly, chatbotController.createIntent);
router.put('/intents/:id', adminOnly, chatbotController.updateIntent);
router.delete('/intents/:id', adminOnly, chatbotController.deleteIntent);

// Admin routes - Response management
router.get('/intents/:intent_id/responses', adminOnly, chatbotController.getResponsesByIntent);
router.post('/intents/:intent_id/responses', adminOnly, chatbotController.createResponse);
router.put('/responses/:id', adminOnly, chatbotController.updateResponse);
router.delete('/responses/:id', adminOnly, chatbotController.deleteResponse);

// Admin routes - Analytics
router.post('/train', adminOnly, chatbotController.trainChatbot);
router.get('/stats', adminOnly, chatbotController.getChatbotStats);

module.exports = router;