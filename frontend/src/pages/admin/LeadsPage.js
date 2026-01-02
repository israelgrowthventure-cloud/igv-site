import React from 'react';
import { useTranslation } from 'react-i18next';
import LeadsTab from '../../components/crm/LeadsTab';

/**
 * LeadsPage - Page dédiée à la gestion des prospects
 */
const LeadsPage = () => {
  const { t } = useTranslation();

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

      <LeadsTab t={t} />
    </div>
  );
};

export default LeadsPage;
