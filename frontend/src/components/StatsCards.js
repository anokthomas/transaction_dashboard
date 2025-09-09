import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { TrendingUp, Warning, People } from '@mui/icons-material';
import { analyticsAPI } from '../services/api';

const StatsCards = () => {
  const [stats, setStats] = useState({
    totalTransactions: 0,
    todayTransactions: 0,
    totalAmount: 0,
    todayAmount: 0,
    fraudulentTransactions: 0,
    activeUsers: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await analyticsAPI.getDashboardSummary();
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const cards = [
    {
      title: 'Total Transactions',
      value: formatNumber(stats.totalTransactions),
      icon: TrendingUp,
      color: '#1976d2',
      subtitle: `${formatNumber(stats.todayTransactions)} today`
    },
    {
      title: 'Total Volume',
      value: formatCurrency(stats.totalAmount),
      icon: TrendingUp,
      color: '#2e7d32',
      subtitle: `${formatCurrency(stats.todayAmount)} today`
    },
    {
      title: 'Fraud Alerts',
      value: formatNumber(stats.fraudulentTransactions),
      icon: Warning,
      color: '#d32f2f',
      subtitle: 'Total flagged'
    },
    {
      title: 'Active Users',
      value: formatNumber(stats.activeUsers),
      icon: People,
      color: '#ed6c02',
      subtitle: 'Registered users'
    }
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <card.icon sx={{ color: card.color, mr: 1 }} />
                <Typography variant="h6" component="div" color="text.secondary">
                  {card.title}
                </Typography>
              </Box>
              <Typography variant="h4" component="div" color={card.color}>
                {card.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {card.subtitle}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default StatsCards;