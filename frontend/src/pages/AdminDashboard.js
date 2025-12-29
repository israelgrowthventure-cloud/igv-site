import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Users, TrendingUp, Mail, FileText, LogOut, Settings, 
  Plus, Eye, Edit, Trash2, Shield, UserCheck, UserX, Loader2 
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';

const AdminDashboard = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateUser, setShowCreateUser] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    try {
      const response = await api.adminVerifyToken();
      setUser(response.user);
      loadDashboardData();
    } catch (error) {
      console.error('Auth error:', error);
      localStorage.removeItem('admin_token');
      navigate('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      const [statsData, leadsData] = await Promise.all([
        api.getAdminStats(),
        api.getLeads({ limit: 10 })
      ]);
      
      setStats(statsData);
      setLeads(leadsData.leads || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error(t('admin.errors.loadFailed'));
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
        <title>{t('admin.dashboard.title')} | IGV Admin</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {t('admin.dashboard.title')}
                </h1>
                <p className="text-sm text-gray-600">
                  {t('admin.welcome')}, <strong>{user?.email}</strong> ({t(`admin.roles.${user?.role}`)})
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
            <nav className="flex gap-6 items-center">
              {[
                { id: 'overview', icon: TrendingUp, label: t('admin.tabs.overview') },
                { id: 'leads', icon: Users, label: t('admin.tabs.leads') },
                { id: 'contacts', icon: Mail, label: t('admin.tabs.contacts') },
                ...(user?.role === 'admin' ? [{ id: 'users', icon: Shield, label: t('admin.tabs.users') }] : [])
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
              
              {/* CRM Full Link */}
              <button
                onClick={() => navigate('/admin/crm')}
                className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Settings className="w-4 h-4" />
                {t('admin.tabs.fullCRM') || 'CRM Complet'}
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview' && <OverviewTab stats={stats} t={t} navigate={navigate} />}
          {activeTab === 'leads' && <LeadsTab leads={leads} t={t} />}
          {activeTab === 'contacts' && <ContactsTab t={t} />}
          {activeTab === 'users' && user?.role === 'admin' && <UsersTab t={t} />}
        </main>
      </div>
    </>
  );
};

// Overview Tab Component
const OverviewTab = ({ stats, t, navigate }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        icon={Users}
        label={t('admin.stats.totalLeads')}
        value={stats?.total_leads || 0}
        color="blue"
      />
      <StatCard
        icon={Mail}
        label={t('admin.stats.totalContacts')}
        value={stats?.total_contacts || 0}
        color="green"
      />
      <StatCard
        icon={FileText}
        label={t('admin.stats.analyses')}
        value={stats?.total_analyses || 0}
        color="purple"
      />
      <StatCard
        icon={TrendingUp}
        label={t('admin.stats.conversionRate')}
        value={`${stats?.conversion_rate || 0}%`}
        color="orange"
      />
    </div>
    
    {/* Quick Actions */}
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">{t('admin.quickActions') || 'Actions rapides'}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/admin/crm')}
          className="flex items-center gap-3 p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition"
        >
          <Users className="w-5 h-5 text-blue-600" />
          <span>{t('admin.actions.manageCRM') || 'Gérer le CRM'}</span>
        </button>
        <button
          onClick={() => navigate('/admin/crm?tab=leads')}
          className="flex items-center gap-3 p-4 border rounded-lg hover:bg-green-50 hover:border-green-300 transition"
        >
          <TrendingUp className="w-5 h-5 text-green-600" />
          <span>{t('admin.actions.viewLeads') || 'Voir les prospects'}</span>
        </button>
        <button
          onClick={() => navigate('/admin/crm?tab=pipeline')}
          className="flex items-center gap-3 p-4 border rounded-lg hover:bg-purple-50 hover:border-purple-300 transition"
        >
          <FileText className="w-5 h-5 text-purple-600" />
          <span>{t('admin.actions.viewPipeline') || 'Pipeline des ventes'}</span>
        </button>
      </div>
    </div>
  </div>
);

const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className={`w-12 h-12 rounded-lg ${colors[color]} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

// Leads Tab Component
const LeadsTab = ({ leads, t }) => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
    <div className="p-6 border-b border-gray-200">
      <h2 className="text-xl font-bold text-gray-900">{t('admin.leads.title')}</h2>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              {t('admin.leads.email')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              {t('admin.leads.brand')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              {t('admin.leads.status')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              {t('admin.leads.date')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {leads.map((lead, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm text-gray-900">{lead.email}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{lead.brand_name}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  lead.status === 'GENERATED' ? 'bg-green-100 text-green-800' :
                  lead.status === 'NEW' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {lead.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {new Date(lead.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Contacts Tab (placeholder)
const ContactsTab = ({ t }) => (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <h2 className="text-xl font-bold text-gray-900 mb-4">{t('admin.contacts.title')}</h2>
    <p className="text-gray-600">{t('admin.contacts.comingSoon')}</p>
  </div>
);

// Users Tab (Admin only)
const UsersTab = ({ t }) => (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-bold text-gray-900">{t('admin.users.title')}</h2>
      <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        <Plus className="w-4 h-4" />
        {t('admin.users.createUser')}
      </button>
    </div>
    <p className="text-gray-600">{t('admin.users.comingSoon')}</p>
  </div>
);

export default AdminDashboard;
