const express = require('express');
const { Transaction, User, Merchant } = require('../models');
const { Op } = require('sequelize');
const fraudDetectionService = require('../services/fraudDetectionService');

const router = express.Router();

// Get all transactions with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      userId, 
      merchantId, 
      category, 
      startDate, 
      endDate,
      isFraudulent 
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (userId) where.userId = userId;
    if (merchantId) where.merchantId = merchantId;
    if (category) where.category = category;
    if (isFraudulent !== undefined) where.isFraudulent = isFraudulent === 'true';
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const transactions = await Transaction.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] },
        { model: Merchant, as: 'merchant', attributes: ['name', 'category', 'location'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      transactions: transactions.rows,
      total: transactions.count,
      page: parseInt(page),
      totalPages: Math.ceil(transactions.count / limit)
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get transaction by ID
router.get('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] },
        { model: Merchant, as: 'merchant', attributes: ['name', 'category', 'location'] }
      ]
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new transaction
router.post('/', async (req, res) => {
  try {
    const { userId, merchantId, amount, type, category, description, location, deviceInfo } = req.body;

    // Validate required fields
    if (!userId || !merchantId || !amount || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create transaction
    const transaction = await Transaction.create({
      userId,
      merchantId,
      amount,
      type: type || 'debit',
      category,
      description,
      location,
      deviceInfo
    });

    // Run fraud detection
    const fraudResult = await fraudDetectionService.analyzeTransaction(transaction);
    if (fraudResult.isFraudulent) {
      await transaction.update({
        isFraudulent: true,
        fraudReason: fraudResult.reason,
        fraudScore: fraudResult.score,
        status: 'pending'
      });
    }

    // Get full transaction with associations
    const fullTransaction = await Transaction.findByPk(transaction.id, {
      include: [
        { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] },
        { model: Merchant, as: 'merchant', attributes: ['name', 'category', 'location'] }
      ]
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('newTransaction', fullTransaction);

    if (fraudResult.isFraudulent) {
      io.emit('fraudAlert', {
        transaction: fullTransaction,
        fraudReason: fraudResult.reason,
        fraudScore: fraudResult.score
      });
    }

    res.status(201).json(fullTransaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update transaction status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'completed', 'failed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const transaction = await Transaction.findByPk(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await transaction.update({ status });

    const updatedTransaction = await Transaction.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] },
        { model: Merchant, as: 'merchant', attributes: ['name', 'category', 'location'] }
      ]
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('transactionUpdated', updatedTransaction);

    res.json(updatedTransaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;