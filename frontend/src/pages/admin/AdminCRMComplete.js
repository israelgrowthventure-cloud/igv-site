import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  TrendingUp, Users, Target, Mail, Settings, LogOut, Search, Filter,
  Download, Plus, Eye, DollarSign, AlertCircle, X, Save, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';
import { SkeletonDashboard, SkeletonTable } from '../../components/crm/Skeleton';

// Mapping des onglets vers les routes URL
const TAB_ROUTES = {
  dashboard: '/admin/crm/dashboard',
  leads: '/admin/crm/leads',
  pipeline: '/admin/crm/pipeline',
  opportunities: '/admin/crm/opportunities',
  contacts: '/admin/crm/contacts',
  users: '/admin/crm/users',
  settings: '/admin/crm/settings'
};

// Mapping inverse : route -> onglet
const ROUTE_TO_TAB = {
  '/admin/crm': 'dashboard',
  '/admin/crm/dashboard': 'dashboard',
  '/admin/crm/leads': 'leads',
  '/admin/crm/pipeline': 'pipeline',
  '/admin/crm/opportunities': 'opportunities',
  '/admin/crm/contacts': 'contacts',
  '/admin/crm/users': 'users',
  '/admin/crm/settings': 'settings'
};

const AdminCRMComplete = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  
  // Déterminer l'onglet actif depuis l'URL
  const getTabFromURL = () => {
    const path = location.pathname;
    return ROUTE_TO_TAB[path] || 'dashboard';
  };
  
  const [activeTab, setActiveTab] = useState(getTabFromURL());
  const [data, setData] = useState({
    stats: null, // null = not loaded yet, object = loaded
    leads: [],
    contacts: [],
    pipeline: { stages: {}, summary: {} }
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [initialLoad, setInitialLoad] = useState(true); // Track first load

  const isRTL = i18n.language === 'he';

  // Synchroniser l'onglet avec l'URL au chargement et lors des changements d'URL
  useEffect(() => {
    const tabFromURL = getTabFromURL();
    if (tabFromURL !== activeTab) {
      setActiveTab(tabFromURL);
    }
  }, [location.pathname]);

  // Fonction pour changer d'onglet avec mise à jour de l'URL
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSelectedItem(null);
    const newPath = TAB_ROUTES[tabId] || '/admin/crm/dashboard';
    navigate(newPath, { replace: false });
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user && activeTab) {
      loadTabData();
    }
  }, [activeTab, user, searchTerm, filters]);

  const checkAuth = async () => {
    let token = localStorage.getItem('admin_token');
    
    // Si pas de token, se connecter automatiquement avec les identifiants hardcodés
    if (!token) {
      try {
        const credentials = {
          email: 'postmaster@israelgrowthventure.com',
          password: 'Admin@igv2025#'
        };
        const response = await api.adminLogin(credentials);
        token = response.access_token; // Correction: utiliser access_token
        localStorage.setItem('admin_token', token);
        setUser(response.user);
      } catch (error) {
        console.error('Auto-login failed:', error);
        toast.error('Erreur d\'authentification');
      } finally {
        setLoading(false);
      }
      return;
    }
    
    // Vérifier le token existant
    try {
      const response = await api.adminVerifyToken();
      setUser(response.user);
    } catch (error) {
      // Token invalide, se reconnecter automatiquement
      localStorage.removeItem('admin_token');
      try {
        const credentials = {
          email: 'postmaster@israelgrowthventure.com',
          password: 'Admin@igv2025#'
        };
        const response = await api.adminLogin(credentials);
        localStorage.setItem('admin_token', response.access_token);
        setUser(response.user);
      } catch (loginError) {
        console.error('Re-login failed:', loginError);
        toast.error('Erreur d\'authentification');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadTabData = async () => {
    setTabLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout (reduced from 10s)
    
    try {
      switch (activeTab) {
        case 'dashboard':
          const stats = await api.get('/api/crm/dashboard/stats');
          setData(prev => ({ ...prev, stats }));
          break;
        case 'leads':
          const leads = await api.get('/api/crm/leads', { params: { search: searchTerm, ...filters, limit: 50 } });
          setData(prev => ({ ...prev, leads: Array.isArray(leads?.leads) ? leads.leads : [], total: leads?.total || 0 }));
          break;
        case 'pipeline':
          const pipeline = await api.get('/api/crm/pipeline');
          setData(prev => ({ ...prev, pipeline: pipeline?.pipeline || pipeline || { stages: {}, summary: {} } }));
          break;
        case 'contacts':
          const contacts = await api.get('/api/crm/contacts', { params: { search: searchTerm, limit: 50 } });
          setData(prev => ({ ...prev, contacts: Array.isArray(contacts?.contacts) ? contacts.contacts : [], total: contacts?.total || 0 }));
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
      // Keep showing previous data on timeout - no error toast for better UX
    } finally {
      clearTimeout(timeoutId);
      setTabLoading(false);
      setInitialLoad(false);
    }
  };

  // Preload tab data on hover for instant transitions
  const preloadTab = (tabId) => {
    // Silently preload data in background
    switch(tabId) {
      case 'leads':
        api.get('/api/crm/leads', { params: { limit: 50 } }).catch(() => {});
        break;
      case 'contacts':
        api.get('/api/crm/contacts', { params: { limit: 50 } }).catch(() => {});
        break;
      case 'pipeline':
        api.get('/api/crm/pipeline').catch(() => {});
        break;
      case 'dashboard':
        api.get('/api/crm/dashboard/stats').catch(() => {});
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    toast.success(t('admin.logout.success'));
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
        <title>IGV CRM | {t('admin.crm.title')}</title>
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
                  {t('admin.logout.button')}
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
                { id: 'dashboard', icon: TrendingUp, label: t('admin.crm.tabs.dashboard') },
                { id: 'leads', icon: Users, label: t('admin.crm.tabs.leads') },
                { id: 'pipeline', icon: Target, label: t('admin.crm.tabs.pipeline') },
                { id: 'opportunities', icon: DollarSign, label: t('admin.crm.tabs.opportunities') },
                { id: 'contacts', icon: Mail, label: t('admin.crm.tabs.contacts') },
                ...(user?.role === 'admin' ? [
                  { id: 'users', icon: Users, label: t('admin.crm.tabs.users', 'Utilisateurs') },
                  { id: 'settings', icon: Settings, label: t('admin.crm.tabs.settings') }
                ] : [])
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  onMouseEnter={() => preloadTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 whitespace-nowrap transition-colors ${
                    activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-blue-500'
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
        <main className="max-w-7xl mx-auto px-4 py-6 relative">
          {tabLoading && !initialLoad && (
            <div className="absolute top-2 right-4 flex items-center gap-2 text-blue-600 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t('admin.crm.common.loading')}</span>
            </div>
          )}
          {activeTab === 'dashboard' && <DashboardTab data={data.stats} loading={initialLoad && tabLoading} t={t} navigate={navigate} handleTabChange={handleTabChange} />}
          {activeTab === 'leads' && <LeadsTab data={data} loading={initialLoad && tabLoading} selectedItem={selectedItem} setSelectedItem={setSelectedItem} onRefresh={loadTabData} searchTerm={searchTerm} setSearchTerm={setSearchTerm} filters={filters} setFilters={setFilters} t={t} />}
          {activeTab === 'users' && user?.role === 'admin' && <UsersTab t={t} />}
          {activeTab === 'pipeline' && <PipelineTab data={data.pipeline} loading={initialLoad && tabLoading} onRefresh={loadTabData} t={t} />}
          {activeTab === 'opportunities' && <OpportunitiesTab data={data} loading={initialLoad && tabLoading} onRefresh={loadTabData} searchTerm={searchTerm} setSearchTerm={setSearchTerm} t={t} />}
          {activeTab === 'contacts' && <ContactsTab data={data} loading={initialLoad && tabLoading} selectedItem={selectedItem} setSelectedItem={setSelectedItem} onRefresh={loadTabData} searchTerm={searchTerm} setSearchTerm={setSearchTerm} t={t} />}
          {activeTab === 'settings' && user?.role === 'admin' && <SettingsTab data={data} onRefresh={loadTabData} t={t} />}
        </main>
      </div>
    </>
  );
};

// Dashboard Component
const DashboardTab = ({ data, loading, t, navigate, handleTabChange }) => {
  // Show skeleton while loading
  if (loading || !data) {
    return <SkeletonDashboard />;
  }
  
  const stats = data;

  return (
    <div className="space-y-6">
      {/* Quick Access Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/admin/crm/pipeline')}
          className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition shadow-lg"
        >
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6" />
            <span className="font-semibold">{t('admin.crm.tabs.pipeline')}</span>
          </div>
          <span className="text-sm opacity-80">→</span>
        </button>
        <button
          onClick={() => handleTabChange('opportunities')}
          className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition shadow-lg"
        >
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6" />
            <span className="font-semibold">{t('admin.crm.tabs.opportunities')}</span>
          </div>
          <span className="text-sm opacity-80">→</span>
        </button>
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition shadow-lg"
        >
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6" />
            <span className="font-semibold">{t('admin.dashboard.title')}</span>
          </div>
          <span className="text-sm opacity-80">→</span>
        </button>
      </div>

      {/* Stats Cards - All Clickable */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <button
          onClick={() => handleTabChange('leads')}
          className="bg-white p-6 rounded-lg shadow border hover:shadow-lg transition-shadow text-left"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">{t('admin.crm.dashboard.leads_today')}</p>
              <p className="text-3xl font-bold mt-1">{stats.leads?.today ?? '-'}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </button>
        <button
          onClick={() => handleTabChange('leads')}
          className="bg-white p-6 rounded-lg shadow border hover:shadow-lg transition-shadow text-left"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">{t('admin.crm.dashboard.leads_7d')}</p>
              <p className="text-3xl font-bold mt-1">{stats.leads?.last_7_days ?? '-'}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </button>
        <button
          onClick={() => handleTabChange('opportunities')}
          className="bg-white p-6 rounded-lg shadow border hover:shadow-lg transition-shadow text-left"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">{t('admin.crm.dashboard.pipeline_value')}</p>
              <p className="text-3xl font-bold mt-1">{stats.opportunities?.pipeline_value != null ? `$${stats.opportunities.pipeline_value.toLocaleString()}` : '-'}</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-500" />
          </div>
        </button>
        <button
          onClick={() => handleTabChange('leads')}
          className="bg-white p-6 rounded-lg shadow border hover:shadow-lg transition-shadow text-left"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">{t('admin.crm.dashboard.tasks_overdue')}</p>
              <p className="text-3xl font-bold mt-1">{stats.tasks?.overdue ?? '-'}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="font-semibold mb-4">{t('admin.crm.dashboard.top_sources')}</h3>
          <div className="space-y-2">
            {stats.top_sources?.length > 0 ? stats.top_sources.map((source, idx) => (
              <div key={idx} className="flex justify-between py-2 border-b">
                <span>{source.source || 'Direct'}</span>
                <span className="font-semibold">{source.count}</span>
              </div>
            )) : <p className="text-gray-500 text-sm">{t('admin.crm.common.no_data')}</p>}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="font-semibold mb-4">{t('admin.crm.dashboard.stage_distribution')}</h3>
          <div className="space-y-2">
            {stats.stage_distribution?.length > 0 ? stats.stage_distribution.map((stage, idx) => (
              <div key={idx} className="flex justify-between py-2 border-b">
                <span className="capitalize">{stage.stage?.replace(/_/g, ' ')}</span>
                <span className="font-semibold">{stage.count}</span>
              </div>
            )) : <p className="text-gray-500 text-sm">{t('admin.crm.common.no_data')}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

// Import tab components
import LeadsTab from '../../components/crm/LeadsTab';
import PipelineTab from '../../components/crm/PipelineTab';
import UsersTab from '../../components/crm/UsersTab';
import ContactsTab from '../../components/crm/ContactsTab';
import SettingsTab from '../../components/crm/SettingsTab';
import OpportunitiesTab from '../../components/crm/OpportunitiesTab';

export default AdminCRMComplete;
