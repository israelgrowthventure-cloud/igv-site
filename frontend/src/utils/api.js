import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://igv-cms-backend.onrender.com';
const API = `${BACKEND_URL}/api`;

// Global axios defaults for fast responses
axios.defaults.timeout = 8000; // 8s default timeout

// Configure axios with retry logic (reduced retries for faster feedback)
axios.interceptors.response.use(
  response => response,
  async error => {
    const config = error.config;
    if (!config || !config.retry) {
      config.retry = 0;
    }
    
    // Only retry once for CRM endpoints (faster feedback)
    const maxRetries = config.url?.includes('/crm/') ? 1 : 2;
    if (config.retry >= maxRetries) {
      return Promise.reject(error);
    }
    
    config.retry += 1;
    const delay = 1000 * config.retry; // Reduced delay
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
  // IMPORTANT: Gemini API needs up to 60s for analysis generation
  sendMiniAnalysis: async (data) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://igv-cms-backend.onrender.com';
    const response = await axios.post(`${backendUrl}/api/mini-analysis`, data, {
      timeout: 60000 // 60 second timeout for Gemini AI analysis
    });
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
    const response = await axios.get(`${API}/crm/leads`, {
      headers: { Authorization: `Bearer ${token}` },
      params
    });
    return response.data;
  },

  getAdminContacts: async () => {
    const token = localStorage.getItem('admin_token');
    const response = await axios.get(`${API}/crm/contacts`, {
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
  },

  // CRM Complete API - with fast timeouts
  get: async (endpoint, config = {}) => {
    const token = localStorage.getItem('admin_token');
    const isCRM = endpoint.includes('/crm/');
    const response = await axios.get(`${BACKEND_URL}${endpoint}`, {
      ...config,
      timeout: isCRM ? 5000 : 8000, // 5s for CRM, 8s for others
      headers: { 
        Authorization: token ? `Bearer ${token}` : '',
        ...config.headers 
      }
    });
    return response.data;
  },

  post: async (endpoint, data, config = {}) => {
    const token = localStorage.getItem('admin_token');
    const response = await axios.post(`${BACKEND_URL}${endpoint}`, data, {
      ...config,
      timeout: config.timeout || 8000,
      headers: { 
        Authorization: token ? `Bearer ${token}` : '',
        ...config.headers 
      }
    });
    return response.data;
  },

  put: async (endpoint, data, config = {}) => {
    const token = localStorage.getItem('admin_token');
    const response = await axios.put(`${BACKEND_URL}${endpoint}`, data, {
      ...config,
      timeout: config.timeout || 8000,
      headers: { 
        Authorization: token ? `Bearer ${token}` : '',
        ...config.headers 
      }
    });
    return response.data;
  },

  delete: async (endpoint, config = {}) => {
    const token = localStorage.getItem('admin_token');
    const response = await axios.delete(`${BACKEND_URL}${endpoint}`, {
      ...config,
      timeout: config.timeout || 8000,
      headers: { 
        Authorization: token ? `Bearer ${token}` : '',
        ...config.headers 
      }
    });
    return response.data;
  },

  // ==========================================
  // CMS, Media Library & Password Recovery
  // ==========================================

  // Password Recovery
  forgotPassword: async (email) => {
    const response = await axios.post(`${API}/auth/forgot-password`, { email });
    return response.data;
  },

  resetPassword: async (token, email, newPassword) => {
    const response = await axios.post(`${API}/auth/reset-password`, {
      token,
      email,
      new_password: newPassword
    });
    return response.data;
  },

  verifyResetToken: async (email, token) => {
    const response = await axios.get(`${API}/auth/verify-reset-token`, {
      params: { email, token }
    });
    return response.data;
  },

  // CMS Content Management
  getPageContent: async (page, language = 'fr') => {
    const token = localStorage.getItem('admin_token');
    const response = await axios.get(`${API}/pages/${page}`, {
      params: { language },
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  updatePageContent: async (page, language, section, content, version = null) => {
    const token = localStorage.getItem('admin_token');
    const response = await axios.post(`${API}/pages/update`, {
      page,
      language,
      section,
      content,
      version
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  listPages: async () => {
    const token = localStorage.getItem('admin_token');
    const response = await axios.get(`${API}/pages/list`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getPageHistory: async (page, language = 'fr', limit = 10) => {
    const token = localStorage.getItem('admin_token');
    const response = await axios.get(`${API}/pages/${page}/history`, {
      params: { language, limit },
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Media Library
  listMedia: async (page = 1, limit = 20) => {
    const token = localStorage.getItem('admin_token');
    const response = await axios.get(`${API}/admin/media`, {
      params: { page, limit },
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  uploadMedia: async (file) => {
    const token = localStorage.getItem('admin_token');
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API}/admin/media/upload`, formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  deleteMedia: async (filename) => {
    const token = localStorage.getItem('admin_token');
    const response = await axios.delete(`${API}/admin/media/${filename}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

export default api;
