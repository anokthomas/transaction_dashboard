import React, { useState, useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsAPI } from '../services/api';

const Dashboard = () => {
  const [hourlyData, setHourlyData] = useState([]);

  useEffect(() => {
    const fetchHourlyData = async () => {
      try {
        const response = await analyticsAPI.getHourlyVolume();
        const formattedData = response.data.map(item => ({
          hour: `${item.hour}:00`,
          transactions: parseInt(item.transactionCount),
          volume: parseFloat(item.totalAmount || 0)
        }));
        setHourlyData(formattedData);
      } catch (error) {
        console.error('Error fetching hourly data:', error);
      }
    };

    fetchHourlyData();
    const interval = setInterval(fetchHourlyData, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Today's Transaction Volume by Hour
      </Typography>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={hourlyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" />
          <YAxis />
          <Tooltip 
            formatter={(value, name) => [
              name === 'transactions' ? value : `$${value.toFixed(2)}`,
              name === 'transactions' ? 'Transactions' : 'Volume'
            ]}
          />
          <Line 
            type="monotone" 
            dataKey="transactions" 
            stroke="#1976d2" 
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="volume" 
            stroke="#2e7d32" 
            strokeWidth={2}
            dot={{ r: 4 }}
            yAxisId="right"
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default Dashboard;