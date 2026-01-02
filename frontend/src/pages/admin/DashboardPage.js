import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, TrendingUp, Users, Target, Loader2 } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';

/**
 * DashboardPage - Vue tableau de bord principal du CRM
 * Affiche les statistiques clés et les graphiques
 */
const DashboardPage = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/crm/dashboard/stats');
      setStats(data);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
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

  const statCards = [
    {
      label: t('crm.dashboard.totalLeads', 'Total Prospects'),
      value: stats?.leads?.total || '0',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      label: t('crm.dashboard.leadsToday', 'Prospects Aujourd\'hui'),
      value: stats?.leads?.today || '0',
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      label: t('crm.dashboard.pipelineValue', 'Valeur Pipeline'),
      value: stats?.opportunities?.pipeline_value 
        ? `${stats.opportunities.pipeline_value.toLocaleString()} €` 
        : '0 €',
      icon: BarChart3,
      color: 'bg-purple-500'
    },
    {
      label: t('crm.dashboard.totalOpportunities', 'Total Opportunités'),
      value: stats?.opportunities?.total || '0',
      icon: Target,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {t('crm.dashboard.title', 'Tableau de bord')}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {t('crm.dashboard.subtitle', 'Vue d\'ensemble de votre activité CRM')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {t('crm.dashboard.topSources', 'Top Sources')}
          </h2>
          {stats?.top_sources?.length > 0 ? (
            <div className="space-y-2">
              {stats.top_sources.map((source, idx) => (
                <div key={idx} className="flex justify-between py-2 border-b">
                  <span>{source.source || 'Direct'}</span>
                  <span className="font-semibold">{source.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>{t('crm.dashboard.noData', 'Aucune donnée')}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {t('crm.dashboard.stageDistribution', 'Distribution par étape')}
          </h2>
          {stats?.stage_distribution?.length > 0 ? (
            <div className="space-y-2">
              {stats.stage_distribution.map((stage, idx) => (
                <div key={idx} className="flex justify-between py-2 border-b">
                  <span className="capitalize">{stage.stage?.replace(/_/g, ' ')}</span>
                  <span className="font-semibold">{stage.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>{t('crm.dashboard.noData', 'Aucune donnée')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
