import React from 'react';
import { useTranslation } from 'react-i18next';
import ContactsTab from '../../components/crm/ContactsTab';

/**
 * ContactsPage - Page dédiée à la gestion des contacts
 */
const ContactsPage = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {t('crm.nav.contacts', 'Contacts')}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {t('crm.contacts.subtitle', 'Gérez vos contacts clients')}
        </p>
      </div>

      <ContactsTab t={t} />
    </div>
  );
};

export default ContactsPage;
