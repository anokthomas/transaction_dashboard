const express = require('express');
const { Merchant, Transaction } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

// Get all merchants
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, category, search } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (category) where.category = category;
    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    const merchants = await Merchant.findAndCountAll({
      where,
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      merchants: merchants.rows,
      total: merchants.count,
      page: parseInt(page),
      totalPages: Math.ceil(merchants.count / limit)
    });
  } catch (error) {
    console.error('Error fetching merchants:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get merchant by ID
router.get('/:id', async (req, res) => {
  try {
    const merchant = await Merchant.findByPk(req.params.id, {
      include: [
        {
          model: Transaction,
          as: 'transactions',
          limit: 10,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!merchant) {
      return res.status(404).json({ error: 'Merchant not found' });
    }

    res.json(merchant);
  } catch (error) {
    console.error('Error fetching merchant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new merchant
router.post('/', async (req, res) => {
  try {
    const { name, category, location, averageTransactionAmount } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }

    const merchant = await Merchant.create({
      name,
      category,
      location,
      averageTransactionAmount: averageTransactionAmount || 50.00
    });

    res.status(201).json(merchant);
  } catch (error) {
    console.error('Error creating merchant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update merchant
router.put('/:id', async (req, res) => {
  try {
    const { name, category, location, averageTransactionAmount, isActive } = req.body;
    
    const merchant = await Merchant.findByPk(req.params.id);
    if (!merchant) {
      return res.status(404).json({ error: 'Merchant not found' });
    }

    await merchant.update({
      name: name || merchant.name,
      category: category || merchant.category,
      location: location !== undefined ? location : merchant.location,
      averageTransactionAmount: averageTransactionAmount !== undefined ? averageTransactionAmount : merchant.averageTransactionAmount,
      isActive: isActive !== undefined ? isActive : merchant.isActive
    });

    res.json(merchant);
  } catch (error) {
    console.error('Error updating merchant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get merchant categories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Merchant.findAll({
      attributes: ['category'],
      group: ['category'],
      raw: true
    });

    const categoryList = categories.map(item => item.category);
    res.json(categoryList);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;