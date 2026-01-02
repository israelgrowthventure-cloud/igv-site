/**
 * CRM API Client - Centralized endpoint definitions
 * All CRM routes use /api/crm prefix (backend source of truth)
 */

import api from './api';

const CRM_PREFIX = '/api/crm';

export const crmApi = {
  // ==========================================
  // DASHBOARD
  // ==========================================
  getDashboardStats: () => api.get(`${CRM_PREFIX}/dashboard/stats`),

  // ==========================================
  // LEADS
  // ==========================================
  getLeads: (params = {}) => api.get(`${CRM_PREFIX}/leads`, { params }),
  getLead: (id) => api.get(`${CRM_PREFIX}/leads/${id}`),
  createLead: (data) => api.post(`${CRM_PREFIX}/leads`, data),
  updateLead: (id, data) => api.put(`${CRM_PREFIX}/leads/${id}`, data),
  deleteLead: (id) => api.delete(`${CRM_PREFIX}/leads/${id}`),
  addLeadNote: (id, noteData) => api.post(`${CRM_PREFIX}/leads/${id}/notes`, noteData),
  convertLeadToContact: (id) => api.post(`${CRM_PREFIX}/leads/${id}/convert-to-contact`),
  exportLeads: () => api.get(`${CRM_PREFIX}/leads/export/csv`, { responseType: 'blob' }),

  // ==========================================
  // CONTACTS
  // ==========================================
  getContacts: (params = {}) => api.get(`${CRM_PREFIX}/contacts`, { params }),
  getContact: (id) => api.get(`${CRM_PREFIX}/contacts/${id}`),
  createContact: (data) => api.post(`${CRM_PREFIX}/contacts`, data),
  updateContact: (id, data) => api.put(`${CRM_PREFIX}/contacts/${id}`, data),
  deleteContact: (id) => api.delete(`${CRM_PREFIX}/contacts/${id}`),

  // ==========================================
  // OPPORTUNITIES
  // ==========================================
  getOpportunities: (params = {}) => api.get(`${CRM_PREFIX}/opportunities`, { params }),
  getOpportunity: (id) => api.get(`${CRM_PREFIX}/opportunities/${id}`),
  createOpportunity: (data) => api.post(`${CRM_PREFIX}/opportunities`, data),
  updateOpportunity: (id, data) => api.put(`${CRM_PREFIX}/opportunities/${id}`, data),
  deleteOpportunity: (id) => api.delete(`${CRM_PREFIX}/opportunities/${id}`),

  // ==========================================
  // PIPELINE
  // ==========================================
  getPipeline: () => api.get(`${CRM_PREFIX}/pipeline`),
  updateOpportunityStage: (oppId, data) => api.put(`${CRM_PREFIX}/pipeline/opportunities/${oppId}`, data),

  // ==========================================
  // SETTINGS
  // ==========================================
  getUsers: () => api.get(`${CRM_PREFIX}/settings/users`),
  createUser: (data) => api.post(`${CRM_PREFIX}/settings/users`, data),
  updateUser: (userId, data) => api.put(`${CRM_PREFIX}/settings/users/${userId}`, data),
  deleteUser: (userId) => api.delete(`${CRM_PREFIX}/settings/users/${userId}`),
  changePassword: (data) => api.post(`${CRM_PREFIX}/settings/users/change-password`, data),

  getTags: () => api.get(`${CRM_PREFIX}/settings/tags`),
  createTag: (data) => api.post(`${CRM_PREFIX}/settings/tags`, data),
  deleteTag: (tagId) => api.delete(`${CRM_PREFIX}/settings/tags/${tagId}`),

  getPipelineStages: () => api.get(`${CRM_PREFIX}/settings/pipeline-stages`),

  // ==========================================
  // TASKS
  // ==========================================
  getTasks: (params = {}) => api.get(`${CRM_PREFIX}/tasks`, { params }),
  getTask: (id) => api.get(`${CRM_PREFIX}/tasks/${id}`),
  createTask: (data) => api.post(`${CRM_PREFIX}/tasks`, data),
  updateTask: (id, data) => api.put(`${CRM_PREFIX}/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`${CRM_PREFIX}/tasks/${id}`),

  // ==========================================
  // EMAILS
  // ==========================================
  sendEmail: (data) => api.post(`${CRM_PREFIX}/emails/send`, data),
  getEmailHistory: (params = {}) => api.get(`${CRM_PREFIX}/emails/history`, { params }),

  // ==========================================
  // ADMIN REQUESTS (Mini-analysis + Pack Rappel)
  // ==========================================
  getMiniAnalysisRequests: (params = {}) => api.get(`${CRM_PREFIX}/mini-analysis-requests`, { params }),
  validateMiniAnalysisRequest: (id) => api.post(`${CRM_PREFIX}/mini-analysis-requests/${id}/validate`),
  
  getPackRappelRequests: (params = {}) => api.get(`${CRM_PREFIX}/pack-rappel-requests`, { params }),
  assignPackRappel: (id, data) => api.put(`${CRM_PREFIX}/pack-rappel-requests/${id}/assign`, data),
};

export default crmApi;
