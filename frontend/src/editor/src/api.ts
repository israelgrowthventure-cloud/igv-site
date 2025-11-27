import axios from 'axios';
import { Page, User } from './types';

// PRODUCTION: Utilise le backend CMS Render
// Les variables d'environnement sont définies dans Render Dashboard
const API_URL = import.meta.env.VITE_CMS_BACKEND_URL || 'https://igv-cms-backend.onrender.com';

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (user: User) => api.post('/auth/login', user),
  register: (user: User) => api.post('/auth/register', user),
};

export const pagesAPI = {
  getAll: () => api.get<Page[]>('/pages'),
  getBySlug: (slug: string) => api.get<Page>(`/pages/${slug}`),
  create: (page: Omit<Page, 'id' | 'created_at' | 'updated_at'>) => api.post<Page>('/pages', page),
  update: (id: number, page: Partial<Omit<Page, 'id' | 'created_at' | 'updated_at'>>) => api.put<Page>(`/pages/${id}`, page),
  delete: (id: number) => api.delete(`/pages/${id}`),
};

export default api;