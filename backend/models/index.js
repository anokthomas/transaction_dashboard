const sequelize = require('../config/database');
const User = require('./User');
const Merchant = require('./Merchant');
const Transaction = require('./Transaction');

// Define associations
User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Merchant.hasMany(Transaction, { foreignKey: 'merchantId', as: 'transactions' });
Transaction.belongsTo(Merchant, { foreignKey: 'merchantId', as: 'merchant' });

module.exports = {
  sequelize,
  User,
  Merchant,
  Transaction
};