import React from 'react';
import { useTranslation } from 'react-i18next';
import UsersTab from '../../components/crm/UsersTab';

/**
 * UsersPage - Page dédiée à la gestion des utilisateurs
 */
const UsersPage = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {t('crm.nav.users', 'Utilisateurs')}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {t('crm.users.subtitle', 'Gérez les utilisateurs et leurs permissions')}
        </p>
      </div>

      <UsersTab t={t} />
    </div>
  );
};

export default UsersPage;
