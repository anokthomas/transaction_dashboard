import React from 'react';
import { 
  Typography, 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  Chip,
  Avatar
} from '@mui/material';
import { Warning } from '@mui/icons-material';

const FraudAlerts = ({ alerts }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getSeverityColor = (score) => {
    if (score >= 90) return 'error';
    if (score >= 70) return 'warning';
    return 'info';
  };

  const getSeverityText = (score) => {
    if (score >= 90) return 'HIGH';
    if (score >= 70) return 'MEDIUM';
    return 'LOW';
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <Warning sx={{ mr: 1, color: 'error.main' }} />
        Fraud Alerts
      </Typography>
      
      {!alerts || alerts.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
          No fraud alerts detected
        </Typography>
      ) : (
        <List dense>
          {alerts.slice(0, 10).map((alert, index) => {
            const transaction = alert.transaction;
            return (
              <ListItem 
                key={transaction.id || index}
                sx={{ 
                  mb: 1, 
                  border: '1px solid #ffcdd2', 
                  borderRadius: 1,
                  backgroundColor: '#ffebee'
                }}
              >
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: 'error.main', width: 32, height: 32 }}>
                    <Warning fontSize="small" />
                  </Avatar>
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="body1" component="span" color="error">
                        {formatCurrency(transaction.amount)}
                      </Typography>
                      <Chip 
                        size="small" 
                        label={`${getSeverityText(alert.fraudScore)} RISK`}
                        color={getSeverityColor(alert.fraudScore)}
                      />
                      <Chip 
                        size="small" 
                        label={`Score: ${alert.fraudScore}`}
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {transaction.user?.firstName} {transaction.user?.lastName} • {transaction.merchant?.name}
                      </Typography>
                      <Typography variant="body2" color="error" sx={{ fontWeight: 'medium' }}>
                        {alert.fraudReason}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(transaction.createdAt)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            );
          })}
        </List>
      )}
      
      {alerts && alerts.length > 10 && (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
          Showing latest 10 alerts ({alerts.length} total)
        </Typography>
      )}
    </Box>
  );
};

export default FraudAlerts;