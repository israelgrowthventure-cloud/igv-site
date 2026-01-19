import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Download, Plus, Eye, X, Save, Loader2, Mail, Phone, Building, MapPin, ExternalLink, Users, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';
import { SkeletonTable } from './Skeleton';
import EmailModal from './EmailModal';
import { useTranslation } from 'react-i18next';

const LeadsTab = ({ data, loading, selectedItem, setSelectedItem, onRefresh, searchTerm, setSearchTerm, filters, setFilters, t }) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [editingLead, setEditingLead] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [showNewLeadForm, setShowNewLeadForm] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
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
      toast.success(t('admin.crm.leads.created'));
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
      toast.error(t('admin.crm.errors.create_failed'));
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
      toast.success(t('admin.crm.leads.export_success'));
    } catch (error) {
      toast.error(t('admin.crm.errors.export_failed'));
    } finally {
      setLoadingAction(false);
    }
  };

  const handleAddNote = async (leadId) => {
    console.log('[DEBUG handleAddNote] Called with leadId:', leadId);
    console.log('[DEBUG handleAddNote] selectedItem:', JSON.stringify(selectedItem));
    console.log('[DEBUG handleAddNote] noteText:', noteText);
    if (!noteText.trim()) {
      console.log('[DEBUG handleAddNote] Empty noteText, returning early');
      return;
    }
    try {
      console.log('[DEBUG handleAddNote] Calling API POST /notes with leadId:', leadId);
      setLoadingAction(true);
      await api.post(`/api/crm/leads/${leadId}/notes`, { note_text: noteText });
      console.log('[DEBUG handleAddNote] API call successful');
      setNoteText('');
      toast.success(t('admin.crm.leads.note_added'));
      await onRefresh();
    } catch (error) {
      console.error('[DEBUG handleAddNote] API call failed:', error);
      toast.error(t('admin.crm.errors.note_failed'));
    } finally {
      setLoadingAction(false);
    }
  };

  const handleUpdateStatus = async (leadId, newStatus) => {
    try {
      setLoadingAction(true);
      await api.put(`/api/crm/leads/${leadId}`, { status: newStatus });
      toast.success(t('admin.crm.leads.status_updated'));
      await onRefresh();
      setSelectedItem(null);
    } catch (error) {
      toast.error(t('admin.crm.errors.status_failed'));
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCreateOpportunity = async (leadId) => {
    try {
      setLoadingAction(true);
      const response = await api.post('/api/crm/opportunities', {
        lead_id: leadId,
        name: `Opportunité - ${selectedItem.brand_name || selectedItem.contact_name}`,
        stage: 'qualification',
        estimated_value: 0,
        probability: 25,
        description: `Opportunité créée depuis le lead ${leadId}`,
        expected_close_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0] // +30 jours
      });
      
      toast.success('Opportunité créée avec succès !', {
        duration: 5000,
        action: {
          label: "Voir l'opportunité",
          onClick: () => {
            // Use navigate for proper routing instead of window.location.hash
            navigate('/admin/crm?tab=opportunities');
          }
        }
      });
      
      await onRefresh();
    } catch (error) {
      console.error('Create opportunity error:', error);
      toast.error('Erreur lors de la création de l\'opportunité');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteLead = async (leadId) => {
    if (!window.confirm(t('admin.crm.common.confirm_delete'))) {
      return;
    }
    try {
      setLoadingAction(true);
      await api.delete(`/api/crm/leads/${leadId}`);
      toast.success(t('admin.crm.leads.deleted') || 'Prospect supprimé');
      setSelectedItem(null);
      await onRefresh();
    } catch (error) {
      console.error('Delete lead error:', error);
      toast.error(t('admin.crm.errors.delete_failed') || 'Erreur lors de la suppression');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleConvertToContact = async (leadId) => {
    // Demander confirmation avant conversion
    if (!window.confirm('Êtes-vous sûr de vouloir convertir ce prospect en contact ? Cette action est irréversible.')) {
      return;
    }
    try {
      setLoadingAction(true);
      const response = await api.post(`/api/crm/leads/${leadId}/convert-to-contact`);
      toast.success('Prospect converti en contact avec succès');
      
      // Afficher le contact créé avec un lien direct
      if (response.contact_id) {
        toast.success(`Contact créé avec succès !`, {
          duration: 5000,
          action: {
            label: "Voir le contact",
            onClick: () => {
              // Use navigate for proper routing instead of window.location.hash
              navigate(`/admin/crm/contacts/${response.contact_id}`);
            }
          }
        });
      }
      
      await onRefresh();
      setSelectedItem(null);
    } catch (error) {
      console.error('Convert error:', error);
      // Message d'erreur plus détaillé
      const errorMsg = error?.response?.data?.detail || error?.message || '';
      if (errorMsg.includes('already converted')) {
        toast.error('Ce prospect a déjà été converti en contact');
      } else if (errorMsg.includes('not found')) {
        toast.error('Prospect introuvable');
      } else if (errorMsg.includes('at least email, name')) {
        toast.error('Ce prospect manque d\'informations obligatoires (email ou nom) pour être converti');
      } else {
        toast.error('Erreur lors de la conversion du prospect');
      }
    } finally {
      setLoadingAction(false);
    }
  };

  const statuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST', 'PENDING_QUOTA'];
  const priorities = ['A', 'B', 'C'];

  // Defensive: ensure data exists
  const leads = data?.leads || [];
  const total = data?.total || 0;

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
                placeholder={t('admin.crm.leads.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            {t('admin.crm.common.filters')}
          </button>
          <button onClick={handleExportCSV} disabled={loadingAction} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            <Download className="w-4 h-4" />
            {t('admin.crm.leads.export')}
          </button>
          <button onClick={() => setShowNewLeadForm(true)} data-testid="btn-new-prospect" className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <Plus className="w-4 h-4" />
            {t('admin.crm.leads.new_lead')}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
            <select value={filters.status || ''} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="px-3 py-2 border rounded-lg">
              <option value="">{t('admin.crm.common.all_statuses')}</option>
              {statuses.map(s => <option key={s} value={s}>{t(`admin.crm.statuses.${s}`)}</option>)}
            </select>
            <select value={filters.priority || ''} onChange={(e) => setFilters({ ...filters, priority: e.target.value })} className="px-3 py-2 border rounded-lg">
              <option value="">{t('admin.crm.common.all_priorities')}</option>
              {priorities.map(p => <option key={p} value={p}>{t(`admin.crm.priorities.${p}`)}</option>)}
            </select>
            <input type="text" placeholder={t('admin.crm.leads.filter_sector')} value={filters.sector || ''} onChange={(e) => setFilters({ ...filters, sector: e.target.value })} className="px-3 py-2 border rounded-lg" />
            <button onClick={() => setFilters({})} className="px-4 py-2 border rounded-lg hover:bg-gray-50">{t('admin.crm.common.reset')}</button>
          </div>
        )}
      </div>

      {/* List or Detail View */}
      {showNewLeadForm ? (
        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{t('admin.crm.leads.new_lead')}</h2>
            <button onClick={() => setShowNewLeadForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleCreateLead} className="space-y-4" data-testid="form-new-prospect">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('admin.crm.leads.columns.email')} *</label>
                <input
                  type="email"
                  required
                  data-testid="input-prospect-email"
                  value={newLeadData.email}
                  onChange={(e) => setNewLeadData({...newLeadData, email: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('admin.crm.leads.columns.name')}</label>
                <input
                  type="text"
                  data-testid="input-prospect-name"
                  value={newLeadData.contact_name}
                  onChange={(e) => setNewLeadData({...newLeadData, contact_name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('admin.crm.leads.columns.brand')}</label>
                <input
                  type="text"
                  data-testid="input-prospect-brand"
                  value={newLeadData.brand_name}
                  onChange={(e) => setNewLeadData({...newLeadData, brand_name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('admin.crm.leads.columns.sector')}</label>
                <input
                  type="text"
                  value={newLeadData.sector}
                  onChange={(e) => setNewLeadData({...newLeadData, sector: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('admin.crm.leads.phone')}</label>
                <input
                  type="text"
                  value={newLeadData.phone}
                  onChange={(e) => setNewLeadData({...newLeadData, phone: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('admin.crm.leads.columns.priority')}</label>
                <select
                  value={newLeadData.priority}
                  onChange={(e) => setNewLeadData({...newLeadData, priority: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="A">{t('admin.crm.priorities.A')}</option>
                  <option value="B">{t('admin.crm.priorities.B')}</option>
                  <option value="C">{t('admin.crm.priorities.C')}</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loadingAction}
                data-testid="btn-save-prospect"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loadingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {t('admin.crm.common.save')}
              </button>
              <button
                type="button"
                onClick={() => setShowNewLeadForm(false)}
                data-testid="btn-cancel-prospect"
                className="px-6 py-2 border rounded-lg hover:bg-gray-50"
              >
                {t('admin.crm.common.cancel')}
              </button>
            </div>
          </form>
        </div>
      ) : loading ? (
        <SkeletonTable rows={8} columns={8} />
      ) : !selectedItem ? (
        <div className="bg-white rounded-lg shadow border overflow-hidden" data-testid="prospects-list">
          <table className="w-full" data-testid="prospects-table">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">{t('admin.crm.leads.columns.name')}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">{t('admin.crm.leads.columns.email')}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">{t('admin.crm.leads.columns.brand')}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">{t('admin.crm.leads.columns.sector')}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">{t('admin.crm.leads.columns.status')}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">{t('admin.crm.leads.columns.priority')}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">{t('admin.crm.leads.columns.created')}</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {leads.length > 0 ? leads.map(lead => (
                <tr key={lead.lead_id} data-testid={`prospect-row-${lead.lead_id}`} data-prospect-name={lead.contact_name || lead.email} className={`border-b hover:bg-gray-50 cursor-pointer ${lead.status === 'CONVERTED' ? 'bg-green-50' : ''}`} onClick={() => setSelectedItem(lead)}>
                  <td className="px-4 py-3" data-testid="prospect-name">
                    <div className="flex items-center gap-2">
                      {lead.contact_name || '-'}
                      {lead.status === 'CONVERTED' && (
                        <Users className="w-4 h-4 text-green-600" title="Converti en contact" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3" data-testid="prospect-email">{lead.email}</td>
                  <td className="px-4 py-3">{lead.brand_name || '-'}</td>
                  <td className="px-4 py-3">{lead.sector || '-'}</td>
                  <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs font-semibold ${lead.priority === 'A' ? 'bg-red-100 text-red-800' : lead.priority === 'B' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{lead.priority || 'C'}</span></td>
                  <td className="px-4 py-3 text-sm text-gray-600">{new Date(lead.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-blue-500" />
                      {lead.status === 'CONVERTED' && lead.converted_to_contact_id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Use navigate for proper routing instead of window.location.hash
                            navigate(`/admin/crm/contacts/${lead.converted_to_contact_id}`);
                          }}
                          className="text-green-600 hover:text-green-800"
                          title="Voir le contact créé"
                        >
                          <Users className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="8" className="px-4 py-12 text-center">
                  <div className="text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">{t('admin.crm.leads.empty_title')}</p>
                    <p className="text-sm mt-1">{t('admin.crm.leads.empty_subtitle')}</p>
                    <button onClick={() => setShowNewLeadForm(true)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      {t('admin.crm.leads.new_lead')}
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
              <button 
                onClick={() => setSelectedItem(null)} 
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-2 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('admin.crm.common.back_to_list', 'Retour à la liste')}
              </button>
              <h2 className="text-2xl font-bold">
                {selectedItem.contact_name || selectedItem.name || selectedItem.brand_name || selectedItem.email}
              </h2>
              {selectedItem.brand_name && (
                <p className="text-gray-600">{selectedItem.brand_name}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">{selectedItem.email}</p>
              {selectedItem.phone && (
                <p className="text-sm text-gray-500">{selectedItem.phone}</p>
              )}
            </div>
            <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-gray-100 rounded-lg" title="Fermer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-1" />
                <div><p className="text-sm text-gray-600">{t('admin.crm.leads.details.email')}</p><p className="font-medium">{selectedItem.email}</p></div>
              </div>
              {selectedItem.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-1" />
                  <div><p className="text-sm text-gray-600">{t('admin.crm.leads.details.phone')}</p><p className="font-medium">{selectedItem.phone}</p></div>
                </div>
              )}
              {selectedItem.sector && (
                <div className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-gray-400 mt-1" />
                  <div><p className="text-sm text-gray-600">{t('admin.crm.leads.details.sector')}</p><p className="font-medium">{selectedItem.sector}</p></div>
                </div>
              )}
              {selectedItem.target_city && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div><p className="text-sm text-gray-600">{t('admin.crm.leads.details.city')}</p><p className="font-medium">{selectedItem.target_city}</p></div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">{t('admin.crm.leads.details.status')}</label>
                <select value={selectedItem.status} onChange={(e) => handleUpdateStatus(selectedItem.lead_id, e.target.value)} disabled={loadingAction} className="w-full mt-1 px-3 py-2 border rounded-lg">
                  {statuses.map(s => <option key={s} value={s}>{t(`admin.crm.statuses.${s}`) || s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600">{t('admin.crm.leads.details.priority')}</label>
                <select value={selectedItem.priority || 'C'} className="w-full mt-1 px-3 py-2 border rounded-lg">
                  {priorities.map(p => <option key={p} value={p}>{t(`admin.crm.priorities.${p}`) || `Priority ${p}`}</option>)}
                </select>
              </div>
            </div>
          </div>

          {selectedItem.focus_notes && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-semibold text-blue-900">{t('admin.crm.leads.details.focus_notes')}</p>
              <p className="text-sm text-blue-800 mt-1">{selectedItem.focus_notes}</p>
            </div>
          )}

          {/* Mini-Analysis Display Section */}
          {selectedItem.analysis && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">{t('admin.crm.leads.mini_analysis', 'Mini-Analyse de Marché')}</h3>
              </div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap bg-white p-3 rounded border">
                {selectedItem.analysis}
              </div>
              {selectedItem.analysis_language && (
                <p className="text-xs text-blue-600 mt-2">
                  {t('admin.crm.leads.analysis_language', 'Langue')}: {selectedItem.analysis_language.toUpperCase()}
                </p>
              )}
              {selectedItem.analysis_date && (
                <p className="text-xs text-gray-500 mt-1">
                  {t('admin.crm.leads.analysis_date', 'Généré le')}: {new Date(selectedItem.analysis_date).toLocaleString()}
                </p>
              )}
            </div>
          )}

          <div className="mt-6 border-t pt-6">
            <h3 className="font-semibold mb-4">{t('admin.crm.leads.details.notes')}</h3>
            <div className="space-y-3 mb-4">
              {selectedItem.notes && selectedItem.notes.length > 0 ? (
                selectedItem.notes.map((note, idx) => (
                  <div key={note.id || idx} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">{note.content || note.note_text || note.details || ''}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {note.created_at ? new Date(note.created_at).toLocaleString() : ''}
                      {note.created_by ? ` • ${note.created_by}` : ''}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">{t('admin.crm.common.no_notes', 'Aucune note')}</p>
              )}
            </div>
            <div className="flex gap-2">
              <input type="text" placeholder={t('admin.crm.leads.add_note_placeholder')} value={noteText} onChange={(e) => setNoteText(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg" />
              <button onClick={() => handleAddNote(selectedItem.lead_id)} disabled={!noteText.trim() || loadingAction} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{loadingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : t('admin.crm.common.add')}</button>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            {selectedItem.status === 'CONVERTED' ? (
              <div className="flex items-center gap-2 px-6 py-2 bg-green-100 text-green-800 rounded-lg">
                <Users className="w-4 h-4" />
                <span className="font-medium">Lead déjà converti en contact</span>
                {selectedItem.converted_to_contact_id && (
                  <button
                    onClick={() => {
                      // Use navigate for proper routing instead of window.location.hash
                      navigate(`/admin/crm/contacts/${selectedItem.converted_to_contact_id}`);
                    }}
                    className="ml-2 text-green-700 hover:text-green-900 underline text-sm"
                  >
                    Voir le contact
                  </button>
                )}
              </div>
            ) : (
              <button 
                onClick={() => handleConvertToContact(selectedItem.lead_id)} 
                disabled={loadingAction} 
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {loadingAction ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Conversion...</span>
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    <span>{t('admin.crm.leads.convert_to_contact')}</span>
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={() => handleCreateOpportunity(selectedItem.lead_id)}
              disabled={loadingAction}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{t('admin.crm.leads.create_opportunity')}</span>
            </button>
            
            <button
              onClick={() => setShowEmailModal(true)}
              disabled={!selectedItem.email}
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>{t('admin.crm.emails.compose', 'Envoyer Email')}</span>
            </button>
            
            <button
              onClick={() => handleDeleteLead(selectedItem.lead_id)}
              disabled={loadingAction}
              className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors ml-auto"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t('admin.crm.common.delete', 'Supprimer')}</span>
            </button>
          </div>
        </div>
      )}
      
      {showEmailModal && selectedItem && (
        <EmailModal 
          contact={{ 
            _id: selectedItem.lead_id, 
            name: selectedItem.contact_name, 
            email: selectedItem.email 
          }} 
          onClose={() => setShowEmailModal(false)} 
          t={t}
          language={i18n.language}
        />
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
