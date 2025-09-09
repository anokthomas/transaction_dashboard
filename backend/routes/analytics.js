const express = require('express');
const { Transaction, User, Merchant, sequelize } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

// Get spending by category
router.get('/spending-by-category', async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;
    
    const where = {};
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const categorySpending = await Transaction.findAll({
      where,
      attributes: [
        'category',
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'transactionCount']
      ],
      group: ['category'],
      order: [[sequelize.fn('SUM', sequelize.col('amount')), 'DESC']]
    });

    res.json(categorySpending);
  } catch (error) {
    console.error('Error fetching category spending:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get daily transaction trends
router.get('/daily-trends', async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;
    
    // Default to last 30 days if no dates provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const where = {
      createdAt: {
        [Op.between]: [start, end]
      }
    };
    if (userId) where.userId = userId;

    const dailyTrends = await Transaction.findAll({
      where,
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'transactionCount'],
        [sequelize.fn('AVG', sequelize.col('amount')), 'averageAmount']
      ],
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
    });

    res.json(dailyTrends);
  } catch (error) {
    console.error('Error fetching daily trends:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get fraud statistics
router.get('/fraud-stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const fraudStats = await Transaction.findAll({
      where,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalTransactions'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN "isFraudulent" = true THEN 1 ELSE 0 END')), 'fraudulentTransactions'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN "isFraudulent" = true THEN amount ELSE 0 END')), 'fraudulentAmount'],
        [sequelize.fn('AVG', sequelize.col('fraudScore')), 'averageFraudScore']
      ]
    });

    const fraudByCategory = await Transaction.findAll({
      where: { ...where, isFraudulent: true },
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'fraudCount'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'fraudAmount']
      ],
      group: ['category'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
    });

    res.json({
      overall: fraudStats[0],
      byCategory: fraudByCategory
    });
  } catch (error) {
    console.error('Error fetching fraud stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get real-time dashboard summary
router.get('/dashboard-summary', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [
      totalTransactions,
      todayTransactions,
      totalAmount,
      todayAmount,
      fraudulentTransactions,
      activeUsers,
      activeMerchants
    ] = await Promise.all([
      Transaction.count(),
      Transaction.count({ where: { createdAt: { [Op.gte]: today } } }),
      Transaction.sum('amount'),
      Transaction.sum('amount', { where: { createdAt: { [Op.gte]: today } } }),
      Transaction.count({ where: { isFraudulent: true } }),
      User.count({ where: { isActive: true } }),
      Merchant.count({ where: { isActive: true } })
    ]);

    const recentTransactions = await Transaction.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'user', attributes: ['firstName', 'lastName'] },
        { model: Merchant, as: 'merchant', attributes: ['name', 'category'] }
      ]
    });

    const topCategories = await Transaction.findAll({
      where: { createdAt: { [Op.gte]: today } },
      attributes: [
        'category',
        [sequelize.fn('SUM', sequelize.col('amount')), 'amount']
      ],
      group: ['category'],
      order: [[sequelize.fn('SUM', sequelize.col('amount')), 'DESC']],
      limit: 5
    });

    res.json({
      totalTransactions,
      todayTransactions,
      totalAmount: parseFloat(totalAmount || 0),
      todayAmount: parseFloat(todayAmount || 0),
      fraudulentTransactions,
      activeUsers,
      activeMerchants,
      recentTransactions,
      topCategories
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get hourly transaction volume for today
router.get('/hourly-volume', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const hourlyVolume = await Transaction.findAll({
      where: {
        createdAt: {
          [Op.between]: [today, tomorrow]
        }
      },
      attributes: [
        [sequelize.fn('EXTRACT', sequelize.literal('HOUR FROM "createdAt"')), 'hour'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'transactionCount'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
      ],
      group: [sequelize.fn('EXTRACT', sequelize.literal('HOUR FROM "createdAt"'))],
      order: [[sequelize.fn('EXTRACT', sequelize.literal('HOUR FROM "createdAt"')), 'ASC']]
    });

    res.json(hourlyVolume);
  } catch (error) {
    console.error('Error fetching hourly volume:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;