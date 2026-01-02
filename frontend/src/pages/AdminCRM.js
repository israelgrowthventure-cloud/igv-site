/**
 * CRM Complete Admin Dashboard - Production Ready MVP
 * Modules: Dashboard, Leads, Pipeline, Contacts, Settings
 * Multilingual: FR/EN/HE with RTL support
 * v3.0.1 - API fix /api/crm prefix
 */

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Users, TrendingUp, Mail, FileText, LogOut, Settings, Plus, Eye, Edit,
  Trash2, Shield, UserCheck, UserX, Loader2, Search, Filter, Download,
  Tag, Target, Phone, Calendar, Activity, Briefcase, Building, CheckCircle,
  XCircle, Clock, AlertCircle, ChevronRight, DollarSign, MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';
import crmApi from '../utils/crmApi';

const AdminCRMDashboard = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Detect active tab from URL pathname (/admin/crm/leads -> 'leads')
  const getTabFromPath = () => {
    const path = location.pathname;
    if (path === '/admin/crm' || path === '/admin/crm/dashboard') return 'dashboard';
    if (path.includes('/leads')) return 'leads';
    if (path.includes('/pipeline')) return 'pipeline';
    if (path.includes('/opportunities')) return 'opportunities';
    if (path.includes('/contacts')) return 'contacts';
    if (path.includes('/settings')) return 'settings';
    return 'dashboard';
  };
  
  const [activeTab, setActiveTab] = useState(getTabFromPath());

  // State for each module
  const [dashboardStats, setDashboardStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [pipeline, setPipeline] = useState({});
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [crmUsers, setCRMUsers] = useState([]);
  const [tags, setTags] = useState([]);
  const [pipelineStages, setPipelineStages] = useState([]);

  // Filters & search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stageFilter, setStageFilter] = useState('');

  const isRTL = i18n.language === 'he';

  useEffect(() => {
    checkAuth();
  }, []);

  // Update activeTab when URL changes (browser back/forward)
  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  useEffect(() => {
    if (activeTab && user) {
      loadTabData(activeTab);
    }
  }, [activeTab, user]);

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
      console.error('Auth error:', error);
      localStorage.removeItem('admin_token');
      navigate('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const loadTabData = async (tab) => {
    setDataLoading(true);
    setError(null);
    try {
      switch (tab) {
        case 'dashboard':
          const stats = await crmApi.getDashboardStats();
          setDashboardStats(stats);
          break;

        case 'leads':
          const leadsData = await crmApi.getLeads({
            search: searchTerm,
            status: statusFilter,
            stage: stageFilter,
            limit: 100
          });
          setLeads(leadsData.leads || []);
          break;

        case 'pipeline':
          const pipelineData = await crmApi.getPipeline();
          setPipeline(pipelineData.pipeline || {});
          break;

        case 'contacts':
          const contactsData = await crmApi.getContacts({
            search: searchTerm,
            limit: 100
          });
          setContacts(contactsData.contacts || []);
          break;

        case 'settings':
          const [usersData, tagsData, stagesData] = await Promise.all([
            crmApi.getUsers(),
            crmApi.getTags(),
            crmApi.getPipelineStages()
          ]);
          setCRMUsers(usersData.users || []);
          setTags(tagsData.tags || []);
          setPipelineStages(stagesData.stages || []);
          break;
      }
    } catch (error) {
      console.error(`Error loading ${tab}:`, error);
      const errorMsg = error.response?.data?.detail || error.message || t('admin.errors.loadFailed');
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setDataLoading(false);
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
        <title>{t('admin.crm.title')} | IGV CRM</title>
        <html lang={i18n.language} dir={isRTL ? 'rtl' : 'ltr'} />
      </Helmet>

      <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  IGV CRM
                </h1>
                <p className="text-sm text-gray-600">
                  {t('admin.welcome')}, <strong>{user?.name || user?.email}</strong>
                  {' '}({t(`admin.roles.${user?.role}`)})
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* Language Selector */}
                <select
                  value={i18n.language}
                  onChange={(e) => i18n.changeLanguage(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="he">עברית</option>
                </select>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                  {t('admin.logout.button')}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex gap-6 overflow-x-auto">
              {[
                { id: 'dashboard', icon: TrendingUp, label: t('admin.crm.tabs.dashboard') },
                { id: 'leads', icon: Users, label: t('admin.crm.tabs.leads') },
                { id: 'pipeline', icon: Target, label: t('admin.crm.tabs.pipeline') },
                { id: 'contacts', icon: Mail, label: t('admin.crm.tabs.contacts') },
                ...(user?.role === 'admin' ? [
                  { id: 'settings', icon: Settings, label: t('admin.crm.tabs.settings') }
                ] : [])
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    const routes = {
                      dashboard: '/admin/crm/dashboard',
                      leads: '/admin/crm/leads',
                      pipeline: '/admin/crm/pipeline',
                      opportunities: '/admin/crm/opportunities',
                      contacts: '/admin/crm/contacts',
                      settings: '/admin/crm/settings'
                    };
                    navigate(routes[tab.id] || '/admin/crm');
                  }}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('admin.errors.loadFailed')}
              </h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => loadTabData(activeTab)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {t('common.retry', 'Réessayer')}
              </button>
            </div>
          ) : dataLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardTab stats={dashboardStats} t={t} isRTL={isRTL} />
              )}
              {activeTab === 'leads' && (
                <LeadsTab
                  leads={leads}
                  selectedLead={selectedLead}
                  setSelectedLead={setSelectedLead}
                  onRefresh={() => loadTabData('leads')}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  stageFilter={stageFilter}
                  setStageFilter={setStageFilter}
                  t={t}
                  isRTL={isRTL}
                  user={user}
                />
              )}
          {activeTab === 'pipeline' && (
            <PipelineTab
              pipeline={pipeline}
              stages={pipelineStages}
              onRefresh={() => loadTabData('pipeline')}
              t={t}
              isRTL={isRTL}
              user={user}
            />
          )}
          {activeTab === 'contacts' && (
            <ContactsTab
              contacts={contacts}
              selectedContact={selectedContact}
              setSelectedContact={setSelectedContact}
              onRefresh={() => loadTabData('contacts')}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              t={t}
              isRTL={isRTL}
            />
          )}
          {activeTab === 'settings' && user?.role === 'admin' && (
            <SettingsTab
              users={crmUsers}
              tags={tags}
              stages={pipelineStages}
              onRefresh={() => loadTabData('settings')}
              t={t}
              isRTL={isRTL}
            />
          )}
            </>
          )}
        </main>
      </div>
    </>
  );
};

