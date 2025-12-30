import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Mail, Phone, Building, MapPin, X, Loader2, Plus, Users } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';

const ContactsTab = ({ data, selectedItem, setSelectedItem, onRefresh, searchTerm, setSearchTerm, t }) => {
  const [loadingAction, setLoadingAction] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('admin.crm.contacts.search') || 'Search contacts...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      {!selectedItem ? (
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">{t('admin.crm.contacts.columns.name') || 'Name'}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">{t('admin.crm.contacts.columns.email') || 'Email'}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">{t('admin.crm.contacts.columns.phone') || 'Phone'}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">{t('admin.crm.contacts.columns.company') || 'Company'}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">{t('admin.crm.contacts.columns.created') || 'Created'}</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {data.contacts?.length > 0 ? data.contacts.map(contact => (
                <tr key={contact.contact_id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/admin/crm/contacts/${contact.contact_id}`)}>
                  <td className="px-4 py-3">{contact.name}</td>
                  <td className="px-4 py-3">{contact.email}</td>
                  <td className="px-4 py-3">{contact.phone || '-'}</td>
                  <td className="px-4 py-3">{contact.company_name || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{new Date(contact.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><button className="text-blue-600 hover:underline text-sm">{t('admin.crm.common.view') || 'View'}</button></td>
                </tr>
              )) : (
                <tr><td colSpan="6" className="px-4 py-12 text-center">
                  <div className="text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">{t('admin.crm.contacts.empty_title') || 'No contacts yet'}</p>
                    <p className="text-sm mt-1">{t('admin.crm.contacts.empty_subtitle') || 'Contacts appear here when you convert leads'}</p>
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
              <p className="text-gray-600">{selectedItem.company_name}</p>
            </div>
            <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">{t('admin.crm.contacts.details.email') || 'Email'}</p>
                  <p className="font-medium">{selectedItem.email}</p>
                </div>
              </div>
              {selectedItem.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">{t('admin.crm.contacts.details.phone') || 'Phone'}</p>
                    <p className="font-medium">{selectedItem.phone}</p>
                  </div>
                </div>
              )}
              {selectedItem.position && (
                <div className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">{t('admin.crm.contacts.details.position') || 'Position'}</p>
                    <p className="font-medium">{selectedItem.position}</p>
                  </div>
                </div>
              )}
              {selectedItem.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">{t('admin.crm.contacts.details.location') || 'Location'}</p>
                    <p className="font-medium">{selectedItem.location}</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              {selectedItem.tags && selectedItem.tags.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">{t('admin.crm.contacts.details.tags') || 'Tags'}</p>
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
              <p className="text-sm font-semibold text-green-900">{t('admin.crm.contacts.converted_from_lead') || 'Converted from Lead'}</p>
              <p className="text-sm text-green-800 mt-1">{t('admin.crm.contacts.lead_id') || 'Lead ID'}: {selectedItem.converted_from_lead_id}</p>
            </div>
          )}

          <div className="mt-6 border-t pt-6">
            <h3 className="font-semibold mb-4">{t('admin.crm.contacts.recent_activities') || 'Recent Activities'}</h3>
            <div className="space-y-2">
              {selectedItem.activities?.slice(0, 5).map((activity, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium">{activity.type}</p>
                  <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(activity.created_at).toLocaleString()}</p>
                </div>
              )) || <p className="text-gray-500 text-sm">{t('admin.crm.common.no_activities') || 'No activities yet'}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsTab;
