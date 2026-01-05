import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import LeadsTab from '../../components/crm/LeadsTab';
import api from '../../utils/api';
import { toast } from 'sonner';

/**
 * LeadsPage - Page dédiée à la gestion des prospects
 * Charge ses propres données et les passe à LeadsTab
 */
const LeadsPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [data, setData] = useState({ leads: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);

  // Reset selectedItem when navigating back to leads list via menu
  useEffect(() => {
    if (location.pathname === '/admin/crm/leads') {
      setSelectedItem(null);
    }
  }, [location.pathname]);

  // Listen for custom event from Sidebar when clicking on Leads menu
  useEffect(() => {
    const handleResetView = () => {
      setSelectedItem(null);
    };
    
    window.addEventListener('resetLeadView', handleResetView);
    window.addEventListener('popstate', handleResetView);
    
    return () => {
      window.removeEventListener('resetLeadView', handleResetView);
      window.removeEventListener('popstate', handleResetView);
    };
  }, []);

  useEffect(() => {
    loadLeads();
  }, [searchTerm, filters]);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/crm/leads', {
        params: { search: searchTerm, ...filters, limit: 50 }
      });
      setData({
        leads: Array.isArray(response?.leads) ? response.leads : [],
        total: response?.total || 0
      });
    } catch (error) {
      console.error('Error loading leads:', error);
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
          {t('crm.nav.leads', 'Prospects')}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {t('crm.leads.subtitle', 'Gérez vos prospects et convertissez-les en contacts')}
        </p>
      </div>

      <LeadsTab 
        data={data} 
        loading={loading}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        onRefresh={loadLeads}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filters={filters}
        setFilters={setFilters}
        t={t} 
      />
    </div>
  );
};

export default LeadsPage;