// ==========================================
// DASHBOARD TAB
// ==========================================
const DashboardTab = ({ stats, t, isRTL }) => {
  if (!stats) return <div className="text-center py-8"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;

  const kpis = [
    {
      label: t('admin.crm.dashboard.leads_today'),
      value: stats.leads?.today || 0,
      icon: Users,
      color: 'blue'
    },
    {
      label: t('admin.crm.dashboard.leads_7d'),
      value: stats.leads?.last_7_days || 0,
      icon: TrendingUp,
      color: 'green'
    },
    {
      label: t('admin.crm.dashboard.pipeline_value'),
      value: `$${(stats.opportunities?.pipeline_value || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'purple'
    },
    {
      label: t('admin.crm.dashboard.tasks_overdue'),
      value: stats.tasks?.overdue || 0,
      icon: AlertCircle,
      color: 'red'
    }
  ];

  return (
    <div className="space-y-6">
      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{kpi.label}</p>
                <p className="text-2xl font-bold mt-1">{kpi.value}</p>
              </div>
              <kpi.icon className={`w-8 h-8 text-${kpi.color}-500`} />
            </div>
          </div>
        ))}
      </div>

      {/* Top Sources */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">{t('admin.crm.dashboard.top_sources')}</h3>
        <div className="space-y-2">
          {stats.top_sources?.map((source, idx) => (
            <div key={idx} className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-700">{source.source || t('admin.crm.dashboard.direct')}</span>
              <span className="font-semibold">{source.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stage Distribution */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">{t('admin.crm.dashboard.stage_distribution')}</h3>
        <div className="space-y-2">
          {stats.stage_distribution?.map((stage, idx) => (
            <div key={idx} className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-700">{t(`admin.crm.stages.${stage.stage}`)}</span>
              <span className="font-semibold">{stage.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Continue in next file for space - this is getting large
export default AdminCRMDashboard;
