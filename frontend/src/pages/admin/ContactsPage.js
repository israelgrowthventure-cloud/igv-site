import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import ContactsTab from '../../components/crm/ContactsTab';
import api from '../../utils/api';
import { toast } from 'sonner';

/**
 * ContactsPage - Page dédiée à la gestion des contacts
 * Charge ses propres données et les passe à ContactsTab
 */
const ContactsPage = () => {
  const { t } = useTranslation();
  const [data, setData] = useState({ contacts: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    loadContacts();
  }, [searchTerm]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/crm/contacts', {
        params: { search: searchTerm, limit: 50 }
      });
      setData({
        contacts: Array.isArray(response?.contacts) ? response.contacts : [],
        total: response?.total || 0
      });
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast.error(t('admin.crm.errors.load_failed', 'Erreur de chargement'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {t('crm.nav.contacts', 'Contacts')}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {t('crm.contacts.subtitle', 'Gérez vos contacts clients')}
        </p>
      </div>

      <ContactsTab 
        data={data}
        loading={loading}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        onRefresh={loadContacts}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        t={t} 
      />
    </div>
  );
};

export default ContactsPage;
