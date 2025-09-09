const { Transaction, User, Merchant } = require('../models');
const fraudDetectionService = require('./fraudDetectionService');
const { v4: uuidv4 } = require('uuid');

class SimulationService {
  constructor() {
    this.isRunning = false;
    this.io = null;
    this.intervalId = null;
    
    // Sample data for simulation
    this.categories = [
      'Groceries', 'Gas', 'Restaurants', 'Shopping', 'Entertainment',
      'Healthcare', 'Travel', 'Utilities', 'Insurance', 'Education',
      'ATM', 'Online', 'Subscription', 'Electronics', 'Pharmacy'
    ];

    this.merchantData = [
      { name: 'SuperMart Grocery', category: 'Groceries', avgAmount: 75 },
      { name: 'Shell Gas Station', category: 'Gas', avgAmount: 45 },
      { name: 'Pizza Palace', category: 'Restaurants', avgAmount: 25 },
      { name: 'Amazon', category: 'Shopping', avgAmount: 65 },
      { name: 'Netflix', category: 'Subscription', avgAmount: 15 },
      { name: 'Starbucks', category: 'Restaurants', avgAmount: 8 },
      { name: 'Target', category: 'Shopping', avgAmount: 85 },
      { name: 'CVS Pharmacy', category: 'Pharmacy', avgAmount: 35 },
      { name: 'Uber', category: 'Travel', avgAmount: 18 },
      { name: 'Best Buy', category: 'Electronics', avgAmount: 250 },
      { name: 'Walmart', category: 'Groceries', avgAmount: 55 },
      { name: 'Spotify', category: 'Subscription', avgAmount: 10 },
      { name: 'McDonald\'s', category: 'Restaurants', avgAmount: 12 },
      { name: 'Costco', category: 'Groceries', avgAmount: 120 },
      { name: 'Exxon', category: 'Gas', avgAmount: 50 }
    ];

    this.userData = [
      { firstName: 'John', lastName: 'Doe', email: 'john.doe@email.com' },
      { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@email.com' },
      { firstName: 'Mike', lastName: 'Johnson', email: 'mike.johnson@email.com' },
      { firstName: 'Sarah', lastName: 'Williams', email: 'sarah.williams@email.com' },
      { firstName: 'David', lastName: 'Brown', email: 'david.brown@email.com' },
      { firstName: 'Emily', lastName: 'Davis', email: 'emily.davis@email.com' },
      { firstName: 'Chris', lastName: 'Wilson', email: 'chris.wilson@email.com' },
      { firstName: 'Lisa', lastName: 'Garcia', email: 'lisa.garcia@email.com' },
      { firstName: 'Tom', lastName: 'Martinez', email: 'tom.martinez@email.com' },
      { firstName: 'Amy', lastName: 'Anderson', email: 'amy.anderson@email.com' }
    ];
  }

  async initializeData() {
    try {
      console.log('Initializing simulation data...');

      // Create users if they don't exist
      for (const userData of this.userData) {
        const [user] = await User.findOrCreate({
          where: { email: userData.email },
          defaults: {
            ...userData,
            accountBalance: Math.random() * 5000 + 1000 // Random balance between $1000-$6000
          }
        });
      }

      // Create merchants if they don't exist
      for (const merchantData of this.merchantData) {
        const [merchant] = await Merchant.findOrCreate({
          where: { name: merchantData.name },
          defaults: {
            ...merchantData,
            location: this.getRandomLocation(),
            averageTransactionAmount: merchantData.avgAmount
          }
        });
      }

      console.log('Simulation data initialized successfully');
    } catch (error) {
      console.error('Error initializing simulation data:', error);
    }
  }

  async startSimulation(io) {
    if (this.isRunning) {
      console.log('Simulation already running');
      return;
    }

    this.io = io;
    this.isRunning = true;

    console.log('Starting transaction simulation...');
    
    // Initialize data first
    await this.initializeData();

    // Start generating transactions
    this.intervalId = setInterval(() => {
      this.generateRandomTransaction();
    }, this.getRandomInterval());

    console.log('Transaction simulation started');
  }

  stopSimulation() {
    if (!this.isRunning) {
      console.log('Simulation not running');
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    console.log('Transaction simulation stopped');
  }

  async generateRandomTransaction() {
    try {
      // Get random user and merchant
      const users = await User.findAll({ where: { isActive: true } });
      const merchants = await Merchant.findAll({ where: { isActive: true } });

      if (users.length === 0 || merchants.length === 0) {
        console.log('No users or merchants available for simulation');
        return;
      }

      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomMerchant = merchants[Math.floor(Math.random() * merchants.length)];

      // Generate transaction amount based on merchant's average with some variance
      const baseAmount = parseFloat(randomMerchant.averageTransactionAmount);
      const variance = 0.5; // 50% variance
      const amount = baseAmount * (1 + (Math.random() - 0.5) * variance * 2);
      
      // Occasionally generate fraudulent-looking transactions
      let finalAmount = Math.max(1, Math.round(amount * 100) / 100);
      
      // 5% chance of generating a suspicious transaction
      if (Math.random() < 0.05) {
        finalAmount = this.generateSuspiciousAmount();
      }

      // Create transaction
      const transaction = await Transaction.create({
        userId: randomUser.id,
        merchantId: randomMerchant.id,
        amount: finalAmount,
        type: 'debit',
        category: randomMerchant.category,
        description: `Purchase at ${randomMerchant.name}`,
        location: this.getRandomLocation(),
        deviceInfo: this.getRandomDeviceInfo()
      });

      // Run fraud detection
      const fraudResult = await fraudDetectionService.analyzeTransaction(transaction);
      if (fraudResult.isFraudulent) {
        await transaction.update({
          isFraudulent: true,
          fraudReason: fraudResult.reason,
          fraudScore: fraudResult.score
        });
      }

      // Get full transaction with associations
      const fullTransaction = await Transaction.findByPk(transaction.id, {
        include: [
          { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] },
          { model: Merchant, as: 'merchant', attributes: ['name', 'category', 'location'] }
        ]
      });

      // Emit real-time updates
      if (this.io) {
        this.io.emit('newTransaction', fullTransaction);

        if (fraudResult.isFraudulent) {
          this.io.emit('fraudAlert', {
            transaction: fullTransaction,
            fraudReason: fraudResult.reason,
            fraudScore: fraudResult.score
          });
        }
      }

      console.log(`Generated transaction: $${finalAmount} at ${randomMerchant.name} ${fraudResult.isFraudulent ? '(FRAUD)' : ''}`);

      // Schedule next transaction
      if (this.isRunning) {
        setTimeout(() => {
          if (this.isRunning) {
            this.generateRandomTransaction();
          }
        }, this.getRandomInterval());
      }

    } catch (error) {
      console.error('Error generating random transaction:', error);
    }
  }

  generateSuspiciousAmount() {
    const suspiciousPatterns = [
      () => Math.floor(Math.random() * 50) * 100 + 500, // Round numbers $500-$5500
      () => Math.random() * 8000 + 2000, // Large amounts $2000-$10000
      () => 9999.99, // Specific suspicious amount
      () => 1000 + Math.random() * 4000 // High amounts $1000-$5000
    ];

    const pattern = suspiciousPatterns[Math.floor(Math.random() * suspiciousPatterns.length)];
    return Math.round(pattern() * 100) / 100;
  }

  getRandomInterval() {
    // Random interval between 2-10 seconds for demo purposes
    // In production, this would be much longer
    return Math.random() * 8000 + 2000;
  }

  getRandomLocation() {
    const locations = [
      'New York, NY',
      'Los Angeles, CA',
      'Chicago, IL',
      'Houston, TX',
      'Phoenix, AZ',
      'Philadelphia, PA',
      'San Antonio, TX',
      'San Diego, CA',
      'Dallas, TX',
      'San Jose, CA',
      'Austin, TX',
      'Jacksonville, FL',
      'San Francisco, CA',
      'Columbus, OH',
      'Fort Worth, TX'
    ];

    return locations[Math.floor(Math.random() * locations.length)];
  }

  getRandomDeviceInfo() {
    const devices = [
      { type: 'mobile', os: 'iOS', browser: 'Safari' },
      { type: 'mobile', os: 'Android', browser: 'Chrome' },
      { type: 'desktop', os: 'Windows', browser: 'Chrome' },
      { type: 'desktop', os: 'macOS', browser: 'Safari' },
      { type: 'desktop', os: 'Linux', browser: 'Firefox' },
      { type: 'tablet', os: 'iOS', browser: 'Safari' },
      { type: 'tablet', os: 'Android', browser: 'Chrome' }
    ];

    return devices[Math.floor(Math.random() * devices.length)];
  }

  async generateBulkTransactions(count = 100) {
    console.log(`Generating ${count} bulk transactions...`);
    
    for (let i = 0; i < count; i++) {
      await this.generateRandomTransaction();
      
      // Small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`Generated ${count} bulk transactions`);
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      hasSocketConnection: !!this.io
    };
  }
}

module.exports = new SimulationService();