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

export default api;
