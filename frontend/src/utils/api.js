import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://igv-cms-backend.onrender.com';
const API = `${BACKEND_URL}/api`;

// Configure axios with retry logic
axios.interceptors.response.use(
  response => response,
  async error => {
    const config = error.config;
    if (!config || !config.retry) {
      config.retry = 0;
    }
    
    if (config.retry >= 3) {
      return Promise.reject(error);
    }
    
    config.retry += 1;
    const delay = 2000 * config.retry;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return axios(config);
  }
);

// API Client
export const api = {
  // Contact form
  sendContact: async (data) => {
    const response = await axios.post(`${API}/contact`, data);
    return response.data;
  },

  // Get contacts (admin)
  getContacts: async () => {
    const response = await axios.get(`${API}/contacts`);
    return response.data;
  },

  // Cart
  addToCart: async (item) => {
    const response = await axios.post(`${API}/cart`, item);
    return response.data;
  },

  getCart: async () => {
    const response = await axios.get(`${API}/cart`);
    return response.data;
  },

  // Location detection
  detectLocation: async () => {
    try {
      const response = await axios.get(`${API}/detect-location`);
      return response.data;
    } catch (error) {
      console.error('Error detecting location:', error);
      // Fallback to Europe
      return {
        region: 'europe',
        country: 'France',
        currency: '€'
      };
    }
  },

  // Mini-analysis (uses absolute URL for Render backend)
  sendMiniAnalysis: async (data) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://igv-cms-backend.onrender.com';
    const response = await axios.post(`${backendUrl}/api/mini-analysis`, data);
    return response.data;
  },

  // Contact expert (post mini-analysis)
  contactExpert: async (data) => {
    const response = await axios.post(`${API}/contact-expert`, data);
    return response.data;
  },

  // Generate PDF for mini-analysis
  generatePDF: async (data) => {
    const response = await axios.post(`${API}/pdf/generate`, data, {
      timeout: 30000 // 30 second timeout for PDF generation
    });
    return response.data;
  },

  // Email PDF to user
  emailPDF: async (data) => {
    const response = await axios.post(`${API}/email/send-pdf`, data);
    return response.data;
  },

  // Create Google Calendar event
  createCalendarEvent: async (data) => {
    const response = await axios.post(`${API}/calendar/create-event`, data);
    return response.data;
  },

  // Admin Authentication
  adminLogin: async (credentials) => {
    const response = await axios.post(`${API}/admin/login`, credentials);
    return response.data;
  },

  adminVerifyToken: async () => {
    const token = localStorage.getItem('admin_token');
    const response = await axios.get(`${API}/admin/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Admin Dashboard
  getAdminStats: async () => {
    const token = localStorage.getItem('admin_token');
    const response = await axios.get(`${API}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getLeads: async (params = {}) => {
    const token = localStorage.getItem('admin_token');
    const response = await axios.get(`${API}/admin/leads`, {
      headers: { Authorization: `Bearer ${token}` },
      params
    });
    return response.data;
  },

  getAdminContacts: async () => {
    const token = localStorage.getItem('admin_token');
    const response = await axios.get(`${API}/admin/contacts`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Admin User Management
  createAdminUser: async (userData) => {
    const token = localStorage.getItem('admin_token');
    const response = await axios.post(`${API}/admin/users`, userData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getAdminUsers: async () => {
    const token = localStorage.getItem('admin_token');
    const response = await axios.get(`${API}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  deleteAdminUser: async (email) => {
    const token = localStorage.getItem('admin_token');
    const response = await axios.delete(`${API}/admin/users/${email}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

export default api;
