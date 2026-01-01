import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, Mail, Phone, Building, MapPin, Save, Trash2, 
  Loader2, Edit2, X, Tag, Calendar, User, TrendingUp, Plus
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';

const ContactDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showOppModal, setShowOppModal] = useState(false);
  const [oppForm, setOppForm] = useState({ name: '', value: '', probability: 50, stage: 'qualification' });
  const [opportunities, setOpportunities] = useState([]);

  const isRTL = i18n.language === 'he';

  useEffect(() => {
    fetchContact();
  }, [id]);

  const fetchContact = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/crm/contacts/${id}`);
      setContact(response);
      setEditData(response);
      // Load opportunities linked to this contact
      try {
        const oppsResponse = await api.get('/api/crm/opportunities');
        const allOpps = oppsResponse.opportunities || oppsResponse.data?.opportunities || [];
        setOpportunities(allOpps.filter(opp => opp.contact_id === id));
      } catch (e) {
        setOpportunities([]);
      }
    } catch (error) {
      console.error('Error fetching contact:', error);
      toast.error(t('admin.crm.errors.load_failed') || 'Failed to load contact');
      navigate('/admin/crm');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put(`/api/crm/contacts/${id}`, editData);
      toast.success(t('admin.crm.contacts.updated') || 'Contact updated successfully');
      setContact(editData);
      setEditing(false);
    } catch (error) {
      toast.error(t('admin.crm.errors.update_failed') || 'Failed to update contact');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSaving(true);
      await api.delete(`/api/crm/contacts/${id}`);
      toast.success(t('admin.crm.contacts.deleted') || 'Contact deleted successfully');
      navigate('/admin/crm');
    } catch (error) {
      toast.error(t('admin.crm.errors.delete_failed') || 'Failed to delete contact');
    } finally {
      setSaving(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCreateOpportunity = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.post('/api/crm/opportunities', {
        name: oppForm.name || `${contact.name} - Opportunity`,
        contact_id: id,
        value: parseFloat(oppForm.value) || 0,
        probability: parseInt(oppForm.probability) || 50,
        stage: oppForm.stage || 'qualification'
      });
      toast.success(t('admin.crm.opportunities.created') || 'Opportunity created');
      setShowOppModal(false);
      setOppForm({ name: '', value: '', probability: 50, stage: 'qualification' });
      fetchContact(); // Reload to get updated opportunities
    } catch (error) {
      toast.error(t('admin.crm.errors.create_failed') || 'Failed to create opportunity');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{t('admin.crm.contacts.not_found') || 'Contact not found'}</p>
          <button onClick={() => navigate('/admin/crm')} className="text-blue-600 hover:underline">
            {t('admin.crm.common.back') || 'Back to CRM'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{contact.name || contact.email} | IGV CRM</title>
        <html lang={i18n.language} dir={isRTL ? 'rtl' : 'ltr'} />
      </Helmet>

      <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
        {/* Header */}
        <header className="bg-white border-b shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/admin/crm')} 
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex-1">
                <h1 className="text-xl font-bold">{contact.name || contact.email}</h1>
                <p className="text-sm text-gray-600">{contact.company_name || t('admin.crm.contacts.no_company') || 'No company'}</p>
              </div>
              <div className="flex items-center gap-2">
                {!editing ? (
                  <>
                    <button 
                      onClick={() => setEditing(true)} 
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Edit2 className="w-4 h-4" />
                      {t('admin.crm.common.edit') || 'Edit'}
                    </button>
                    <button 
                      onClick={() => setShowDeleteConfirm(true)} 
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      {t('admin.crm.common.delete') || 'Delete'}
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={handleSave} 
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {t('admin.crm.common.save') || 'Save'}
                    </button>
                    <button 
                      onClick={() => { setEditing(false); setEditData(contact); }} 
                      className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      <X className="w-4 h-4" />
                      {t('admin.crm.common.cancel') || 'Cancel'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* Contact Info */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="font-semibold mb-4">{t('admin.crm.contacts.details.contact_info') || 'Contact Information'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">{t('admin.crm.contacts.columns.name') || 'Name'}</p>
                    {editing ? (
                      <input 
                        type="text" 
                        value={editData.name || ''} 
                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg mt-1"
                      />
                    ) : (
                      <p className="font-medium">{contact.name || '-'}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">{t('admin.crm.contacts.columns.email') || 'Email'}</p>
                    {editing ? (
                      <input 
                        type="email" 
                        value={editData.email || ''} 
                        onChange={(e) => setEditData({...editData, email: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg mt-1"
                      />
                    ) : (
                      <p className="font-medium">{contact.email}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">{t('admin.crm.contacts.columns.phone') || 'Phone'}</p>
                    {editing ? (
                      <input 
                        type="text" 
                        value={editData.phone || ''} 
                        onChange={(e) => setEditData({...editData, phone: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg mt-1"
                      />
                    ) : (
                      <p className="font-medium">{contact.phone || '-'}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">{t('admin.crm.contacts.columns.company') || 'Company'}</p>
                    {editing ? (
                      <input 
                        type="text" 
                        value={editData.company_name || ''} 
                        onChange={(e) => setEditData({...editData, company_name: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg mt-1"
                      />
                    ) : (
                      <p className="font-medium">{contact.company_name || '-'}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Tag className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">{t('admin.crm.contacts.details.position') || 'Position'}</p>
                    {editing ? (
                      <input 
                        type="text" 
                        value={editData.position || ''} 
                        onChange={(e) => setEditData({...editData, position: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg mt-1"
                      />
                    ) : (
                      <p className="font-medium">{contact.position || '-'}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">{t('admin.crm.contacts.details.location') || 'Location'}</p>
                    {editing ? (
                      <input 
                        type="text" 
                        value={editData.location || ''} 
                        onChange={(e) => setEditData({...editData, location: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg mt-1"
                      />
                    ) : (
                      <p className="font-medium">{contact.location || '-'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {(contact.tags && contact.tags.length > 0) || editing ? (
            <div className="bg-white rounded-lg shadow border p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5" />
                {t('admin.crm.contacts.details.tags') || 'Tags'}
              </h2>
              {editing ? (
                <input 
                  type="text" 
                  placeholder="Enter tags separated by commas"
                  value={(editData.tags || []).join(', ')} 
                  onChange={(e) => setEditData({...editData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {contact.tags?.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {/* Converted from Lead */}
          {contact.converted_from_lead_id && (
            <div className="bg-green-50 rounded-lg border border-green-200 p-6">
              <h2 className="font-semibold text-green-900 mb-2">{t('admin.crm.contacts.converted_from_lead') || 'Converted from Lead'}</h2>
              <p className="text-green-800">{t('admin.crm.contacts.lead_id') || 'Lead ID'}: {contact.converted_from_lead_id}</p>
            </div>
          )}

          {/* Opportunities Section */}
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {t('admin.crm.contacts.opportunities') || 'Opportunities'} ({opportunities.length})
              </h2>
              <button 
                onClick={() => setShowOppModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                {t('admin.crm.opportunities.new') || 'New Opportunity'}
              </button>
            </div>
            <div className="space-y-3">
              {opportunities.length > 0 ? opportunities.map((opp, idx) => (
                <div key={opp._id || idx} className="p-4 bg-gray-50 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-medium">{opp.name}</p>
                    <p className="text-sm text-gray-600">{opp.stage}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">€{(opp.value || 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{opp.probability}%</p>
                  </div>
                </div>
              )) : (
                <p className="text-gray-500 text-sm text-center py-4">{t('admin.crm.common.no_opportunities') || 'No opportunities yet'}</p>
              )}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {t('admin.crm.contacts.recent_activities') || 'Recent Activities'}
            </h2>
            <div className="space-y-3">
              {contact.activities && contact.activities.length > 0 ? contact.activities.slice(0, 10).map((activity, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium">{activity.type}</p>
                  <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(activity.created_at).toLocaleString()}</p>
                </div>
              )) : (
                <p className="text-gray-500 text-sm">{t('admin.crm.common.no_activities') || 'No activities yet'}</p>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-600">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="font-medium">{t('admin.crm.common.created') || 'Created'}</p>
                <p>{new Date(contact.created_at).toLocaleString()}</p>
              </div>
              {contact.updated_at && (
                <div>
                  <p className="font-medium">{t('admin.crm.common.updated') || 'Updated'}</p>
                  <p>{new Date(contact.updated_at).toLocaleString()}</p>
                </div>
              )}
              <div>
                <p className="font-medium">ID</p>
                <p className="font-mono text-xs">{contact.contact_id}</p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-2">{t('admin.crm.contacts.delete_confirm_title') || 'Delete Contact?'}</h3>
            <p className="text-gray-600 mb-4">
              {t('admin.crm.contacts.delete_confirm_message') || 'This action cannot be undone. Are you sure you want to delete this contact?'}
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowDeleteConfirm(false)} 
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                {t('admin.crm.common.cancel') || 'Cancel'}
              </button>
              <button 
                onClick={handleDelete} 
                disabled={saving}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t('admin.crm.common.delete') || 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Opportunity Modal */}
      {showOppModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">{t('admin.crm.opportunities.new') || 'New Opportunity'}</h3>
            <form onSubmit={handleCreateOpportunity} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">{t('admin.crm.opportunities.name') || 'Name'}</label>
                <input 
                  type="text" 
                  value={oppForm.name} 
                  onChange={(e) => setOppForm({...oppForm, name: e.target.value})}
                  placeholder={contact?.name || 'Opportunity name'}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">{t('admin.crm.opportunities.value') || 'Value (€)'}</label>
                <input 
                  type="number" 
                  value={oppForm.value} 
                  onChange={(e) => setOppForm({...oppForm, value: e.target.value})}
                  placeholder="10000"
                  min="0"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">{t('admin.crm.opportunities.probability') || 'Probability (%)'}</label>
                <input 
                  type="number" 
                  value={oppForm.probability} 
                  onChange={(e) => setOppForm({...oppForm, probability: e.target.value})}
                  min="0" max="100"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">{t('admin.crm.opportunities.stage') || 'Stage'}</label>
                <select 
                  value={oppForm.stage} 
                  onChange={(e) => setOppForm({...oppForm, stage: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="qualification">{t('admin.crm.opportunities.stages.qualification') || 'Qualification'}</option>
                  <option value="proposal">{t('admin.crm.opportunities.stages.proposal') || 'Proposal'}</option>
                  <option value="negotiation">{t('admin.crm.opportunities.stages.negotiation') || 'Negotiation'}</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button 
                  type="button"
                  onClick={() => setShowOppModal(false)} 
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  {t('admin.crm.common.cancel') || 'Cancel'}
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t('admin.crm.common.create') || 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ContactDetail;
