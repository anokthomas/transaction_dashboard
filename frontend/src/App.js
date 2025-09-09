import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import io from 'socket.io-client';
import './App.css';

// Components
import Dashboard from './components/Dashboard';
import TransactionFeed from './components/TransactionFeed';
import CategoryChart from './components/CategoryChart';
import DailyTrendsChart from './components/DailyTrendsChart';
import FraudAlerts from './components/FraudAlerts';
import StatsCards from './components/StatsCards';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  const [transactions, setTransactions] = useState([]);
  const [fraudAlerts, setFraudAlerts] = useState([]);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000');

    // Socket event listeners
    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('newTransaction', (transaction) => {
      setTransactions(prev => [transaction, ...prev.slice(0, 49)]); // Keep last 50 transactions
    });

    newSocket.on('fraudAlert', (alert) => {
      setFraudAlerts(prev => [alert, ...prev.slice(0, 9)]); // Keep last 10 alerts
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: 'background.default' }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center" color="primary">
            Real-Time Transaction Dashboard
          </Typography>
          
          <Grid container spacing={3}>
            {/* Stats Cards */}
            <Grid item xs={12}>
              <StatsCards />
            </Grid>

            {/* Main Dashboard */}
            <Grid item xs={12} lg={8}>
              <Paper sx={{ p: 2, height: 400 }}>
                <Dashboard />
              </Paper>
            </Grid>

            {/* Fraud Alerts */}
            <Grid item xs={12} lg={4}>
              <Paper sx={{ p: 2, height: 400, overflow: 'auto' }}>
                <FraudAlerts alerts={fraudAlerts} />
              </Paper>
            </Grid>

            {/* Category Spending Chart */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 400 }}>
                <CategoryChart />
              </Paper>
            </Grid>

            {/* Daily Trends Chart */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 400 }}>
                <DailyTrendsChart />
              </Paper>
            </Grid>

            {/* Live Transaction Feed */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, maxHeight: 500, overflow: 'auto' }}>
                <TransactionFeed transactions={transactions} />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
