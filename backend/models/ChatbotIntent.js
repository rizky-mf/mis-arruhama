module.exports = (sequelize, DataTypes) => {
  const ChatbotIntent = sequelize.define('chatbot_intents', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    intent_name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    description: { type: DataTypes.TEXT },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, { timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });
  return ChatbotIntent;
};