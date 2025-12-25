/**
 * CRM Sub-Components: Leads, Pipeline, Contacts, Settings
 * Extracted for better organization
 */

import React, { useState } from 'react';
import {
  Search, Filter, Download, Plus, Eye, Edit, Tag, Phone, Mail,
  MapPin, Building, Calendar, CheckCircle, XCircle, Loader2, Trash2,
  Shield, UserCheck, UserX, Target, DollarSign
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';

// ==========================================
// LEADS TAB
// ==========================================
export const LeadsTab = ({
  leads, selectedLead, setSelectedLead, onRefresh,
  searchTerm, setSearchTerm, statusFilter, setStatusFilter,
  stageFilter, setStageFilter, t, isRTL, user
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const result = await api.get('/crm/leads/export/csv');
      const blob = new Blob([result.csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `igv_leads_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      toast.success(t('admin.crm.leads.export_success'));
    } catch (error) {
      toast.error(t('admin.crm.leads.export_error'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleUpdateLead = async (leadId, updates) => {
    try {
      await api.put(`/crm/leads/${leadId}`, updates);
      toast.success(t('admin.crm.leads.update_success'));
      onRefresh();
    } catch (error) {
      toast.error(t('admin.crm.leads.update_error'));
    }
  };

  const handleAddNote = async (leadId, content) => {
    try {
      await api.post(`/crm/leads/${leadId}/notes`, { content });
      toast.success(t('admin.crm.leads.note_added'));
      onRefresh();
    } catch (error) {
      toast.error(t('admin.crm.leads.note_error'));
    }
  };

  const handleConvertToContact = async (leadId) => {
    if (!window.confirm(t('admin.crm.leads.confirm_convert'))) return;

    try {
      await api.post(`/crm/leads/${leadId}/convert-to-contact`);
      toast.success(t('admin.crm.leads.convert_success'));
      onRefresh();
      setSelectedLead(null);
    } catch (error) {
      toast.error(t('admin.crm.leads.convert_error'));
    }
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      NEW: 'bg-blue-100 text-blue-800',
      CONTACTED: 'bg-yellow-100 text-yellow-800',
      QUALIFIED: 'bg-green-100 text-green-800',
      PENDING_QUOTA: 'bg-orange-100 text-orange-800',
      CONVERTED: 'bg-purple-100 text-purple-800',
      LOST: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.NEW}`}>
        {t(`admin.crm.status.${status.toLowerCase()}`)}
      </span>
    );
  };

  if (selectedLead) {
    return <LeadDetails
      lead={selectedLead}
      onClose={() => setSelectedLead(null)}
      onUpdate={handleUpdateLead}
      onAddNote={handleAddNote}
      onConvert={handleConvertToContact}
      t={t}
      isRTL={isRTL}
    />;
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('admin.crm.leads.search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onRefresh()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            {t('admin.crm.leads.filters')}
          </button>

          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {t('admin.crm.leads.export')}
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('admin.crm.leads.filter_status')}</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">{t('admin.crm.leads.all_statuses')}</option>
                <option value="NEW">NEW</option>
                <option value="CONTACTED">CONTACTED</option>
                <option value="QUALIFIED">QUALIFIED</option>
                <option value="PENDING_QUOTA">PENDING_QUOTA</option>
                <option value="CONVERTED">CONVERTED</option>
                <option value="LOST">LOST</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('admin.crm.leads.filter_stage')}</label>
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">{t('admin.crm.leads.all_stages')}</option>
                <option value="analysis_requested">Analysis Requested</option>
                <option value="analysis_sent">Analysis Sent</option>
                <option value="call_scheduled">Call Scheduled</option>
                <option value="qualification">Qualification</option>
                <option value="proposal_sent">Proposal Sent</option>
                <option value="negotiation">Negotiation</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={onRefresh}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {t('admin.crm.leads.apply_filters')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.crm.leads.col_brand')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.crm.leads.col_email')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.crm.leads.col_sector')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.crm.leads.col_status')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.crm.leads.col_created')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.crm.leads.col_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    {t('admin.crm.leads.no_leads')}
                  </td>
                </tr>
              ) : (
                leads.map(lead => (
                  <tr key={lead._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedLead(lead)}>
                    <td className="px-6 py-4 font-medium text-gray-900">{lead.brand_name}</td>
                    <td className="px-6 py-4 text-gray-700">{lead.email}</td>
                    <td className="px-6 py-4 text-gray-700">{lead.sector || '-'}</td>
                    <td className="px-6 py-4"><StatusBadge status={lead.status} /></td>
                    <td className="px-6 py-4 text-gray-700 text-sm">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLead(lead);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Lead Details Component
const LeadDetails = ({ lead, onClose, onUpdate, onAddNote, onConvert, t, isRTL }) => {
  const [noteContent, setNoteContent] = useState('');
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState(lead.status);

  const handleSaveStatus = () => {
    onUpdate(lead._id, { status: newStatus });
    setIsEditingStatus(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{lead.brand_name}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h3 className="font-semibold text-lg">{t('admin.crm.leads.info')}</h3>
          <div className="space-y-2">
            <p><strong>{t('admin.crm.leads.email')}:</strong> {lead.email}</p>
            <p><strong>{t('admin.crm.leads.phone')}:</strong> {lead.phone || '-'}</p>
            <p><strong>{t('admin.crm.leads.sector')}:</strong> {lead.sector || '-'}</p>
            <p><strong>{t('admin.crm.leads.language')}:</strong> {lead.language?.toUpperCase()}</p>
            <p><strong>{t('admin.crm.leads.created')}:</strong> {new Date(lead.created_at).toLocaleString()}</p>

            <div className="pt-4">
              <label className="block text-sm font-medium mb-2">{t('admin.crm.leads.status')}</label>
              {isEditingStatus ? (
                <div className="flex gap-2">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded"
                  >
                    <option value="NEW">NEW</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="QUALIFIED">QUALIFIED</option>
                    <option value="PENDING_QUOTA">PENDING_QUOTA</option>
                    <option value="CONVERTED">CONVERTED</option>
                    <option value="LOST">LOST</option>
                  </select>
                  <button onClick={handleSaveStatus} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
                  <button onClick={() => setIsEditingStatus(false)} className="px-4 py-2 border rounded">Cancel</button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded">{lead.status}</span>
                  <button onClick={() => setIsEditingStatus(true)} className="text-blue-600 hover:underline">Edit</button>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => onConvert(lead._id)}
            className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            {t('admin.crm.leads.convert_to_contact')}
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h3 className="font-semibold text-lg">{t('admin.crm.leads.add_note')}</h3>
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder={t('admin.crm.leads.note_placeholder')}
            className="w-full px-3 py-2 border rounded-lg"
            rows="4"
          />
          <button
            onClick={() => {
              if (noteContent.trim()) {
                onAddNote(lead._id, noteContent);
                setNoteContent('');
              }
            }}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t('admin.crm.leads.save_note')}
          </button>

          <div className="pt-4">
            <h4 className="font-semibold mb-2">{t('admin.crm.leads.activities')}</h4>
            <div className="space-y-2">
              {lead.activities?.map((activity, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded text-sm">
                  <p className="font-medium">{activity.subject}</p>
                  <p className="text-gray-600">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(activity.created_at).toLocaleString()}</p>
                </div>
              )) || <p className="text-gray-500">{t('admin.crm.leads.no_activities')}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Continue with PipelineTab, ContactsTab, SettingsTab in separate file for space
