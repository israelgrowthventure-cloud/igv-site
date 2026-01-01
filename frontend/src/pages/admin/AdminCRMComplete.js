import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, Users, Target, Mail, Settings, LogOut, Search, Filter,
  Download, Plus, Eye, DollarSign, AlertCircle, X, Save, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';

const AdminCRMComplete = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});

  const isRTL = i18n.language === 'he';

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user && activeTab) {
      loadTabData();
    }
  }, [activeTab, user, searchTerm, filters]);

  const checkAuth = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    try {
      const response = await api.adminVerifyToken();
      setUser(response.user);
    } catch (error) {
      localStorage.removeItem('admin_token');
      navigate('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const loadTabData = async () => {
    try {
      switch (activeTab) {
        case 'dashboard':
          const stats = await api.get('/api/crm/dashboard/stats');
          setData(prev => ({ ...prev, stats }));
          break;
        case 'leads':
          const leads = await api.get('/api/crm/leads', { params: { search: searchTerm, ...filters, limit: 100 } });
          setData(prev => ({ ...prev, leads: leads.leads || [], total: leads.total }));
          break;
        case 'pipeline':
          const pipeline = await api.get('/api/crm/pipeline');
          setData(prev => ({ ...prev, pipeline: pipeline.pipeline || pipeline || {} }));
          break;
        case 'contacts':
          const contacts = await api.get('/api/crm/contacts', { params: { search: searchTerm, limit: 100 } });
          setData(prev => ({ ...prev, contacts: contacts.contacts || [], total: contacts.total }));
          break;
        case 'settings':
          const [users, tags, stages] = await Promise.all([
            api.get('/api/crm/settings/users'),
            api.get('/api/crm/settings/tags'),
            api.get('/api/crm/settings/pipeline-stages')
          ]);
          setData(prev => ({ ...prev, users: users.users || [], tags: tags.tags || [], stages: stages.stages || [] }));
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error(t('admin.crm.errors.load_failed') || 'Failed to load data');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    toast.success(t('admin.logout.success') || 'Logged out successfully');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>IGV CRM | {t('admin.crm.title') || 'CRM'}</title>
        <html lang={i18n.language} dir={isRTL ? 'rtl' : 'ltr'} />
      </Helmet>

      <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
        {/* Header */}
        <header className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">IGV CRM</h1>
                <p className="text-sm text-gray-600">
                  {user?.name || user?.email} • {user?.role ? (t(`admin.roles.${user.role}`) || user.role) : 'Admin'}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <select
                  value={i18n.language}
                  onChange={(e) => i18n.changeLanguage(e.target.value)}
                  className="px-3 py-2 border rounded-lg"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="he">עברית</option>
                </select>
                <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg">
                  <LogOut className="w-4 h-4" />
                  {t('admin.logout.button') || 'Logout'}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex gap-6 overflow-x-auto">
              {[
                { id: 'dashboard', icon: TrendingUp, label: t('admin.crm.tabs.dashboard') || 'Dashboard' },
                { id: 'leads', icon: Users, label: t('admin.crm.tabs.leads') || 'Leads' },
                { id: 'pipeline', icon: Target, label: t('admin.crm.tabs.pipeline') || 'Pipeline' },
                { id: 'contacts', icon: Mail, label: t('admin.crm.tabs.contacts') || 'Contacts' },
                ...(user?.role === 'admin' ? [{ id: 'settings', icon: Settings, label: t('admin.crm.tabs.settings') || 'Settings' }] : [])
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSelectedItem(null); }}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 whitespace-nowrap ${
                    activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-4 py-6">
          {activeTab === 'dashboard' && <DashboardTab data={data.stats} t={t} />}
          {activeTab === 'leads' && <LeadsTab data={data} selectedItem={selectedItem} setSelectedItem={setSelectedItem} onRefresh={loadTabData} searchTerm={searchTerm} setSearchTerm={setSearchTerm} filters={filters} setFilters={setFilters} t={t} />}
          {activeTab === 'pipeline' && <PipelineTab data={data.pipeline} onRefresh={loadTabData} t={t} />}
          {activeTab === 'contacts' && <ContactsTab data={data} selectedItem={selectedItem} setSelectedItem={setSelectedItem} onRefresh={loadTabData} searchTerm={searchTerm} setSearchTerm={setSearchTerm} t={t} />}
          {activeTab === 'settings' && user?.role === 'admin' && <SettingsTab data={data} onRefresh={loadTabData} t={t} />}
        </main>
      </div>
    </>
  );
};

// Dashboard Component
const DashboardTab = ({ data, t }) => {
  if (!data) return <div className="text-center py-8"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">{t('admin.crm.dashboard.leads_today') || 'Leads Today'}</p>
              <p className="text-3xl font-bold mt-1">{data.leads?.today || 0}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">{t('admin.crm.dashboard.leads_7d') || 'Last 7 Days'}</p>
              <p className="text-3xl font-bold mt-1">{data.leads?.last_7_days || 0}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">{t('admin.crm.dashboard.pipeline_value') || 'Pipeline Value'}</p>
              <p className="text-3xl font-bold mt-1">${(data.opportunities?.pipeline_value || 0).toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">{t('admin.crm.dashboard.tasks_overdue') || 'Tasks Overdue'}</p>
              <p className="text-3xl font-bold mt-1">{data.tasks?.overdue || 0}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="font-semibold mb-4">{t('admin.crm.dashboard.top_sources') || 'Top Sources'}</h3>
          <div className="space-y-2">
            {data.top_sources?.map((source, idx) => (
              <div key={idx} className="flex justify-between py-2 border-b">
                <span>{source.source || 'Direct'}</span>
                <span className="font-semibold">{source.count}</span>
              </div>
            )) || <p className="text-gray-500">No data</p>}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="font-semibold mb-4">{t('admin.crm.dashboard.stage_distribution') || 'Stage Distribution'}</h3>
          <div className="space-y-2">
            {data.stage_distribution?.map((stage, idx) => (
              <div key={idx} className="flex justify-between py-2 border-b">
                <span className="capitalize">{stage.stage?.replace(/_/g, ' ')}</span>
                <span className="font-semibold">{stage.count}</span>
              </div>
            )) || <p className="text-gray-500">No data</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

// Import tab components
import LeadsTab from '../../components/crm/LeadsTab';
import PipelineTab from '../../components/crm/PipelineTab';
import ContactsTab from '../../components/crm/ContactsTab';
import SettingsTab from '../../components/crm/SettingsTab';

export default AdminCRMComplete;
