# Real-Time Transaction Dashboard

A full-stack web application that simulates financial transactions between users and merchants, stores them in a database, and visualizes data in real time. The application includes fraud detection capabilities and provides comprehensive analytics through an interactive dashboard.

## 🚀 Features

- **Real-time Transaction Monitoring**: Live transaction feed with Socket.IO
- **Fraud Detection**: ML-based suspicious activity flagging with configurable rules
- **Interactive Dashboard**: Comprehensive analytics and visualizations
- **Category Analytics**: Spending breakdown by transaction categories
- **Daily Trends**: Time-based transaction analysis and patterns
- **Live Alerts**: Instant fraud alerts and notifications
- **Transaction Simulation**: Automated realistic transaction generation
- **Responsive Design**: Mobile-friendly Material-UI interface

## 🛠 Technology Stack

### Backend
- **Node.js** with Express.js framework
- **PostgreSQL** database with Sequelize ORM
- **Socket.IO** for real-time communication
- **Fraud Detection Engine** with rule-based analysis

### Frontend
- **React.js** with Material-UI components
- **Recharts** for data visualization
- **Socket.IO Client** for real-time updates
- **Axios** for API communication

### Database
- **PostgreSQL** for reliable transaction storage
- **Sequelize** for database modeling and migrations

## 📋 Prerequisites

- Node.js 16+ and npm 8+
- PostgreSQL 12+
- Git

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/anokthomas/transaction_dashboard.git
cd transaction_dashboard
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 3. Database Setup
```bash
# Create PostgreSQL database
createdb transaction_dashboard

# Update database connection in backend/.env
DATABASE_URL=postgresql://username:password@localhost:5432/transaction_dashboard
```

### 4. Environment Configuration

**Backend** (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/transaction_dashboard
FRONTEND_URL=http://localhost:3000
SIMULATION_ENABLED=true
FRAUD_DETECTION_ENABLED=true
```

**Frontend** (`frontend/.env`):
```env
REACT_APP_BACKEND_URL=http://localhost:5000
```

### 5. Start the Application

**Development Mode** (both frontend and backend):
```bash
npm run dev
```

**Production Mode**:
```bash
# Build frontend
npm run build

# Start backend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

## 📊 API Endpoints

### Transactions
- `GET /api/transactions` - Get transactions with filtering and pagination
- `POST /api/transactions` - Create new transaction
- `GET /api/transactions/:id` - Get transaction by ID
- `PATCH /api/transactions/:id/status` - Update transaction status

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user

### Merchants
- `GET /api/merchants` - Get all merchants
- `POST /api/merchants` - Create new merchant
- `GET /api/merchants/:id` - Get merchant by ID
- `PUT /api/merchants/:id` - Update merchant

### Analytics
- `GET /api/analytics/spending-by-category` - Category spending analysis
- `GET /api/analytics/daily-trends` - Daily transaction trends
- `GET /api/analytics/fraud-stats` - Fraud statistics
- `GET /api/analytics/dashboard-summary` - Dashboard overview
- `GET /api/analytics/hourly-volume` - Hourly transaction volume

## 🔍 Fraud Detection

The application includes a sophisticated fraud detection system with the following rules:

- **Large Transaction Amounts**: Transactions over $1,000 (30 points) or $5,000 (50 points)
- **Rapid Fire Transactions**: Multiple transactions within 5 minutes (40 points)
- **High Frequency**: More than 10 transactions per hour (35 points)
- **Unusual Categories**: First-time category usage for a user (20 points)
- **Round Number Patterns**: Round amounts over $500 (15 points)
- **Time-based Anomalies**: Late night transactions 2-6 AM (25 points)
- **Amount Deviation**: Transactions 5x user's average (30 points)
- **Geographic Velocity**: Impossible location changes (45 points)

Transactions with fraud scores ≥70 are flagged as fraudulent.

## 🎯 Real-Time Features

### Socket.IO Events
- `newTransaction` - Broadcast new transactions
- `fraudAlert` - Immediate fraud notifications
- `transactionUpdated` - Transaction status changes

### Live Dashboard Components
- Transaction feed with real-time updates
- Live fraud alerts panel
- Dynamic charts that update automatically
- Real-time statistics cards

## 🚀 Deployment

### Heroku Deployment
```bash
# Create Heroku app
heroku create your-app-name

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL=https://your-app-name.herokuapp.com

# Deploy
git push heroku main
```

### Render Deployment
1. Connect your GitHub repository to Render
2. Use the provided `render.yaml` configuration
3. Set environment variables in Render dashboard
4. Deploy automatically on git push

## 🧪 Testing

### Manual Testing
1. Start the application in development mode
2. Open the dashboard at http://localhost:3000
3. Watch real-time transactions being generated
4. Observe fraud alerts appearing for suspicious transactions
5. Explore different analytics views

### API Testing
```bash
# Health check
curl http://localhost:5000/health

# Get dashboard summary
curl http://localhost:5000/api/analytics/dashboard-summary

# Create test transaction
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-id","merchantId":"merchant-id","amount":100,"category":"Groceries"}'
```

## 📁 Project Structure

```
transaction_dashboard/
├── backend/                 # Node.js backend
│   ├── config/             # Database configuration
│   ├── models/             # Sequelize models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   └── server.js           # Main server file
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API service layer
│   │   └── App.js          # Main App component
│   └── build/              # Production build
├── database/               # Database scripts
├── package.json            # Root dependencies
├── Procfile               # Heroku deployment
└── render.yaml            # Render deployment
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support or questions:
- Create an issue in the GitHub repository
- Check the API documentation at `/health` endpoint
- Review the console logs for debugging information

## 🔮 Future Enhancements

- Advanced ML fraud detection models
- User authentication and authorization
- Transaction export functionality
- Advanced filtering and search
- Email/SMS fraud notifications
- Multi-currency support
- Advanced analytics and reporting