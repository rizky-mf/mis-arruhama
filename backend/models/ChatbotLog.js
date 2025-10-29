module.exports = (sequelize, DataTypes) => {
  const ChatbotLog = sequelize.define('chatbot_logs', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
    user_message: { type: DataTypes.TEXT, allowNull: false },
    bot_response: { type: DataTypes.TEXT, allowNull: false },
    intent_id: { type: DataTypes.INTEGER, references: { model: 'chatbot_intents', key: 'id' } },
    confidence_score: { type: DataTypes.DECIMAL(5, 4) },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, { timestamps: false });
  return ChatbotLog;
};