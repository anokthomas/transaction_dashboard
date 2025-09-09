import React, { useState, useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsAPI } from '../services/api';

const DailyTrendsChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchDailyTrends = async () => {
      try {
        const response = await analyticsAPI.getDailyTrends();
        const formattedData = response.data.map(item => ({
          date: new Date(item.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          }),
          amount: parseFloat(item.totalAmount || 0),
          count: parseInt(item.transactionCount),
          average: parseFloat(item.averageAmount || 0)
        }));
        setData(formattedData);
      } catch (error) {
        console.error('Error fetching daily trends:', error);
      }
    };

    fetchDailyTrends();
    const interval = setInterval(fetchDailyTrends, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{ 
          backgroundColor: 'white', 
          p: 1, 
          border: '1px solid #ccc',
          borderRadius: 1,
          boxShadow: 1
        }}>
          <Typography variant="body2">{label}</Typography>
          <Typography variant="body2" color="primary">
            Total: {formatCurrency(payload[0].value)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Transactions: {payload[0].payload.count}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Average: {formatCurrency(payload[0].payload.average)}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Daily Transaction Trends (Last 30 Days)
      </Typography>
      
      {data.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
          Loading trend data...
        </Typography>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="amount" 
              stroke="#1976d2"
              fill="#1976d2"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
};

export default DailyTrendsChart;