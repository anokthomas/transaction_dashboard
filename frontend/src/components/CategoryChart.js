import React, { useState, useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { analyticsAPI } from '../services/api';

const COLORS = [
  '#1976d2', '#2e7d32', '#ed6c02', '#d32f2f', '#7b1fa2',
  '#00796b', '#f57c00', '#5d4037', '#455a64', '#c2185b',
  '#8bc34a', '#ff9800', '#9c27b0', '#607d8b', '#e91e63'
];

const CategoryChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const response = await analyticsAPI.getSpendingByCategory();
        const formattedData = response.data.map((item, index) => ({
          name: item.category,
          value: parseFloat(item.totalAmount),
          count: parseInt(item.transactionCount),
          color: COLORS[index % COLORS.length]
        }));
        setData(formattedData);
      } catch (error) {
        console.error('Error fetching category data:', error);
      }
    };

    fetchCategoryData();
    const interval = setInterval(fetchCategoryData, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box sx={{ 
          backgroundColor: 'white', 
          p: 1, 
          border: '1px solid #ccc',
          borderRadius: 1,
          boxShadow: 1
        }}>
          <Typography variant="body2">{data.name}</Typography>
          <Typography variant="body2" color="primary">
            {formatCurrency(data.value)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data.count} transactions
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Spending by Category
      </Typography>
      
      {data.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
          Loading category data...
        </Typography>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label={({ name, percent }) => 
                percent > 5 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
              }
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              formatter={(value, entry) => 
                `${value}: ${formatCurrency(entry.payload.value)}`
              }
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
};

export default CategoryChart;