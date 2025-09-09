import React, { useState, useEffect } from 'react';
import { Typography, Box, List, ListItem, ListItemText, Chip, Avatar } from '@mui/material';
import { Warning, AttachMoney, Person, Store } from '@mui/icons-material';

const TransactionFeed = ({ transactions }) => {
  const [localTransactions, setLocalTransactions] = useState([]);

  useEffect(() => {
    if (transactions && transactions.length > 0) {
      setLocalTransactions(transactions);
    }
  }, [transactions]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString();
  };

  const getStatusColor = (transaction) => {
    if (transaction.isFraudulent) return 'error';
    if (transaction.status === 'completed') return 'success';
    if (transaction.status === 'pending') return 'warning';
    return 'default';
  };

  const getStatusText = (transaction) => {
    if (transaction.isFraudulent) return 'FRAUD';
    return transaction.status?.toUpperCase();
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <AttachMoney sx={{ mr: 1 }} />
        Live Transaction Feed
      </Typography>
      
      {localTransactions.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
          No transactions yet. Waiting for real-time data...
        </Typography>
      ) : (
        <List dense>
          {localTransactions.slice(0, 20).map((transaction) => (
            <ListItem 
              key={transaction.id}
              sx={{ 
                mb: 1, 
                border: '1px solid #e0e0e0', 
                borderRadius: 1,
                backgroundColor: transaction.isFraudulent ? '#ffebee' : 'white'
              }}
            >
              <Avatar sx={{ mr: 2, bgcolor: transaction.isFraudulent ? 'error.main' : 'primary.main' }}>
                {transaction.isFraudulent ? <Warning /> : <AttachMoney />}
              </Avatar>
              
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1" component="span">
                      {formatCurrency(transaction.amount)}
                    </Typography>
                    <Chip 
                      size="small" 
                      label={getStatusText(transaction)}
                      color={getStatusColor(transaction)}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {formatTime(transaction.createdAt)}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Person fontSize="small" />
                      <Typography variant="body2">
                        {transaction.user?.firstName} {transaction.user?.lastName}
                      </Typography>
                      <Store fontSize="small" />
                      <Typography variant="body2">
                        {transaction.merchant?.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Category: {transaction.category}
                      {transaction.isFraudulent && transaction.fraudReason && (
                        <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>
                          {' '}• {transaction.fraudReason}
                        </span>
                      )}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default TransactionFeed;