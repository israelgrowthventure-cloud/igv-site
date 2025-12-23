import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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
  }
};

export default api;
