import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, TrendingUp, Users, Target } from 'lucide-react';

/**
 * DashboardPage - Vue tableau de bord principal du CRM
 * Affiche les statistiques clés et les graphiques
 */
const DashboardPage = () => {
  const { t } = useTranslation();

  const stats = [
    {
      label: t('crm.dashboard.totalLeads', 'Total Prospects'),
      value: '0',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      label: t('crm.dashboard.totalContacts', 'Total Contacts'),
      value: '0',
      icon: Target,
      color: 'bg-green-500'
    },
    {
      label: t('crm.dashboard.totalOpportunities', 'Total Opportunités'),
      value: '0',
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
    {
      label: t('crm.dashboard.pipelineValue', 'Valeur Pipeline'),
      value: '0 €',
      icon: BarChart3,
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
        {stats.map((stat, index) => {
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

      {/* Recent Activity Placeholder */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {t('crm.dashboard.recentActivity', 'Activité récente')}
        </h2>
        <div className="text-center py-12 text-gray-500">
          <p>{t('crm.dashboard.noActivity', 'Aucune activité récente')}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
