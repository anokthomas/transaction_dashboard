const { Transaction, User } = require('../models');
const { Op } = require('sequelize');

class FraudDetectionService {
  async analyzeTransaction(transaction) {
    let fraudScore = 0;
    let fraudReasons = [];
    
    try {
      // Rule 1: Large amount transactions (>$1000)
      if (parseFloat(transaction.amount) > 1000) {
        fraudScore += 30;
        fraudReasons.push('Large transaction amount');
      }

      // Rule 2: Very large amount transactions (>$5000)
      if (parseFloat(transaction.amount) > 5000) {
        fraudScore += 50;
        fraudReasons.push('Very large transaction amount');
      }

      // Rule 3: Multiple transactions in short time period
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const recentTransactions = await Transaction.count({
        where: {
          userId: transaction.userId,
          createdAt: { [Op.gte]: fiveMinutesAgo },
          id: { [Op.ne]: transaction.id }
        }
      });

      if (recentTransactions >= 3) {
        fraudScore += 40;
        fraudReasons.push('Multiple transactions in short time');
      }

      // Rule 4: High frequency transactions (>10 in last hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const hourlyTransactions = await Transaction.count({
        where: {
          userId: transaction.userId,
          createdAt: { [Op.gte]: oneHourAgo }
        }
      });

      if (hourlyTransactions > 10) {
        fraudScore += 35;
        fraudReasons.push('High frequency transactions');
      }

      // Rule 5: Unusual category for user
      const userCategoryHistory = await Transaction.findAll({
        where: {
          userId: transaction.userId,
          category: transaction.category,
          createdAt: { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        },
        limit: 1
      });

      if (userCategoryHistory.length === 0) {
        fraudScore += 20;
        fraudReasons.push('Unusual category for user');
      }

      // Rule 6: Round number amounts (potential fraud pattern)
      if (parseFloat(transaction.amount) % 100 === 0 && parseFloat(transaction.amount) >= 500) {
        fraudScore += 15;
        fraudReasons.push('Round number amount');
      }

      // Rule 7: Late night transactions (between 2 AM and 6 AM)
      const transactionHour = new Date(transaction.createdAt).getHours();
      if (transactionHour >= 2 && transactionHour <= 6) {
        fraudScore += 25;
        fraudReasons.push('Late night transaction');
      }

      // Rule 8: Check user's historical average
      const userAverage = await Transaction.findOne({
        where: {
          userId: transaction.userId,
          createdAt: { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        },
        attributes: [
          [Transaction.sequelize.fn('AVG', Transaction.sequelize.col('amount')), 'avgAmount']
        ]
      });

      if (userAverage && userAverage.dataValues.avgAmount) {
        const avgAmount = parseFloat(userAverage.dataValues.avgAmount);
        if (parseFloat(transaction.amount) > avgAmount * 5) {
          fraudScore += 30;
          fraudReasons.push('Amount significantly higher than user average');
        }
      }

      // Rule 9: Geographic velocity (if location data available)
      if (transaction.location) {
        const lastTransaction = await Transaction.findOne({
          where: {
            userId: transaction.userId,
            location: { [Op.ne]: null },
            createdAt: { [Op.lt]: transaction.createdAt }
          },
          order: [['createdAt', 'DESC']]
        });

        if (lastTransaction && lastTransaction.location) {
          // Simple distance check (this would be more sophisticated in production)
          const timeDiff = new Date(transaction.createdAt) - new Date(lastTransaction.createdAt);
          if (timeDiff < 60 * 60 * 1000) { // Less than 1 hour
            fraudScore += 45;
            fraudReasons.push('Impossible geographic velocity');
          }
        }
      }

      // Determine if transaction is fraudulent
      const isFraudulent = fraudScore >= 70;
      
      return {
        isFraudulent,
        score: Math.min(fraudScore, 100),
        reason: fraudReasons.join(', '),
        details: {
          score: fraudScore,
          reasons: fraudReasons
        }
      };

    } catch (error) {
      console.error('Error in fraud detection:', error);
      return {
        isFraudulent: false,
        score: 0,
        reason: 'Fraud detection error',
        details: { error: error.message }
      };
    }
  }

  async updateUserRiskScore(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) return;

      // Calculate user risk score based on recent fraudulent transactions
      const recentFraudTransactions = await Transaction.count({
        where: {
          userId,
          isFraudulent: true,
          createdAt: { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      });

      const totalRecentTransactions = await Transaction.count({
        where: {
          userId,
          createdAt: { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      });

      let riskScore = 0;
      if (totalRecentTransactions > 0) {
        riskScore = Math.round((recentFraudTransactions / totalRecentTransactions) * 100);
      }

      await user.update({ riskScore });
      return riskScore;
    } catch (error) {
      console.error('Error updating user risk score:', error);
      return 0;
    }
  }

  async getFraudAlerts(limit = 10) {
    try {
      const fraudAlerts = await Transaction.findAll({
        where: { isFraudulent: true },
        include: [
          { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] },
          { model: Merchant, as: 'merchant', attributes: ['name', 'category'] }
        ],
        order: [['createdAt', 'DESC']],
        limit
      });

      return fraudAlerts;
    } catch (error) {
      console.error('Error fetching fraud alerts:', error);
      return [];
    }
  }
}

module.exports = new FraudDetectionService();