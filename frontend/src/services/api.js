import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 10000,
});

export const transactionAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  updateStatus: (id, status) => api.patch(`/transactions/${id}/status`, { status }),
};

export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
};

export const merchantAPI = {
  getAll: (params) => api.get('/merchants', { params }),
  getById: (id) => api.get(`/merchants/${id}`),
  create: (data) => api.post('/merchants', data),
  update: (id, data) => api.put(`/merchants/${id}`, data),
  getCategories: () => api.get('/merchants/categories/list'),
};

export const analyticsAPI = {
  getSpendingByCategory: (params) => api.get('/analytics/spending-by-category', { params }),
  getDailyTrends: (params) => api.get('/analytics/daily-trends', { params }),
  getFraudStats: (params) => api.get('/analytics/fraud-stats', { params }),
  getDashboardSummary: () => api.get('/analytics/dashboard-summary'),
  getHourlyVolume: () => api.get('/analytics/hourly-volume'),
};

export default api;