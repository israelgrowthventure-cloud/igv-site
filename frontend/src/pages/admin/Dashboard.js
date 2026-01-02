import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Users, TrendingUp, Mail, FileText, LogOut, Settings, 
  Plus, Eye, Edit, Trash2, Shield, UserCheck, UserX, Loader2, Target, ArrowRight 
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';

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
      // Use CRM API endpoints
      const token = localStorage.getItem('admin_token');
      const headers = { Authorization: `Bearer ${token}` };
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://igv-cms-backend.onrender.com';
      
      const [dashboardRes, leadsRes, contactsRes] = await Promise.all([
        fetch(`${backendUrl}/api/crm/dashboard/stats`, { headers }).then(r => r.json()),
        fetch(`${backendUrl}/api/crm/leads?limit=10`, { headers }).then(r => r.json()),
        fetch(`${backendUrl}/api/crm/contacts?limit=1`, { headers }).then(r => r.json()).catch(() => ({ total: 0 }))
      ]);
      
      // Map CRM dashboard stats to expected format
      const leadsData = dashboardRes.leads || {};
      const totalContacts = contactsRes.total || 0;
      const conversionRate = leadsData.total > 0 ? Math.round((totalContacts / leadsData.total) * 100) : 0;
      
      setStats({
        total_leads: leadsData.total || 0,
        total_contacts: totalContacts,
        total_analyses: leadsData.last_30_days || 0,
        conversion_rate: conversionRate
      });
      setLeads(leadsRes.leads || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error(t('admin.errors.loadFailed') || 'Failed to load data');
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
                  {t('admin.welcome')}, <strong>{user?.email}</strong> ({user?.role ? (t(`admin.roles.${user.role}`) || user.role) : 'Admin'})
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
            <nav className="flex gap-6">
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
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview' && <OverviewTab stats={stats} t={t} navigate={navigate} />}
          {activeTab === 'leads' && <LeadsTab leads={leads} t={t} navigate={navigate} />}
          {activeTab === 'contacts' && <ContactsTab t={t} navigate={navigate} />}
          {activeTab === 'users' && user?.role === 'admin' && <UsersTab t={t} />}
        </main>
      </div>
    </>
  );
};

// Overview Tab Component
const OverviewTab = ({ stats, t, navigate }) => (
  <div className="space-y-6">
    {/* Quick Access Buttons */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <button
        onClick={() => navigate('/admin/crm/pipeline')}
        className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition shadow-lg"
      >
        <div className="flex items-center gap-3">
          <Target className="w-6 h-6" />
          <span className="font-semibold">Pipeline</span>
        </div>
        <ArrowRight className="w-5 h-5" />
      </button>
      <button
        onClick={() => navigate('/admin/crm')}
        className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition shadow-lg"
      >
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6" />
          <span className="font-semibold">CRM Complet</span>
        </div>
        <ArrowRight className="w-5 h-5" />
      </button>
      <button
        onClick={() => navigate('/admin/crm?tab=contacts')}
        className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition shadow-lg"
      >
        <div className="flex items-center gap-3">
          <Mail className="w-6 h-6" />
          <span className="font-semibold">Contacts</span>
        </div>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {!stats ? (
        <>
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </>
      ) : (
        <>
          <StatCard
            icon={Users}
            label={t('admin.stats.totalLeads')}
            value={stats.total_leads}
            color="blue"
          />
          <StatCard
            icon={Mail}
            label={t('admin.stats.totalContacts')}
            value={stats.total_contacts}
            color="green"
          />
          <StatCard
            icon={FileText}
            label={t('admin.stats.analyses')}
            value={stats.total_analyses}
            color="purple"
          />
          <StatCard
            icon={TrendingUp}
            label={t('admin.stats.conversionRate')}
            value={`${stats.conversion_rate}%`}
            color="orange"
          />
        </>
      )}
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

const StatCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
    <div className="w-12 h-12 rounded-lg bg-gray-200 mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
    <div className="h-8 bg-gray-200 rounded w-16"></div>
  </div>
);

// Leads Tab Component
const LeadsTab = ({ leads, t, navigate }) => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
      <h2 className="text-xl font-bold text-gray-900">{t('admin.leads.title') || 'Liste des prospects'}</h2>
      <button 
        onClick={() => navigate('/admin/crm')}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
      >
        {t('admin.leads.viewAll') || 'Voir tout le CRM'}
      </button>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              {t('admin.leads.email') || 'Email'}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              {t('admin.leads.brand') || 'Marque'}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              {t('admin.leads.status') || 'Statut'}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              {t('admin.leads.date') || 'Date'}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              {t('admin.leads.actions') || 'Actions'}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {leads.map((lead, idx) => (
            <tr 
              key={idx} 
              className="hover:bg-blue-50 cursor-pointer transition-colors"
              onClick={() => navigate(`/admin/crm/leads/${lead._id}`)}
            >
              <td className="px-6 py-4 text-sm text-gray-900">{lead.email}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{lead.brand_name}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  lead.status === 'GENERATED' ? 'bg-green-100 text-green-800' :
                  lead.status === 'NEW' ? 'bg-blue-100 text-blue-800' :
                  lead.status === 'QUALIFIED' ? 'bg-purple-100 text-purple-800' :
                  lead.status === 'QUOTA_BLOCKED' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {lead.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {new Date(lead.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  {t('admin.leads.view') || 'Voir →'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Contacts Tab
const ContactsTab = ({ t, navigate }) => (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold text-gray-900">{t('admin.contacts.title') || 'Contacts'}</h2>
      <button 
        onClick={() => navigate('/admin/crm')}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
      >
        {t('admin.contacts.viewAll') || 'Gérer les contacts'}
      </button>
    </div>
    <p className="text-gray-600">{t('admin.contacts.comingSoon') || 'Accédez au CRM complet pour gérer vos contacts.'}</p>
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
