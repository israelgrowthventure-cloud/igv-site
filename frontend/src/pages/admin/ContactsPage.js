import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState({ contacts: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [pendingSelectedId, setPendingSelectedId] = useState(null);

  // Check for ?selected= URL parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const selectedId = searchParams.get('selected');
    if (selectedId) {
      setPendingSelectedId(parseInt(selectedId, 10));
      // Clear URL parameter after reading
      navigate('/admin/crm/contacts', { replace: true });
    }
  }, [location.search, navigate]);

  // Reset selectedItem when navigating back to contacts list via menu
  useEffect(() => {
    if (location.pathname === '/admin/crm/contacts' && !location.search) {
      // Don't reset if we just set pendingSelectedId
      if (!pendingSelectedId) {
        setSelectedItem(null);
      }
    }
  }, [location.pathname, location.search, pendingSelectedId]);

  // Listen for custom event from Sidebar when clicking on Contacts menu
  useEffect(() => {
    const handleResetView = () => {
      setSelectedItem(null);
    };
    
    window.addEventListener('resetContactView', handleResetView);
    window.addEventListener('popstate', handleResetView);
    
    return () => {
      window.removeEventListener('resetContactView', handleResetView);
      window.removeEventListener('popstate', handleResetView);
    };
  }, []);

  useEffect(() => {
    loadContacts();
  }, [searchTerm]);

  // Auto-select contact when data is loaded and we have a pendingSelectedId
  useEffect(() => {
    if (pendingSelectedId && data.contacts.length > 0 && !loading) {
      const contactToSelect = data.contacts.find(c => c.id === pendingSelectedId);
      if (contactToSelect) {
        setSelectedItem(contactToSelect);
      } else {
        // Contact not in current list, try to fetch it directly
        api.get(`/api/crm/contacts/${pendingSelectedId}`)
          .then(response => {
            if (response?.contact || response) {
              setSelectedItem(response.contact || response);
            }
          })
          .catch(err => {
            console.error('Could not fetch selected contact:', err);
            toast.error(t('admin.crm.errors.contact_not_found', 'Contact introuvable'));
          });
      }
      setPendingSelectedId(null);
    }
  }, [pendingSelectedId, data.contacts, loading, t]);

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
