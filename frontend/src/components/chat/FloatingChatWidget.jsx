import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { chatbotAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const FloatingChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadChatHistory();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const response = await chatbotAPI.getHistory(20);
      if (response.success && response.data) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isTyping) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Add user message to UI
    const userMsg = {
      id: Date.now(),
      message: userMessage,
      is_bot: false,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // Show typing indicator
    setIsTyping(true);

    try {
      // Send to API
      const response = await chatbotAPI.sendMessage(userMessage);

      if (response.success) {
        // Add bot response
        const botMsg = {
          id: Date.now() + 1,
          message: response.data.message,
          is_bot: true,
          intent: response.data.intent,
          confidence: response.data.confidence,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botMsg]);

        // Update unread if widget is closed
        if (!isOpen) {
          setUnreadCount((prev) => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMsg = {
        id: Date.now() + 1,
        message: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
        is_bot: true,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = async () => {
    if (window.confirm('Yakin ingin menghapus semua riwayat chat?')) {
      try {
        await chatbotAPI.clearHistory();
        setMessages([]);
      } catch (error) {
        console.error('Error clearing chat:', error);
      }
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const quickReplies = [
    'Jadwal hari ini',
    'Nilai saya',
    'Status pembayaran',
    'Bantuan',
  ];

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 md:bottom-24 right-2 md:right-6 w-[calc(100vw-1rem)] md:w-96 max-w-md h-[calc(100vh-6rem)] md:h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 animate-slideUp border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">MIRA</h3>
                <p className="text-emerald-100 text-xs">Asisten Virtual MIS Ar-Ruhama</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearChat}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Hapus chat"
              >
                <Trash2 className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={toggleChat}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Halo, {user?.profile?.nama_lengkap || user?.username}!</p>
                <p className="text-sm text-gray-400">Tanyakan apa saja tentang sekolah</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={msg.id || index}
                  className={`flex ${msg.is_bot ? 'justify-start' : 'justify-end'} animate-fadeIn`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.is_bot
                        ? 'bg-white text-gray-800 shadow-sm border border-gray-100'
                        : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                    {msg.confidence && (
                      <p className="text-xs text-gray-400 mt-1">
                        Confidence: {(msg.confidence * 100).toFixed(0)}%
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start animate-fadeIn">
                <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length === 0 && (
            <div className="px-4 py-2 border-t border-gray-200 bg-white">
              <p className="text-xs text-gray-500 mb-2">Quick Replies:</p>
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => {
                      setInputMessage(reply);
                      document.getElementById('chat-input')?.focus();
                    }}
                    className="px-3 py-1 text-xs bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-100 transition-colors border border-emerald-200"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <input
                id="chat-input"
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ketik pesan..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {isTyping ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-4 md:bottom-6 right-4 md:right-6 w-14 h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full shadow-2xl hover:shadow-emerald-300 hover:scale-110 transition-all duration-300 flex items-center justify-center z-50 group"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
                {unreadCount}
              </div>
            )}
          </>
        )}
      </button>
    </>
  );
};

export default FloatingChatWidget;
