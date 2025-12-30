import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Download, Plus, Eye, X, Save, Loader2, Mail, Phone, Building, MapPin, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';

const LeadsTab = ({ data, selectedItem, setSelectedItem, onRefresh, searchTerm, setSearchTerm, filters, setFilters, t }) => {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [editingLead, setEditingLead] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [showNewLeadForm, setShowNewLeadForm] = useState(false);
  const [newLeadData, setNewLeadData] = useState({
    email: '',
    contact_name: '',
    brand_name: '',
    sector: '',
    phone: '',
    status: 'NEW',
    priority: 'C'
  });

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      setLoadingAction(true);
      await api.post('/api/crm/leads', newLeadData);
      toast.success(t('admin.crm.leads.created') || 'Lead created successfully');
      setShowNewLeadForm(false);
      setNewLeadData({
        email: '',
        contact_name: '',
        brand_name: '',
        sector: '',
        phone: '',
        status: 'NEW',
        priority: 'C'
      });
      await onRefresh();
    } catch (error) {
      toast.error(t('admin.crm.errors.create_failed') || 'Failed to create lead');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setLoadingAction(true);
      const response = await api.get('/api/crm/leads/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leads_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(t('admin.crm.leads.export_success') || 'Leads exported successfully');
    } catch (error) {
      toast.error(t('admin.crm.errors.export_failed') || 'Failed to export leads');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleAddNote = async (leadId) => {
    if (!noteText.trim()) return;
    try {
      setLoadingAction(true);
      await api.post(`/api/crm/leads/${leadId}/notes`, { note_text: noteText });
      setNoteText('');
      toast.success(t('admin.crm.leads.note_added') || 'Note added');
      await onRefresh();
    } catch (error) {
      toast.error(t('admin.crm.errors.note_failed') || 'Failed to add note');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleUpdateStatus = async (leadId, newStatus) => {
    try {
      setLoadingAction(true);
      await api.put(`/api/crm/leads/${leadId}`, { status: newStatus });
      toast.success(t('admin.crm.leads.status_updated') || 'Status updated');
      await onRefresh();
      setSelectedItem(null);
    } catch (error) {
      toast.error(t('admin.crm.errors.status_failed') || 'Failed to update status');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleConvertToContact = async (leadId) => {
    try {
      setLoadingAction(true);
      await api.post(`/api/crm/leads/${leadId}/convert`);
      toast.success(t('admin.crm.leads.converted') || 'Lead converted to contact');
      await onRefresh();
      setSelectedItem(null);
    } catch (error) {
      toast.error(t('admin.crm.errors.convert_failed') || 'Failed to convert lead');
    } finally {
      setLoadingAction(false);
    }
  };

  const statuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST', 'PENDING_QUOTA'];
  const priorities = ['A', 'B', 'C'];

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('admin.crm.leads.search') || 'Search leads...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            {t('admin.crm.common.filters') || 'Filters'}
          </button>
          <button onClick={handleExportCSV} disabled={loadingAction} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            <Download className="w-4 h-4" />
            {t('admin.crm.leads.export') || 'Export CSV'}
          </button>
          <button onClick={() => setShowNewLeadForm(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <Plus className="w-4 h-4" />
            {t('admin.crm.leads.new_lead') || 'New Lead'}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
            <select value={filters.status || ''} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="px-3 py-2 border rounded-lg">
              <option value="">{t('admin.crm.common.all_statuses') || 'All Statuses'}</option>
              {statuses.map(s => <option key={s} value={s}>{t(`admin.crm.statuses.${s}`) || s}</option>)}
            </select>
            <select value={filters.priority || ''} onChange={(e) => setFilters({ ...filters, priority: e.target.value })} className="px-3 py-2 border rounded-lg">
              <option value="">{t('admin.crm.common.all_priorities') || 'All Priorities'}</option>
              {priorities.map(p => <option key={p} value={p}>{t(`admin.crm.priorities.${p}`) || `Priority ${p}`}</option>)}
            </select>
            <input type="text" placeholder={t('admin.crm.leads.filter_sector') || 'Sector'} value={filters.sector || ''} onChange={(e) => setFilters({ ...filters, sector: e.target.value })} className="px-3 py-2 border rounded-lg" />
            <button onClick={() => setFilters({})} className="px-4 py-2 border rounded-lg hover:bg-gray-50">{t('admin.crm.common.reset') || 'Reset'}</button>
          </div>
        )}
      </div>

      {/* List or Detail View */}
      {showNewLeadForm ? (
        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{t('admin.crm.leads.new_lead') || 'New Lead'}</h2>
            <button onClick={() => setShowNewLeadForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleCreateLead} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('admin.crm.leads.columns.email') || 'Email'} *</label>
                <input
                  type="email"
                  required
                  value={newLeadData.email}
                  onChange={(e) => setNewLeadData({...newLeadData, email: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('admin.crm.leads.columns.name') || 'Name'}</label>
                <input
                  type="text"
                  value={newLeadData.contact_name}
                  onChange={(e) => setNewLeadData({...newLeadData, contact_name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('admin.crm.leads.columns.brand') || 'Brand'}</label>
                <input
                  type="text"
                  value={newLeadData.brand_name}
                  onChange={(e) => setNewLeadData({...newLeadData, brand_name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('admin.crm.leads.columns.sector') || 'Sector'}</label>
                <input
                  type="text"
                  value={newLeadData.sector}
                  onChange={(e) => setNewLeadData({...newLeadData, sector: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('admin.crm.leads.phone') || 'Phone'}</label>
                <input
                  type="text"
                  value={newLeadData.phone}
                  onChange={(e) => setNewLeadData({...newLeadData, phone: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('admin.crm.leads.columns.priority') || 'Priority'}</label>
                <select
                  value={newLeadData.priority}
                  onChange={(e) => setNewLeadData({...newLeadData, priority: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="A">{t('admin.crm.priorities.A') || 'Priority A (High)'}</option>
                  <option value="B">{t('admin.crm.priorities.B') || 'Priority B (Medium)'}</option>
                  <option value="C">{t('admin.crm.priorities.C') || 'Priority C (Low)'}</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loadingAction}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loadingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {t('admin.crm.common.save') || 'Save'}
              </button>
              <button
                type="button"
                onClick={() => setShowNewLeadForm(false)}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50"
              >
                {t('admin.crm.common.cancel') || 'Cancel'}
              </button>
            </div>
          </form>
        </div>
      ) : !selectedItem ? (
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">{t('admin.crm.leads.columns.name') || 'Name'}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">{t('admin.crm.leads.columns.email') || 'Email'}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">{t('admin.crm.leads.columns.brand') || 'Brand'}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">{t('admin.crm.leads.columns.sector') || 'Sector'}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">{t('admin.crm.leads.columns.status') || 'Status'}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">{t('admin.crm.leads.columns.priority') || 'Priority'}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">{t('admin.crm.leads.columns.created') || 'Created'}</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {data.leads?.length > 0 ? data.leads.map(lead => (
                <tr key={lead.lead_id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/admin/crm/leads/${lead.lead_id}`)}>
                  <td className="px-4 py-3">{lead.contact_name || '-'}</td>
                  <td className="px-4 py-3">{lead.email}</td>
                  <td className="px-4 py-3">{lead.brand_name || '-'}</td>
                  <td className="px-4 py-3">{lead.sector || '-'}</td>
                  <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs font-semibold ${lead.priority === 'A' ? 'bg-red-100 text-red-800' : lead.priority === 'B' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{lead.priority || 'C'}</span></td>
                  <td className="px-4 py-3 text-sm text-gray-600">{new Date(lead.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><ExternalLink className="w-4 h-4 text-blue-500" /></td>
                </tr>
              )) : (
                <tr><td colSpan="8" className="px-4 py-12 text-center">
                  <div className="text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">{t('admin.crm.leads.empty_title') || 'No leads yet'}</p>
                    <p className="text-sm mt-1">{t('admin.crm.leads.empty_subtitle') || 'Create your first lead to get started'}</p>
                    <button onClick={() => setShowNewLeadForm(true)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      {t('admin.crm.leads.new_lead') || 'New Lead'}
                    </button>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold">{selectedItem.contact_name || selectedItem.email}</h2>
              <p className="text-gray-600">{selectedItem.brand_name}</p>
            </div>
            <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-1" />
                <div><p className="text-sm text-gray-600">{t('admin.crm.leads.details.email') || 'Email'}</p><p className="font-medium">{selectedItem.email}</p></div>
              </div>
              {selectedItem.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-1" />
                  <div><p className="text-sm text-gray-600">{t('admin.crm.leads.details.phone') || 'Phone'}</p><p className="font-medium">{selectedItem.phone}</p></div>
                </div>
              )}
              {selectedItem.sector && (
                <div className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-gray-400 mt-1" />
                  <div><p className="text-sm text-gray-600">{t('admin.crm.leads.details.sector') || 'Sector'}</p><p className="font-medium">{selectedItem.sector}</p></div>
                </div>
              )}
              {selectedItem.target_city && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div><p className="text-sm text-gray-600">{t('admin.crm.leads.details.city') || 'Target City'}</p><p className="font-medium">{selectedItem.target_city}</p></div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">{t('admin.crm.leads.details.status') || 'Status'}</label>
                <select value={selectedItem.status} onChange={(e) => handleUpdateStatus(selectedItem.lead_id, e.target.value)} disabled={loadingAction} className="w-full mt-1 px-3 py-2 border rounded-lg">
                  {statuses.map(s => <option key={s} value={s}>{t(`admin.crm.statuses.${s}`) || s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600">{t('admin.crm.leads.details.priority') || 'Priority'}</label>
                <select value={selectedItem.priority || 'C'} className="w-full mt-1 px-3 py-2 border rounded-lg">
                  {priorities.map(p => <option key={p} value={p}>{t(`admin.crm.priorities.${p}`) || `Priority ${p}`}</option>)}
                </select>
              </div>
            </div>
          </div>

          {selectedItem.focus_notes && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-semibold text-blue-900">{t('admin.crm.leads.details.focus_notes') || 'Focus Notes'}</p>
              <p className="text-sm text-blue-800 mt-1">{selectedItem.focus_notes}</p>
            </div>
          )}

          <div className="mt-6 border-t pt-6">
            <h3 className="font-semibold mb-4">{t('admin.crm.leads.details.notes') || 'Notes'}</h3>
            <div className="space-y-3 mb-4">
              {selectedItem.notes?.map((note, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm">{note.note_text}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(note.created_at).toLocaleString()} • {note.created_by}</p>
                </div>
              )) || <p className="text-gray-500 text-sm">{t('admin.crm.common.no_notes') || 'No notes yet'}</p>}
            </div>
            <div className="flex gap-2">
              <input type="text" placeholder={t('admin.crm.leads.add_note_placeholder') || 'Add a note...'} value={noteText} onChange={(e) => setNoteText(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg" />
              <button onClick={() => handleAddNote(selectedItem.lead_id)} disabled={!noteText.trim() || loadingAction} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{loadingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : t('admin.crm.common.add') || 'Add'}</button>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button onClick={() => handleConvertToContact(selectedItem.lead_id)} disabled={loadingAction || selectedItem.status === 'CONVERTED'} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
              {t('admin.crm.leads.convert_to_contact') || 'Convert to Contact'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const colors = {
    NEW: 'bg-blue-100 text-blue-800',
    CONTACTED: 'bg-yellow-100 text-yellow-800',
    QUALIFIED: 'bg-purple-100 text-purple-800',
    CONVERTED: 'bg-green-100 text-green-800',
    LOST: 'bg-gray-100 text-gray-800',
    PENDING_QUOTA: 'bg-orange-100 text-orange-800'
  };
  return <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
};

export default LeadsTab;
