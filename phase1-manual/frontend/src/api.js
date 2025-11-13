import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized - token expired or invalid
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      // Handle 403 Forbidden - insufficient permissions
      if (error.response.status === 403) {
        console.error('Access denied:', error.response.data.message);
        // You could also show a toast notification here
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resetPassword: (token, data) => api.put(`/auth/reset-password/${token}`, data)
};

export const equipmentAPI = {
  getAll: (params) => api.get('/equipment', { params }),
  getById: (id) => api.get(`/equipment/${id}`),
  create: (data) => api.post('/equipment', data),
  update: (id, data) => api.put(`/equipment/${id}`, data),
  delete: (id) => api.delete(`/equipment/${id}`)
};

export const requestAPI = {
  getAll: () => api.get('/requests'),
  getById: (id) => api.get(`/requests/${id}`),
  create: (data) => api.post('/requests', data),
  updateStatus: (id, status, note = null) => {
    const payload = { status };
    if (note) {
      if (status === 'rejected') {
        payload.rejectionReason = note;
      } else if (status === 'approved') {
        payload.approvalNote = note;
      }
    }
    return api.put(`/requests/${id}/status`, payload);
  },
  delete: (id) => api.delete(`/requests/${id}`)
};

export const supportAPI = {
  sendMessage: (data) => api.post('/support/contact', data)
};

export const notificationAPI = {
  subscribe: (equipmentId) => api.post(`/notifications/${equipmentId}/subscribe`),
  unsubscribe: (equipmentId) => api.delete(`/notifications/${equipmentId}/unsubscribe`),
  checkSubscription: (equipmentId) => api.get(`/notifications/${equipmentId}/status`),
  bulkCheck: (equipmentIds) => api.post('/notifications/bulk-check', { equipmentIds }),
  getMySubscriptions: () => api.get('/notifications/my-subscriptions')
};

export default api;
