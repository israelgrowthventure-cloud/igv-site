#!/usr/bin/env python3
"""Script to update LeadsPage.js to handle ?selected= parameter"""

LEADS_PAGE_JS = '''import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import LeadsTab from '../../components/crm/LeadsTab';
import api from '../../utils/api';
import { toast } from 'sonner';

/**
 * LeadsPage - Page for lead/prospect management
 * Loads its own data and passes it to LeadsTab
 * Supports ?selected=leadId to auto-open a specific lead
 */
const LeadsPage = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isRTL = i18n.language === 'he';

  const [data, setData] = useState({ leads: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [pendingSelection, setPendingSelection] = useState(null);

  // Check for ?selected= parameter and set pending selection
  useEffect(() => {
    const selectedId = searchParams.get('selected');
    if (selectedId) {
      setPendingSelection(selectedId);
      navigate('/admin/crm/leads', { replace: true });
    }
  }, [searchParams, navigate]);

  // Listen for custom event from Sidebar when clicking on Leads menu
  useEffect(() => {
    const handleResetView = () => {
      setSelectedItem(null);
      setPendingSelection(null);
    };

    window.addEventListener('resetLeadView', handleResetView);
    window.addEventListener('popstate', handleResetView);

    return () => {
      window.removeEventListener('resetLeadView', handleResetView);
      window.removeEventListener('popstate', handleResetView);
    };
  }, []);

  // Apply pending selection once data is loaded
  useEffect(() => {
    if (pendingSelection && data.leads.length > 0) {
      const leadToSelect = data.leads.find(lead => 
        lead._id === pendingSelection || 
        lead.id === pendingSelection ||
        (lead._id && lead._id.includes(pendingSelection)) ||
        (lead._id && pendingSelection.includes(lead._id.slice(-8)))
      );
      
      if (leadToSelect) {
        setSelectedItem(leadToSelect);
        setPendingSelection(null);
      } else {
        fetchSingleLead(pendingSelection);
      }
    }
  }, [pendingSelection, data.leads]);

  // Fetch a single lead by ID if not in list
  const fetchSingleLead = async (leadId) => {
    try {
      const response = await api.get('/api/crm/leads/' + leadId);
      if (response && response._id) {
        setSelectedItem(response);
        setPendingSelection(null);
      }
    } catch (error) {
      console.error('Error fetching lead:', error);
      toast.error(t('admin.crm.errors.lead_not_found') || 'Lead not found');
      setPendingSelection(null);
    }
  };

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
      toast.error(t('admin.crm.errors.load_failed'));
    } finally {
      setLoading(false);
    }
  };

  if (loading && !pendingSelection) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {t('admin.crm.leads.title')}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {t('admin.crm.leads.subtitle')}
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
'''

# Write to frontend directory
frontend_path = r"C:\Users\PC\Desktop\IGV\igv-frontend\src\pages\admin\LeadsPage.js"

with open(frontend_path, 'w', encoding='utf-8') as f:
    f.write(LEADS_PAGE_JS)
    
print(f"✓ LeadsPage.js updated at {frontend_path}")
