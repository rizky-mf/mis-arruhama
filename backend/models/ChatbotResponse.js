module.exports = (sequelize, DataTypes) => {
  const ChatbotResponse = sequelize.define('chatbot_responses', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    intent_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'chatbot_intents', key: 'id' } },
    response_text: { type: DataTypes.TEXT, allowNull: false },
    priority: { type: DataTypes.INTEGER, defaultValue: 1 },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, { timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });
  return ChatbotResponse;
};