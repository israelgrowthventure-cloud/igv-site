import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

const API = `${API_BASE_URL}/api`;

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
  }
};

// Pages API for CMS
export const pagesAPI = {
  getAll: async (publishedOnly = false) => {
    const response = await axios.get(`${API}/pages`, { params: { published_only: publishedOnly } });
    return response;
  },
  getBySlug: async (slug) => {
    const response = await axios.get(`${API}/pages/${slug}`);
    return response;
  },
  create: async (data) => {
    const response = await axios.post(`${API}/pages`, data);
    return response;
  },
  update: async (slug, data) => {
    const response = await axios.put(`${API}/pages/${slug}`, data);
    return response;
  },
  delete: async (slug) => {
    const response = await axios.delete(`${API}/pages/${slug}`);
    return response;
  },
};

// Packs API
export const packsAPI = {
  getAll: async (activeOnly = false) => {
    const response = await axios.get(`${API}/packs`, { params: { active_only: activeOnly } });
    return response;
  },
  getById: async (id) => {
    const response = await axios.get(`${API}/packs/${id}`);
    return response;
  },
  create: async (data) => {
    const response = await axios.post(`${API}/packs`, data);
    return response;
  },
  update: async (id, data) => {
    const response = await axios.put(`${API}/packs/${id}`, data);
    return response;
  },
  delete: async (id) => {
    const response = await axios.delete(`${API}/packs/${id}`);
    return response;
  },
};

// Pricing API
export const pricingAPI = {
  getRules: async () => {
    const response = await axios.get(`${API}/pricing-rules`);
    return response;
  },
  createRule: async (data) => {
    const response = await axios.post(`${API}/pricing-rules`, data);
    return response;
  },
  updateRule: async (id, data) => {
    const response = await axios.put(`${API}/pricing-rules/${id}`, data);
    return response;
  },
  deleteRule: async (id) => {
    const response = await axios.delete(`${API}/pricing-rules/${id}`);
    return response;
  },
  calculatePrice: async (packId, zone) => {
    // Utiliser la route /api/pricing qui existe réellement dans le backend
    const response = await axios.get(`${API}/pricing`, { params: { packId, zone } });
    return response;
  },
};

// Translations API
export const translationsAPI = {
  getAll: async () => {
    const response = await axios.get(`${API}/translations`);
    return response;
  },
  update: async (data) => {
    const response = await axios.put(`${API}/translations`, data);
    return response;
  },
};

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await axios.post(`${API}/auth/login`, { email, password });
    return response;
  },
  logout: async () => {
    const response = await axios.post(`${API}/auth/logout`);
    return response;
  },
  checkAuth: async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return { data: { authenticated: false } };
    const response = await axios.get(`${API}/auth/check`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response;
  },
  changePassword: async (data) => {
    const token = localStorage.getItem('authToken');
    const response = await axios.post(`${API}/admin/change-password`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response;
  },
};

// Orders API
export const ordersAPI = {
  getAll: async () => {
    const response = await axios.get(`${API}/orders`);
    return response;
  },
  create: async (data) => {
    const response = await axios.post(`${API}/orders`, data);
    return response;
  },
  getById: async (id) => {
    const response = await axios.get(`${API}/orders/${id}`);
    return response;
  },
};

export default api;
