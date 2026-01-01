import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Mail, Phone, Building, MapPin, X, Loader2, Plus, Users, Edit, Trash2, Save, Send } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';
import { SkeletonTable } from './Skeleton';
import EmailModal from './EmailModal';
import { useTranslation } from 'react-i18next';

const ContactsTab = ({ data, loading, selectedItem, setSelectedItem, onRefresh, searchTerm, setSearchTerm, t }) => {
  const { i18n } = useTranslation();
  const [loadingAction, setLoadingAction] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailContact, setEmailContact] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', position: '', language: 'fr' });
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setLoadingAction(true);
      await api.post('/api/crm/contacts', formData);
      toast.success(t('admin.crm.contacts.created'));
      setShowCreateModal(false);
      setFormData({ name: '', email: '', phone: '', position: '', language: 'fr' });
      await onRefresh();
    } catch (error) {
      toast.error(t('admin.crm.errors.create_failed'));
    } finally {
      setLoadingAction(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      setLoadingAction(true);
      await api.put(`/api/crm/contacts/${editingContact._id || editingContact.contact_id}`, formData);
      toast.success(t('admin.crm.contacts.updated'));
      setShowEditModal(false);
      setEditingContact(null);
      setFormData({ name: '', email: '', phone: '', position: '', language: 'fr' });
      await onRefresh();
    } catch (error) {
      toast.error(t('admin.crm.errors.update_failed'));
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDelete = async (contactId) => {
    if (!window.confirm(t('admin.crm.common.confirm_delete'))) return;
    try {
      setLoadingAction(true);
      await api.delete(`/api/crm/contacts/${contactId}`);
      toast.success(t('admin.crm.contacts.deleted'));
      await onRefresh();
    } catch (error) {
      toast.error(t('admin.crm.errors.delete_failed'));
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCreateOpportunity = async (contactId) => {
    try {
      setLoadingAction(true);
      const contact = selectedItem;
      const response = await api.post('/api/crm/opportunities', {
        contact_id: contactId,
        name: `Opportunité - ${contact.name || contact.email}`,
        stage: 'qualification',
        value: 0,
        probability: 25,
        expected_close_date: new Date(Date.now() + 30*24*60*60*1000).toISOString()
      });
      
      toast.success(t('admin.crm.opportunities.created'), {
        duration: 5000,
        action: {
          label: t('admin.crm.common.view'),
          onClick: () => {
            window.location.hash = '#opportunities';
          }
        }
      });
      await onRefresh();
    } catch (error) {
      toast.error(t('admin.crm.errors.create_failed'));
    } finally {
      setLoadingAction(false);
    }
  };

  const openEditModal = (contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      position: contact.position || '',
      language: contact.language || 'fr'
    });
    setShowEditModal(true);
  };

  const ContactModal = ({ isEdit, onSubmit, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {isEdit ? t('admin.crm.contacts.edit_contact') : t('admin.crm.contacts.new_contact')}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.crm.contacts.columns.name')} *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.crm.contacts.columns.email')} *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.crm.contacts.columns.phone')}
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.crm.contacts.details.position')}
            </label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loadingAction}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loadingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {t('common.save')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Search and Create */}
      <div className="bg-white p-4 rounded-lg shadow border flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('admin.crm.contacts.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <button
          onClick={() => { setFormData({ name: '', email: '', phone: '', position: '', language: 'fr' }); setShowCreateModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          {t('admin.crm.contacts.new_contact')}
        </button>
      </div>

      {loading ? (
        <SkeletonTable rows={6} columns={6} />
      ) : !selectedItem ? (
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">{t('admin.crm.contacts.columns.name')}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">{t('admin.crm.contacts.columns.email')}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">{t('admin.crm.contacts.columns.phone')}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">{t('admin.crm.contacts.details.tags')}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">{t('admin.crm.contacts.columns.created')}</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">{t('admin.crm.common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {data.contacts?.length > 0 ? data.contacts.map(contact => (
                <tr key={contact._id || contact.contact_id} className="border-b hover:bg-gray-50">
                  <td 
                    className="px-4 py-3 cursor-pointer hover:text-blue-600"
                    onClick={() => navigate(`/admin/crm/contacts/${contact._id || contact.contact_id}`)}
                  >
                    {contact.name}
                  </td>
                  <td className="px-4 py-3">{contact.email}</td>
                  <td className="px-4 py-3">{contact.phone || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {contact.tags?.slice(0, 2).map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">{tag}</span>
                      ))}
                      {contact.tags?.length > 2 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">+{contact.tags.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{new Date(contact.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEmailContact(contact); setShowEmailModal(true); }}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                        title={t('admin.crm.emails.send')}
                      >
                        <Send className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); openEditModal(contact); }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                        title={t('common.edit')}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(contact._id || contact.contact_id); }}
                        disabled={loadingAction}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                        title={t('common.delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" className="px-4 py-12 text-center">
                  <div className="text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">{t('admin.crm.contacts.empty_title')}</p>
                    <p className="text-sm mt-1">{t('admin.crm.contacts.empty_subtitle')}</p>
                    <button
                      onClick={() => { setFormData({ name: '', email: '', phone: '', position: '', language: 'fr' }); setShowCreateModal(true); }}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      {t('admin.crm.contacts.new_contact')}
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
              <h2 className="text-2xl font-bold">{selectedItem.name}</h2>
              <p className="text-gray-600">{selectedItem.company_name || selectedItem.position}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleCreateOpportunity(selectedItem._id || selectedItem.contact_id)} 
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                disabled={loadingAction}
              >
                <Plus className="w-5 h-5" />
                {t('admin.crm.contacts.new_opportunity')}
              </button>
              <button onClick={() => openEditModal(selectedItem)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600">
                <Edit className="w-5 h-5" />
              </button>
              <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">{t('admin.crm.contacts.details.email')}</p>
                  <p className="font-medium">{selectedItem.email}</p>
                </div>
              </div>
              {selectedItem.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">{t('admin.crm.contacts.details.phone')}</p>
                    <p className="font-medium">{selectedItem.phone}</p>
                  </div>
                </div>
              )}
              {selectedItem.position && (
                <div className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">{t('admin.crm.contacts.details.position')}</p>
                    <p className="font-medium">{selectedItem.position}</p>
                  </div>
                </div>
              )}
              {selectedItem.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">{t('admin.crm.contacts.details.location')}</p>
                    <p className="font-medium">{selectedItem.location}</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              {selectedItem.tags && selectedItem.tags.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">{t('admin.crm.contacts.details.tags')}</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {selectedItem.converted_from_lead_id && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <p className="text-sm font-semibold text-green-900">{t('admin.crm.contacts.converted_from_lead')}</p>
              <p className="text-sm text-green-800 mt-1">{t('admin.crm.contacts.lead_id')}: {selectedItem.converted_from_lead_id}</p>
            </div>
          )}

          <div className="mt-6 border-t pt-6">
            <h3 className="font-semibold mb-4">{t('admin.crm.contacts.recent_activities')}</h3>
            <div className="space-y-2">
              {selectedItem.activities?.slice(0, 5).map((activity, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium">{activity.type}</p>
                  <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(activity.created_at).toLocaleString()}</p>
                </div>
              )) || <p className="text-gray-500 text-sm">{t('admin.crm.common.no_activities')}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <ContactModal 
          isEdit={false} 
          onSubmit={handleCreate} 
          onClose={() => setShowCreateModal(false)} 
        />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <ContactModal 
          isEdit={true} 
          onSubmit={handleEdit} 
          onClose={() => { setShowEditModal(false); setEditingContact(null); }} 
        />
      )}

      {/* Email Modal */}
      {showEmailModal && emailContact && (
        <EmailModal 
          contact={emailContact}
          onClose={() => { setShowEmailModal(false); setEmailContact(null); }}
          t={t}
          language={i18n?.language || 'fr'}
        />
      )}
    </div>
  );
};

export default ContactsTab;
